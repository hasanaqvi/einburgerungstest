#!/usr/bin/env python3
"""
Generates prompt files you can paste into Claude.ai to produce contexts.ts
without needing an API key.

Usage:
  python scripts/export_for_claude.py

Writes 3 prompt files to scripts/prompts/:
  batch_1.txt  (questions 1–~103)
  batch_2.txt  (questions ~104–~206)
  batch_3.txt  (questions ~207–310)

Instructions:
  1. Open claude.ai in your browser.
  2. Paste the contents of batch_1.txt and send it.
  3. Copy the entire TypeScript output Claude returns.
  4. Repeat for batch_2.txt and batch_3.txt.
  5. Run:  python scripts/merge_contexts.py  to combine the 3 outputs
     into src/data/contexts.ts.
     (Or paste the 3 outputs manually into one file.)
"""

import re
import os

QUESTIONS_FILE = "src/data/questions.ts"
OUTPUT_DIR = "scripts/prompts"

INSTRUCTIONS = """\
You are helping populate a German citizenship test (Einbürgerungstest) study app.

For each question below I have provided:
  - The question ID
  - The German question text
  - The correct answer (in German)

Your task: for EVERY question, write exactly 2–3 concise sentences in English \
that help a learner remember the correct answer. Focus on historical background, \
the legal basis, or a specific memorable fact. Be accurate and specific.

Output ONLY a TypeScript object literal in this exact format — no explanation, \
no markdown fences, just the raw TypeScript:

export const contexts: Record<number, string> = {
  1: "...",
  2: "...",
};

Questions:

"""


def parse_questions(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    questions = []
    id_matches = list(re.finditer(r"\n\s*id:\s*(\d+),", content))

    for i, m in enumerate(id_matches):
        start = m.start()
        end = id_matches[i + 1].start() if i + 1 < len(id_matches) else len(content)
        block = content[start:end]

        qid = int(m.group(1))

        opts_split = block.split("opts:")
        if len(opts_split) < 2:
            continue

        pre_opts = opts_split[0]
        opts_section = opts_split[1]

        de_m = re.search(r'de:\s*"((?:[^"\\]|\\.)*)"', pre_opts)
        if not de_m:
            continue
        question_de = de_m.group(1)

        ans_m = re.search(r"ans:\s*(\d+)", block)
        if not ans_m:
            continue
        ans = int(ans_m.group(1))

        opt_des = re.findall(r'{\s*de:\s*"((?:[^"\\]|\\.)*)"', opts_section)
        correct_answer = opt_des[ans] if ans < len(opt_des) else "?"

        questions.append({
            "id": qid,
            "de": question_de,
            "correct_answer": correct_answer,
        })

    return questions


def format_batch(questions):
    lines = [INSTRUCTIONS]
    for q in questions:
        lines.append(f"ID {q['id']}")
        lines.append(f"Question: {q['de']}")
        lines.append(f"Correct answer: {q['correct_answer']}")
        lines.append("")
    return "\n".join(lines)


def main():
    print(f"Parsing {QUESTIONS_FILE}...")
    questions = parse_questions(QUESTIONS_FILE)
    print(f"Found {len(questions)} questions.")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    batch_size = (len(questions) + 2) // 3
    batches = [
        questions[:batch_size],
        questions[batch_size : batch_size * 2],
        questions[batch_size * 2 :],
    ]

    for idx, batch in enumerate(batches, 1):
        path = os.path.join(OUTPUT_DIR, f"batch_{idx}.txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(format_batch(batch))
        first_id = batch[0]["id"]
        last_id = batch[-1]["id"]
        print(f"  {path}  ({len(batch)} questions, IDs {first_id}–{last_id})")

    print(f"\nNext steps:")
    print(f"  1. Open claude.ai")
    print(f"  2. Paste each batch file's contents and send")
    print(f"  3. Copy Claude's TypeScript output for each batch")
    print(f"  4. Save each output as scripts/prompts/output_1.ts, output_2.ts, output_3.ts")
    print(f"  5. Run:  python scripts/merge_contexts.py")


if __name__ == "__main__":
    main()
