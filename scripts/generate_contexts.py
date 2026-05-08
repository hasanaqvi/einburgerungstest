#!/usr/bin/env python3
"""
Generate 2-3 sentence contextual explanations for all citizenship test questions.

Usage:
  pip install anthropic
  ANTHROPIC_API_KEY=sk-ant-... python scripts/generate_contexts.py

Writes output to src/data/contexts.ts.
"""

import re
import os
import json
import time
import sys
import anthropic

QUESTIONS_FILE = "src/data/questions.ts"
OUTPUT_FILE = "src/data/contexts.ts"
MODEL = "claude-haiku-4-5-20251001"


def parse_questions(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    questions = []

    # Find all id: N positions to slice question blocks between them
    id_matches = list(re.finditer(r"\n\s*id:\s*(\d+),", content))

    for i, m in enumerate(id_matches):
        start = m.start()
        end = id_matches[i + 1].start() if i + 1 < len(id_matches) else len(content)
        block = content[start:end]

        qid = int(m.group(1))

        # Split block at 'opts:' to isolate question text from option text
        opts_split = block.split("opts:")
        if len(opts_split) < 2:
            continue

        pre_opts = opts_split[0]
        opts_section = opts_split[1]

        # Extract question de from the part before opts
        de_m = re.search(r'de:\s*"((?:[^"\\]|\\.)*)"', pre_opts)
        if not de_m:
            continue
        question_de = de_m.group(1)

        # Extract ans index
        ans_m = re.search(r"ans:\s*(\d+)", block)
        if not ans_m:
            continue
        ans = int(ans_m.group(1))

        # Extract option de values in order
        opt_des = re.findall(r'{\s*de:\s*"((?:[^"\\]|\\.)*)"', opts_section)

        correct_answer = opt_des[ans] if ans < len(opt_des) else "?"

        questions.append({
            "id": qid,
            "de": question_de,
            "correct_answer": correct_answer,
        })

    return questions


def generate_context(client, question_de, correct_answer):
    message = client.messages.create(
        model=MODEL,
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": (
                    "This is a question from the German citizenship test (Einbürgerungstest).\n\n"
                    f"Question: {question_de}\n"
                    f"Correct answer: {correct_answer}\n\n"
                    "Write 2-3 concise sentences in English that help a learner remember this answer. "
                    "Focus on the historical background, the legal basis, or a specific memorable fact. "
                    "Be accurate and specific — avoid vague statements."
                ),
            }
        ],
    )
    return message.content[0].text.strip()


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    print(f"Parsing questions from {QUESTIONS_FILE}...")
    questions = parse_questions(QUESTIONS_FILE)
    print(f"Found {len(questions)} questions.\n")

    client = anthropic.Anthropic(api_key=api_key)
    contexts = {}

    for idx, q in enumerate(questions, 1):
        print(f"[{idx}/{len(questions)}] Question {q['id']}...", end=" ", flush=True)
        try:
            ctx = generate_context(client, q["de"], q["correct_answer"])
            contexts[q["id"]] = ctx
            print("done")
        except Exception as e:
            print(f"ERROR: {e}")
            contexts[q["id"]] = ""
        # Respect API rate limits
        time.sleep(0.3)

    # Write output file
    lines = ["export const contexts: Record<number, string> = {"]
    for qid in sorted(contexts.keys()):
        escaped = json.dumps(contexts[qid])
        lines.append(f"  {qid}: {escaped},")
    lines.append("};\n")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\nDone. Written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
