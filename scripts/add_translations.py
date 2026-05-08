#!/usr/bin/env python3
"""Apply English translations to all en: '' fields in questions.ts"""

import re

# (question_en, [opt0_en, opt1_en, opt2_en, opt3_en])
TRANSLATIONS = {
1: ("In Germany, people may openly say something against the government because …", [
    "freedom of religion applies here.",
    "people pay taxes.",
    "people have the right to vote.",
    "freedom of opinion applies here.",
]),
2: ("In Germany, parents can decide until their child turns 14 whether it participates in … class at school.", [
    "history class.",
    "religious education class.",
    "politics class.",
    "language class.",
]),
3: ("Germany is a constitutional state (Rechtsstaat). What does this mean?", [
    "All residents and the state must abide by the laws.",
    "The state does not have to comply with the laws.",
    "Only Germans have to follow the laws.",
    "The courts make the laws.",
]),
4: ("Which right is one of the fundamental rights (Grundrechte) in Germany?", [
    "gun ownership",
    "right of the stronger",
    "freedom of opinion",
    "vigilante justice",
]),
5: ("Elections in Germany are free. What does that mean?", [
    "You may accept money in exchange for voting for a specific candidate.",
    "Only people who have never been in prison are allowed to vote.",
    "Voters may not be influenced or forced to cast a particular vote and must not face any disadvantage as a result of voting.",
    "All eligible voters must vote.",
]),
6: ("What is the German constitution called?", [
    "People's Law",
    "Federal Law",
    "German Law",
    "Basic Law (Grundgesetz)",
]),
7: ("Which right is one of the fundamental rights guaranteed by the German constitution? The right to …", [
    "freedom of belief and conscience",
    "entertainment",
    "work",
    "housing",
]),
8: ("What is NOT in Germany's Basic Law (Grundgesetz)?", [
    "Human dignity is inviolable.",
    "Everyone should have the same amount of money.",
    "Every person may express their opinion.",
    "Everyone is equal before the law.",
]),
9: ("Which fundamental right in Germany applies ONLY to foreigners? The fundamental right to …", [
    "protection of the family",
    "human dignity",
    "asylum",
    "freedom of opinion",
]),
10: ("What is compatible with the German Basic Law?", [
    "corporal punishment",
    "torture",
    "the death penalty",
    "a financial penalty (fine)",
]),
11: ("What is the constitution of the Federal Republic of Germany called?", [
    "Basic Law (Grundgesetz)",
    "Federal Constitution",
    "Code of Laws",
    "Constitutional Treaty",
]),
12: ("A party in the German Bundestag wants to abolish freedom of the press. Is that possible?", [
    "Yes, if more than half of the members of parliament vote for it.",
    "Yes, but two thirds of the members of parliament must be in favour.",
    "No, because freedom of the press is a fundamental right. It cannot be abolished.",
    "No, because only the Bundesrat can abolish freedom of the press.",
]),
13: ("In parliament, the term 'opposition' refers to …", [
    "the governing parties.",
    "the parliamentary group with the most members.",
    "all parties that cleared the 5% threshold in the last election.",
    "all members of parliament who do not belong to the governing party/parties.",
]),
14: ("Freedom of opinion in Germany means that I …", [
    "may insult passers-by on the street.",
    "can express my opinion on the internet.",
    "may publicly display Nazi, Hamas or Islamic State symbols.",
    "may only express my opinion as long as I do not contradict the government.",
]),
15: ("What does the German Basic Law prohibit?", [
    "military service",
    "forced labour",
    "free choice of profession",
    "working abroad",
]),
16: ("When is freedom of opinion restricted in Germany?", [
    "when publicly spreading false claims about individuals",
    "when expressing opinions about the federal government",
    "when discussing religions",
    "when criticising the state",
]),
17: ("German laws prohibit …", [
    "freedom of opinion of residents.",
    "petitions by citizens.",
    "freedom of assembly of residents.",
    "unequal treatment of citizens by the state.",
]),
18: ("Which fundamental right is guaranteed in Article 1 of the Basic Law of the Federal Republic of Germany?", [
    "the inviolability of human dignity",
    "the right to life",
    "freedom of religion",
    "freedom of opinion",
]),
19: ("What is understood by the right of 'freedom of movement' (Freizügigkeit) in Germany?", [
    "You may choose your own place of residence.",
    "You can change your profession.",
    "You may decide in favour of another religion.",
    "You may move around in public wearing only light clothing.",
]),
20: ("A party in Germany pursues the goal of establishing a dictatorship. It is then …", [
    "tolerant.",
    "oriented towards the rule of law.",
    "law-abiding.",
    "unconstitutional.",
]),
21: ("Which is the coat of arms of the Federal Republic of Germany?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
22: ("What type of government does Germany have?", [
    "monarchy",
    "dictatorship",
    "republic",
    "principality",
]),
23: ("In Germany, most working people are …", [
    "employed in small family businesses.",
    "working voluntarily for a federal state.",
    "self-employed running their own company.",
    "employed by a company or public authority.",
]),
24: ("How many federal states does the Federal Republic of Germany have?", [
    "14",
    "15",
    "16",
    "17",
]),
25: ("What is NOT a federal state of the Federal Republic of Germany?", [
    "Alsace-Lorraine",
    "North Rhine-Westphalia",
    "Mecklenburg-Vorpommern",
    "Saxony-Anhalt",
]),
26: ("Germany is …", [
    "a communist republic.",
    "a democratic and social federal state.",
    "a capitalist and social monarchy.",
    "a social and socialist federal state.",
]),
27: ("Germany is …", [
    "a socialist state.",
    "a federal state.",
    "a dictatorship.",
    "a monarchy.",
]),
28: ("Who elects the members of parliament to the Bundestag in Germany?", [
    "the military",
    "the economy",
    "the eligible electorate",
    "the administration",
]),
29: ("Which animal is the heraldic animal of the Federal Republic of Germany?", [
    "lion",
    "eagle",
    "bear",
    "horse",
]),
30: ("What is NOT a feature of our democracy?", [
    "regular elections",
    "press censorship",
    "freedom of opinion",
    "various parties",
]),
31: ("The cooperation of parties to form a government is called in Germany …", [
    "unity.",
    "coalition.",
    "ministry.",
    "parliamentary group.",
]),
32: ("What is NOT a branch of state power in Germany?", [
    "legislation",
    "government",
    "the press",
    "the judiciary",
]),
33: ("Which statement is correct? In Germany …", [
    "state and religious communities are separated from each other.",
    "religious communities form the state.",
    "the state depends on the religious communities.",
    "state and religious communities form a unity.",
]),
34: ("What is Germany NOT?", [
    "a democracy",
    "a constitutional state",
    "a monarchy",
    "a welfare state",
]),
35: ("How does the German state finance social insurance?", [
    "church tax",
    "social contributions",
    "donations",
    "membership fees",
]),
36: ("Which measure creates social security in Germany?", [
    "health insurance",
    "car insurance",
    "building insurance",
    "liability insurance",
]),
37: ("What are the heads of government of most German federal states called?", [
    "First Minister",
    "Prime Minister",
    "Senator",
    "Minister-President (Ministerpräsident/in)",
]),
38: ("The Federal Republic of Germany is a democratic and social …", [
    "confederation of states.",
    "federal state.",
    "confederation.",
    "centralised state.",
]),
39: ("What does every German federal state have?", [
    "its own foreign minister",
    "its own currency",
    "its own army",
    "its own government",
]),
40: ("With what words does the German national anthem begin?", [
    "'Peoples, hear the signal …'",
    "'Unity and justice and freedom …'",
    "'Ode to joy, divine spark of beauty …'",
    "'Germany, united fatherland …'",
]),
41: ("Why is there more than one party in a democracy?", [
    "because the different opinions of citizens are thereby represented",
    "to limit corruption in politics",
    "to prevent political demonstrations",
    "to stimulate economic competition",
]),
42: ("Who decides on a new law in Germany?", [
    "the government",
    "the parliament",
    "the courts",
    "the police",
]),
43: ("When can a party be banned in Germany?", [
    "when its election campaign is too expensive",
    "when it fights against the constitution",
    "when it criticises the head of state",
    "when its programme proposes a new direction",
]),
44: ("Who cannot be directly elected by citizens in Germany?", [
    "Members of the European Parliament",
    "The Federal President",
    "State parliament members",
    "Bundestag members",
]),
45: ("To which insurance does nursing care insurance belong?", [
    "social insurance",
    "accident insurance",
    "home contents insurance",
    "liability and fire insurance",
]),
46: ("The German state has many tasks. Which task belongs to it?", [
    "It builds roads and schools.",
    "It sells food and clothing.",
    "It supplies all residents with free newspapers.",
    "It produces cars and buses.",
]),
47: ("The German state has many tasks. Which task does NOT belong to it?", [
    "It pays for holiday trips for all citizens.",
    "It pays child benefit.",
    "It supports museums.",
    "It promotes athletes.",
]),
48: ("Which body is NOT one of Germany's constitutional organs?", [
    "the Bundesrat",
    "the Federal President",
    "the Citizens' Assembly",
    "the government",
]),
49: ("Who determines education policy in Germany?", [
    "the teachers",
    "the federal states",
    "the Ministry of Family Affairs",
    "the universities",
]),
50: ("The form of economy in Germany is called …", [
    "free centrally planned economy.",
    "social market economy.",
    "guided centrally planned economy.",
    "planned economy.",
]),
51: ("It is NOT part of a democratic constitutional state that …", [
    "people can speak critically about the government.",
    "citizens may peacefully demonstrate.",
    "people are arrested without reason by a private police force.",
    "someone commits a crime and is arrested for it.",
]),
52: ("What does 'popular sovereignty' mean? All state authority proceeds from the …", [
    "people.",
    "Bundestag.",
    "Prussian king.",
    "Federal Constitutional Court.",
]),
53: ("What does 'constitutional state' (Rechtsstaat) mean in Germany?", [
    "The state is right.",
    "There are only right-wing parties.",
    "The citizens decide on the laws.",
    "The state must comply with the laws.",
]),
54: ("What is NOT a branch of state power in Germany?", [
    "legislature (Legislative)",
    "judiciary (Judikative)",
    "executive (Exekutive)",
    "directive (Direktive)",
]),
55: ("What does this image show?", [
    "the seat of the Bundestag in Berlin",
    "the Federal Constitutional Court in Karlsruhe",
    "the Bundesrat building in Berlin",
    "the Federal Chancellery in Berlin",
]),
56: ("Which office belongs to the municipal administration in Germany?", [
    "parish office",
    "public order office",
    "tax office",
    "Foreign Office",
]),
57: ("Who is usually elected President of the German Bundestag?", [
    "the oldest member of parliament",
    "the Minister-President of the largest federal state",
    "a former Federal Chancellor",
    "a member of the strongest parliamentary group",
]),
58: ("Who appoints the ministers of the federal government in Germany?", [
    "the President of the Federal Constitutional Court",
    "the Federal President",
    "the President of the Bundesrat",
    "the President of the Bundestag",
]),
59: ("How many years ago was there for the first time a Jewish community in the territory of what is now Germany?", [
    "about 300 years ago",
    "about 700 years ago",
    "about 1,150 years ago",
    "about 1,700 years ago",
]),
60: ("In Germany, the Bundestag and the Bundesrat belong to the …", [
    "executive.",
    "legislature.",
    "directive.",
    "judiciary.",
]),
61: ("What does 'popular sovereignty' mean?", [
    "The queen/king rules over the people.",
    "The Federal Constitutional Court stands above the constitution.",
    "Interest groups exercise sovereignty together with the government.",
    "State power derives from the people.",
]),
62: ("When the parliament of a German federal state is elected, this is called …", [
    "local election",
    "state parliament election",
    "European election",
    "federal election",
]),
63: ("What does NOT belong to the executive in Germany?", [
    "the police",
    "the courts",
    "the tax office",
    "the ministries",
]),
64: ("The Federal Republic of Germany today is divided into …", [
    "four occupation zones.",
    "an eastern state and a western state.",
    "16 cantons.",
    "the Federal Government, the states and municipalities.",
]),
65: ("It is NOT one of the tasks of the German Bundestag to …", [
    "draft legislation.",
    "monitor the federal government.",
    "elect the Federal Chancellor.",
    "form the federal cabinet.",
]),
66: ("Which cities have the largest Jewish communities in Germany?", [
    "Berlin and Munich",
    "Hamburg and Essen",
    "Nuremberg and Stuttgart",
    "Worms and Speyer",
]),
67: ("What is primarily a task of the federal states in Germany?", [
    "defence policy",
    "foreign policy",
    "economic policy",
    "education policy",
]),
68: ("Why does the state in Germany supervise the school system?", [
    "because there are only state schools in Germany",
    "because all pupils must have a school leaving certificate",
    "because there are different schools in the federal states",
    "because it is its duty under the Basic Law",
]),
69: ("The Federal Republic of Germany has a three-tier administrative structure. What is the lowest political level called?", [
    "town councils",
    "district administrators",
    "municipalities",
    "district offices",
]),
70: ("Federal President Gustav Heinemann presents Helmut Schmidt with the instrument of appointment as Federal Chancellor in 1974. What are the duties of the German Federal President?", [
    "She/He manages government affairs.",
    "She/He monitors the governing party.",
    "She/He selects the ministers.",
    "She/He proposes the Chancellor for election.",
]),
71: ("Where does the German Federal Chancellor spend most of their time? She/He is most often …", [
    "in Bonn, because the Federal Chancellery and the Bundestag are located there.",
    "at Meseberg Palace, the guest house of the Federal Government, to receive state guests.",
    "at Bellevue Palace, the official residence of the Federal President, to receive state guests.",
    "in Berlin, because the Federal Chancellery and the Bundestag are located there.",
]),
72: ("What is the name of the current Federal Chancellor of Germany?", [
    "Gerhard Schröder",
    "Angela Merkel",
    "Ursula von der Leyen",
    "Friedrich Merz",
]),
73: ("The two largest parliamentary groups in the German Bundestag are currently …", [
    "CDU/CSU and AfD.",
    "Die Linke and Alliance 90/The Greens.",
    "Alliance 90/The Greens and SPD.",
    "Die Linke and CDU/CSU.",
]),
74: ("What is the parliament for all of Germany called?", [
    "Federal Assembly",
    "People's Chamber",
    "Bundestag",
    "Federal Court of Justice",
]),
75: ("What is the name of Germany's current head of state?", [
    "Frank-Walter Steinmeier",
    "Bärbel Bas",
    "Bodo Ramelow",
    "Joachim Gauck",
]),
76: ("What does the abbreviation CDU stand for in Germany?", [
    "Christian German Union",
    "Club of German Entrepreneurs",
    "Christian German Environmental Protection",
    "Christian Democratic Union",
]),
77: ("What is the Bundeswehr?", [
    "the German police",
    "a German port",
    "a German citizens' initiative",
    "the German army",
]),
78: ("What does the abbreviation SPD stand for?", [
    "Socialist Party of Germany",
    "Social Policy Party of Germany",
    "Social Democratic Party of Germany",
    "Social Justice Party of Germany",
]),
79: ("What does the abbreviation FDP stand for in Germany?", [
    "Peaceful Demonstration Party",
    "Free Germany Party",
    "Leading Democratic Party",
    "Free Democratic Party",
]),
80: ("Which court in Germany is responsible for interpreting the Basic Law?", [
    "Higher Regional Court",
    "Local Court",
    "Federal Constitutional Court",
    "Administrative Court",
]),
81: ("Who elects the Federal Chancellor in Germany?", [
    "the Bundesrat",
    "the Federal Assembly",
    "the people",
    "the Bundestag",
]),
82: ("Who chairs the German Federal Cabinet?", [
    "the President of the Bundestag",
    "the Federal President",
    "the President of the Bundesrat",
    "the Federal Chancellor",
]),
83: ("Who elects the German Federal Chancellor?", [
    "the people",
    "the Federal Assembly",
    "the Bundestag",
    "the Federal Government",
]),
84: ("What is the main task of the German Federal President? She/He …", [
    "governs the country.",
    "drafts the laws.",
    "represents the country.",
    "oversees compliance with the laws.",
]),
85: ("Who forms the German Bundesrat?", [
    "the members of the Bundestag",
    "the ministers of the federal government",
    "the government representatives of the federal states",
    "the party members",
]),
86: ("Who elects the Federal President in Germany?", [
    "the Federal Assembly",
    "the Bundesrat",
    "the Federal Parliament",
    "the Federal Constitutional Court",
]),
87: ("Who is the head of state of the Federal Republic of Germany?", [
    "the Federal Chancellor",
    "the Federal President",
    "the President of the Bundesrat",
    "the President of the Bundestag",
]),
88: ("The parliamentary opposition in the German Bundestag …", [
    "monitors the government.",
    "decides who becomes a federal minister.",
    "determines who sits in the Bundesrat.",
    "proposes the heads of government of the states.",
]),
89: ("What is the association of members of parliament of one party in parliament called in Germany?", [
    "association",
    "council of elders",
    "parliamentary group (Fraktion)",
    "opposition",
]),
90: ("The German federal states participate in federal legislation through …", [
    "the Bundesrat.",
    "the Federal Assembly.",
    "the Bundestag.",
    "the Federal Government.",
]),
91: ("In Germany, a change of government in a federal state can affect federal politics. Governing becomes …", [
    "more difficult if this changes the majority in the Bundestag.",
    "easier if new parties thereby enter the Bundesrat.",
    "more difficult if the majority in the Bundesrat is changed as a result.",
    "easier if it concerns a wealthy federal state.",
]),
92: ("What does the abbreviation CSU stand for in Germany?", [
    "Christian Secure Union",
    "Christian South German Union",
    "Christian Social Entrepreneurs' Association",
    "Christian Social Union",
]),
93: ("The more 'second votes' a party receives in a Bundestag election, the …", [
    "fewer first votes it can have.",
    "more direct candidates of the party enter parliament.",
    "greater the risk of having to form a coalition.",
    "more seats the party receives in parliament.",
]),
94: ("From what age are you allowed to participate in elections to the German Bundestag?", [
    "16",
    "18",
    "21",
    "23",
]),
95: ("What applies to most children in Germany?", [
    "compulsory voting",
    "compulsory schooling",
    "duty of silence",
    "compulsory religion",
]),
96: ("How can someone who denies the Holocaust be punished?", [
    "reduction of social benefits",
    "up to 100 hours of community service",
    "not at all — Holocaust denial is permitted",
    "with imprisonment of up to five years or a fine",
]),
97: ("What do you automatically pay in Germany when you are in permanent employment?", [
    "social insurance",
    "social welfare",
    "child benefit",
    "housing benefit",
]),
98: ("When members of parliament in the German Bundestag change their parliamentary group, …", [
    "they are no longer allowed to attend parliamentary sessions.",
    "the government may lose its majority.",
    "the Federal President must first give their consent.",
    "the voters of these members of parliament are allowed to vote again.",
]),
99: ("Who pays for social insurance in Germany?", [
    "employers and employees",
    "employees only",
    "all citizens",
    "employers only",
]),
100: ("What does NOT belong to the statutory social insurance?", [
    "life insurance",
    "statutory pension insurance",
    "unemployment insurance",
    "nursing care insurance",
]),
101: ("Trade unions are interest groups of …", [
    "young people.",
    "employees.",
    "retirees.",
    "employers.",
]),
102: ("What can you be awarded in the Federal Republic of Germany if you have made a special contribution in the political, economic, cultural, intellectual or social field? The …", [
    "Federal Cross of Merit",
    "Federal Eagle",
    "Patriotic Order of Merit",
    "Honorary title 'Hero of the German Democratic Republic'",
]),
103: ("What is referred to in Germany as the 'traffic light coalition' (Ampelkoalition)? The cooperation of …", [
    "the Bundestag parliamentary groups of CDU and CSU",
    "SPD, FDP and Alliance 90/The Greens in a government",
    "CSU, Die Linke and Alliance 90/The Greens in a government",
    "the Bundestag parliamentary groups of CDU and SPD",
]),
104: ("A woman in Germany loses her job. What may NOT be the reason for this dismissal?", [
    "The woman has been ill for a long time and is unable to work.",
    "The woman was often late for work.",
    "The woman handles private matters during working hours.",
    "The woman is having a child and her boss knows this.",
]),
105: ("What is one of the tasks of election workers in Germany?", [
    "They help elderly people cast their vote in the polling booth.",
    "They write the election notices before the election.",
    "They pass on interim results to the media.",
    "They count the votes after the end of the election.",
]),
106: ("In Germany, volunteer election workers help with the elections. What is one of the tasks of election workers?", [
    "They help children and elderly people to vote.",
    "They write cards and letters with the address of the polling station.",
    "They pass on interim results to journalists.",
    "They count the votes after the end of the election.",
]),
107: ("For how many years is the Bundestag in Germany elected?", [
    "2 years",
    "4 years",
    "6 years",
    "8 years",
]),
108: ("In a Bundestag election in Germany, everyone is allowed to vote who …", [
    "lives in the Federal Republic of Germany and wishes to vote.",
    "is a citizen of the Federal Republic of Germany and is at least 18 years old.",
    "has lived in the Federal Republic of Germany for at least 3 years.",
    "is a citizen of the Federal Republic of Germany and is at least 21 years old.",
]),
109: ("How often do Bundestag elections normally take place in Germany?", [
    "every three years",
    "every four years",
    "every five years",
    "every six years",
]),
110: ("For how many years is the Bundestag in Germany elected?", [
    "2 years",
    "3 years",
    "4 years",
    "5 years",
]),
111: ("Which actions relating to the State of Israel are prohibited in Germany?", [
    "publicly criticising Israel's politics",
    "hanging an Israeli flag on private property",
    "a discussion about Israel's politics",
    "the public call for the destruction of Israel",
]),
112: ("Elections in Germany are …", [
    "special.",
    "secret.",
    "occupation-related.",
    "gender-dependent.",
]),
113: ("In elections in Germany, the party that … wins.", [
    "receives the most votes.",
    "the majority of men have voted for.",
    "received the most votes from workers.",
    "received the most first votes for its chancellor candidate.",
]),
114: ("Participating in democratic elections in Germany is …", [
    "a duty.",
    "a right.",
    "compulsory.",
    "a burden.",
]),
115: ("What does 'active right to vote' mean in Germany?", [
    "You can be elected.",
    "You must go and vote.",
    "You can vote.",
    "You must go to the counting of votes.",
]),
116: ("When you are allowed to vote in a Bundestag election in Germany, this is called …", [
    "active election campaign.",
    "active electoral procedure.",
    "active campaigning.",
    "active right to vote.",
]),
117: ("What percentage of second votes must parties receive at minimum to enter the German Bundestag?", [
    "3%",
    "4%",
    "5%",
    "6%",
]),
118: ("Who is allowed to become a member of the approximately 40 Jewish Maccabi sports clubs?", [
    "only Germans",
    "only Israelis",
    "only religious people",
    "all people",
]),
119: ("Elections in Germany are free. What does that mean?", [
    "All convicted criminals are not allowed to vote.",
    "If I want to go and vote, my employer must give me time off.",
    "Each person can decide without coercion whether they want to vote and who they want to vote for.",
    "I can freely decide where I want to go and vote.",
]),
120: ("The voting system in Germany is a …", [
    "census suffrage.",
    "three-class suffrage.",
    "combined majority and proportional voting system.",
    "general male suffrage.",
]),
121: ("A party wants to enter the German Bundestag. But it must have a minimum share of votes. This is called …", [
    "5% threshold.",
    "admission limit.",
    "base value.",
    "guideline.",
]),
122: ("What principle do elections in Germany follow? Elections in Germany are …", [
    "free, equal, secret.",
    "open, safe, free.",
    "closed, equal, safe.",
    "safe, open, voluntary.",
]),
123: ("What is the '5% threshold' in Germany?", [
    "voting rule in the Bundestag for small parties",
    "attendance check in the Bundestag for votes",
    "minimum share of votes needed to enter parliament",
    "attendance check in the Bundesrat for votes",
]),
124: ("The Bundestag election in Germany is the election of …", [
    "the Federal Chancellor.",
    "the parliaments of the states.",
    "the parliament for Germany.",
    "the Federal President.",
]),
125: ("In a democracy, one function of regular elections is …", [
    "to force citizens to cast their vote.",
    "to enable a change of government in accordance with the will of the majority of voters.",
    "to maintain existing laws in the country.",
    "to give more power to the poor.",
]),
126: ("What do eligible citizens receive in Germany before an election?", [
    "a voter notification from the municipality",
    "a voting permit from the Federal President",
    "a notification from the Federal Assembly",
    "a notification from the parish office",
]),
127: ("Why is there a 5% threshold in the electoral law of the Federal Republic of Germany? It exists because …", [
    "the programmes of many small parties have many things in common.",
    "citizens can lose their way with many small parties.",
    "many small parties make it difficult to form a government.",
    "the small parties don't have enough money to pay their politicians.",
]),
128: ("Members of parliament who are elected by the citizens are called …", [
    "members of parliament (Abgeordnete).",
    "chancellors.",
    "ambassadors.",
    "minister-presidents.",
]),
129: ("What is elected by the people in Germany?", [
    "the Federal Chancellor.",
    "the Minister-President of a federal state.",
    "the Bundestag.",
    "the Federal President.",
]),
130: ("Which ballot paper would be valid in a Bundestag election?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
131: ("In Germany, a mayor (Bürgermeister/in) is …", [
    "the head of a school.",
    "the head of a bank.",
    "the head of a municipality.",
    "the chairperson of a party.",
]),
132: ("Many people in Germany work voluntarily in their free time. What does that mean?", [
    "They work as soldiers.",
    "They work voluntarily and unpaid in clubs and associations.",
    "They work in the federal government.",
    "They work in a hospital and earn money doing so.",
]),
133: ("What is permitted in Bundestag and state parliament elections in Germany?", [
    "A husband votes on behalf of his wife.",
    "You can cast your vote by postal vote.",
    "You can cast your vote by telephone on election day.",
    "Children from the age of 14 are allowed to vote.",
]),
134: ("They want to abolish the bus line you always use to get to work. What can you do to preserve the bus line?", [
    "I participate in a citizens' initiative to preserve the bus line or start my own initiative.",
    "I become a member of a sports club and train cycling.",
    "I contact the tax office because as a taxpayer I have a right to the bus line.",
    "I write a letter to the forestry office of the municipality.",
]),
135: ("Who do trade unions represent in Germany?", [
    "large companies",
    "small companies",
    "self-employed people",
    "employees",
]),
136: ("You go to the labour court in Germany for …", [
    "an incorrect utility cost statement.",
    "unjustified dismissal by your employer.",
    "problems with neighbours.",
    "difficulties following a road accident.",
]),
137: ("Which court in Germany is responsible for conflicts in the workplace?", [
    "the family court",
    "the criminal court",
    "the labour court",
    "the local court",
]),
138: ("What can I do in Germany if my employer has unjustly dismissed me?", [
    "continue working and be friendly to the boss",
    "pursue a dunning procedure against the employer",
    "file an unfair dismissal lawsuit",
    "report the employer to the police",
]),
139: ("When does a court case take place in Germany? When someone …", [
    "converts to another religion.",
    "has committed a criminal offence and is charged.",
    "holds a different opinion from the government.",
    "has parked their car incorrectly and it is towed away.",
]),
140: ("What does a lay judge (Schöffe/Schöffin) do in Germany? She/He …", [
    "decides together with judges on guilt and punishment.",
    "gives citizens legal advice.",
    "issues certificates.",
    "defends the accused.",
]),
141: ("Who advises people on legal matters and represents them in court in Germany?", [
    "a lawyer (Rechtsanwalt/Rechtsanwältin)",
    "a judge",
    "a lay judge",
    "a public prosecutor",
]),
142: ("What is the main task of a judge in Germany? A judge …", [
    "represents citizens before a court.",
    "works at a court and passes judgements.",
    "changes laws.",
    "supports young people before the court.",
]),
143: ("A judge in Germany belongs to the …", [
    "judiciary (Judikative).",
    "executive (Exekutive).",
    "operative.",
    "legislature (Legislative).",
]),
144: ("A judge belongs in Germany to the …", [
    "executive power.",
    "judicial power.",
    "planning power.",
    "legislative power.",
]),
145: ("In Germany, state power is divided. For which branch of state power does a judge work? For the …", [
    "judiciary (Judikative)",
    "executive (Exekutive)",
    "press",
    "legislature (Legislative)",
]),
146: ("What is a court proceeding called in Germany?", [
    "programme",
    "procedure",
    "protocol",
    "trial (Prozess)",
]),
147: ("What is the work of a judge in Germany?", [
    "governing Germany",
    "dispensing justice",
    "creating plans",
    "enacting laws",
]),
148: ("What is one of the tasks of the police in Germany?", [
    "to defend the country",
    "to wiretap citizens",
    "to pass the laws",
    "to monitor compliance with the laws",
]),
149: ("What is an example of antisemitic behaviour?", [
    "visiting a Jewish festival",
    "criticising the Israeli government",
    "denying the Holocaust",
    "playing football against Jews",
]),
150: ("A lay judge (Gerichtsschöffe/Gerichtsschöffin) in Germany is …", [
    "the deputy of the head of the city.",
    "a voluntary judge.",
    "a member of a local council.",
    "a person who has studied law.",
]),
151: ("Who built the wall in Berlin?", [
    "Great Britain",
    "the GDR",
    "the Federal Republic of Germany",
    "the USA",
]),
152: ("When were the National Socialists with Adolf Hitler in power in Germany?", [
    "1918 to 1923",
    "1932 to 1950",
    "1933 to 1945",
    "1945 to 1989",
]),
153: ("What happened on 8 May 1945?", [
    "Death of Adolf Hitler",
    "Start of construction of the Berlin Wall",
    "Election of Konrad Adenauer as Federal Chancellor",
    "End of World War II in Europe",
]),
154: ("When did World War II end?", [
    "1933",
    "1945",
    "1949",
    "1961",
]),
155: ("When were the National Socialists in power in Germany?", [
    "1888 to 1918",
    "1921 to 1934",
    "1933 to 1945",
    "1949 to 1963",
]),
156: ("In which year did Hitler become Reich Chancellor?", [
    "1923",
    "1927",
    "1933",
    "1936",
]),
157: ("The National Socialists with Adolf Hitler established in 1933 in Germany …", [
    "a dictatorship.",
    "a democratic state.",
    "a monarchy.",
    "a principality.",
]),
158: ("The 'Third Reich' was a …", [
    "dictatorship.",
    "democracy.",
    "monarchy.",
    "soviet republic.",
]),
159: ("What did NOT exist in Germany during the time of National Socialism?", [
    "free elections",
    "press censorship",
    "arbitrary arrests",
    "persecution of Jews",
]),
160: ("Which war lasted from 1939 to 1945?", [
    "World War I",
    "World War II",
    "the Vietnam War",
    "the Gulf War",
]),
161: ("What characterised the Nazi state? A policy of …", [
    "state racism",
    "freedom of opinion",
    "general freedom of religion",
    "the development of democracy",
]),
162: ("Claus Schenk Graf von Stauffenberg became famous for …", [
    "a gold medal at the 1936 Olympic Games.",
    "the construction of the Reichstag building.",
    "the establishment of the Wehrmacht.",
    "the assassination attempt on Hitler on 20 July 1944.",
]),
163: ("In which year did the National Socialists destroy synagogues and Jewish shops in Germany?", [
    "1925",
    "1930",
    "1938",
    "1945",
]),
164: ("What happened on 9 November 1938 in Germany?", [
    "With the attack on Poland, World War II begins.",
    "The National Socialists lose an election and dissolve the Reichstag.",
    "Jewish shops and synagogues are destroyed by National Socialists and their followers.",
    "Hitler becomes Reich President and has all parties banned.",
]),
165: ("What was the name of the first Federal Chancellor of the Federal Republic of Germany?", [
    "Konrad Adenauer",
    "Kurt Georg Kiesinger",
    "Helmut Schmidt",
    "Willy Brandt",
]),
166: ("At which demonstrations in Germany did the people call out 'We are the people'?", [
    "during the workers' uprising of 1953 in the GDR",
    "during the 1968 demonstrations in the Federal Republic of Germany",
    "during the anti-nuclear power demonstrations of 1985 in the Federal Republic of Germany",
    "during the Monday demonstrations of 1989 in the GDR",
]),
167: ("Which countries were referred to as 'Allied Occupation Powers' in Germany after World War II?", [
    "Soviet Union, Great Britain, Poland, Sweden",
    "France, Soviet Union, Italy, Japan",
    "USA, Soviet Union, Spain, Portugal",
    "USA, Soviet Union, Great Britain, France",
]),
168: ("Which country was NOT an 'Allied Occupation Power' in Germany?", [
    "USA",
    "Soviet Union",
    "France",
    "Japan",
]),
169: ("When was the Federal Republic of Germany founded?", [
    "1939",
    "1945",
    "1949",
    "1951",
]),
170: ("What existed in Germany during the time of National Socialism?", [
    "the banning of parties",
    "the right to free personal development",
    "freedom of the press",
    "protection of human dignity",
]),
171: ("Social market economy means the economy …", [
    "regulates itself solely according to supply and demand.",
    "is planned and controlled by the state; supply and demand are not taken into account.",
    "is guided by demand from abroad.",
    "is guided by supply and demand, but the state ensures social balance.",
]),
172: ("In which occupation zone was the GDR founded? In the …", [
    "American occupation zone",
    "French occupation zone",
    "British occupation zone",
    "Soviet occupation zone",
]),
173: ("The Federal Republic of Germany is a founding member of …", [
    "the North Atlantic Treaty (NATO).",
    "the United Nations (UN).",
    "the European Union (EU).",
    "the Warsaw Pact.",
]),
174: ("When was the GDR founded?", [
    "1947",
    "1949",
    "1953",
    "1956",
]),
175: ("How many occupation zones were there in Germany after World War II?", [
    "3",
    "4",
    "5",
    "6",
]),
176: ("How were the occupation zones of Germany distributed after 1945?", [
    "1=Great Britain, 2=Soviet Union, 3=France, 4=USA",
    "1=Soviet Union, 2=Great Britain, 3=USA, 4=France",
    "1=Great Britain, 2=Soviet Union, 3=USA, 4=France",
    "1=Great Britain, 2=USA, 3=Soviet Union, 4=France",
]),
177: ("Which German city was divided into four sectors after World War II?", [
    "Munich",
    "Berlin",
    "Dresden",
    "Frankfurt/Oder",
]),
178: ("From June 1948 to May 1949, the citizens of West Berlin were supplied via an airlift. What circumstance was responsible for this?", [
    "For France, supplying the West Berlin population by plane was cheaper.",
    "The American soldiers were afraid of attacks during overland transport.",
    "For Great Britain, supplying via the airlift was faster.",
    "The Soviet Union interrupted all land traffic.",
]),
179: ("How did World War II officially end in Europe?", [
    "with the death of Adolf Hitler",
    "through Germany's unconditional surrender",
    "with the withdrawal of the Germans from the occupied territories",
    "through a revolution in Germany",
]),
180: ("The first Federal Chancellor of the Federal Republic of Germany was …", [
    "Ludwig Erhard.",
    "Willy Brandt.",
    "Konrad Adenauer.",
    "Gerhard Schröder.",
]),
181: ("What did Willy Brandt want to express with his act of kneeling in 1970 at the former Jewish Ghetto in Warsaw?", [
    "He submitted to the former Allies.",
    "He asked Poland and the Polish Jews for forgiveness.",
    "He showed his humility before the Warsaw Pact.",
    "He said a prayer at the tomb of the Unknown Soldier.",
]),
182: ("What is the Jewish house of prayer called?", [
    "basilica",
    "mosque",
    "synagogue",
    "church",
]),
183: ("When was the 'economic miracle' (Wirtschaftswunder) in the Federal Republic of Germany?", [
    "1940s",
    "1950s",
    "1970s",
    "1980s",
]),
184: ("On what legal basis was the State of Israel founded?", [
    "a United Nations resolution",
    "a resolution of the Zionist Congress",
    "a proposal by the Federal Government",
    "a proposal by the USSR",
]),
185: ("What did the expression 'Iron Curtain' stand for? The sealing off of …", [
    "the Warsaw Pact against the West",
    "northern Germany against southern Germany",
    "Nazi Germany against the Allies",
    "Europe against the USA",
]),
186: ("In 1953 there was an uprising in the GDR which a public holiday in the Federal Republic of Germany used to commemorate. When was it?", [
    "1 May",
    "17 June",
    "20 July",
    "9 November",
]),
187: ("Which German state had a black-red-gold flag with a hammer, compass and circle of corn?", [
    "Prussia",
    "Federal Republic of Germany",
    "'Third Reich'",
    "GDR",
]),
188: ("In which year was the wall built in Berlin?", [
    "1953",
    "1956",
    "1959",
    "1961",
]),
189: ("When did the GDR build the wall in Berlin?", [
    "1919",
    "1933",
    "1961",
    "1990",
]),
190: ("What does the abbreviation DDR (GDR) stand for?", [
    "Third German Broadcasting",
    "The German Republic",
    "Third German Republic",
    "German Democratic Republic",
]),
191: ("When was the wall in Berlin opened for everyone?", [
    "1987",
    "1989",
    "1992",
    "1995",
]),
192: ("Which current German federal state formerly belonged to the territory of the GDR?", [
    "Brandenburg",
    "Bavaria",
    "Saarland",
    "Hesse",
]),
193: ("From 1961 to 1989, Berlin was …", [
    "without a mayor.",
    "its own state.",
    "divided by a wall.",
    "only reachable by plane.",
]),
194: ("On 3 October, Germany celebrates the Day of German …", [
    "Unity.",
    "Nation.",
    "Federal States.",
    "Cities.",
]),
195: ("Which current German federal state formerly belonged to the territory of the GDR?", [
    "Hesse",
    "Saxony-Anhalt",
    "North Rhine-Westphalia",
    "Saarland",
]),
196: ("Why is the period in autumn 1989 in the GDR called 'the turning point' (Die Wende)? During this time, the GDR changed politically …", [
    "from a dictatorship to a democracy.",
    "from a liberal market economy to socialism.",
    "from a monarchy to social democracy.",
    "from a religious state to a communist state.",
]),
197: ("Which current German federal state formerly belonged to the territory of the GDR?", [
    "Thuringia",
    "Hesse",
    "Bavaria",
    "Bremen",
]),
198: ("Which current German federal state formerly belonged to the territory of the GDR?", [
    "Bavaria",
    "Lower Saxony",
    "Saxony",
    "Baden-Württemberg",
]),
199: ("In the GDR, the abbreviation 'Stasi' referred to …", [
    "the parliament.",
    "the Ministry for State Security.",
    "a governing party.",
    "the Ministry for Public Education.",
]),
200: ("Which current German federal state formerly belonged to the territory of the GDR?", [
    "Hesse",
    "Schleswig-Holstein",
    "Mecklenburg-Vorpommern",
    "Saarland",
]),
201: ("Which of the following lists contains only federal states that belonged to the territory of the former GDR?", [
    "Lower Saxony, North Rhine-Westphalia, Hesse, Schleswig-Holstein, Brandenburg",
    "Mecklenburg-Vorpommern, Brandenburg, Saxony, Saxony-Anhalt, Thuringia",
    "Bavaria, Baden-Württemberg, Rhineland-Palatinate, Thuringia, Saxony",
    "Saxony, Thuringia, Hesse, Lower Saxony, Brandenburg",
]),
202: ("Whose side was the GDR on during the 'Cold War'?", [
    "the Western powers",
    "the Warsaw Pact",
    "NATO",
    "the non-aligned states",
]),
203: ("What was the economic system of the GDR called?", [
    "market economy",
    "planned economy",
    "supply and demand",
    "capitalism",
]),
204: ("How did the Federal Republic of Germany and the GDR become one state?", [
    "The Federal Republic occupied the GDR.",
    "The current five eastern federal states joined the Federal Republic of Germany.",
    "The western federal states joined the GDR.",
    "The GDR occupied the Federal Republic of Germany.",
]),
205: ("With the GDR's accession to the Federal Republic of Germany, the new federal states now also belong to …", [
    "the European Union.",
    "the Warsaw Pact.",
    "OPEC.",
    "the European Defence Community.",
]),
206: ("What do the so-called 'Stolpersteine' (stumbling stones) in Germany commemorate?", [
    "famous German politicians",
    "the victims of National Socialism",
    "road traffic fatalities",
    "famous Jewish musicians",
]),
207: ("Which military alliance was the GDR a member of?", [
    "NATO",
    "the Rhine Confederation",
    "the Warsaw Pact",
    "the European Alliance",
]),
208: ("What was the 'Stasi'?", [
    "the secret service in the 'Third Reich'",
    "a famous German memorial site",
    "the secret service of the GDR",
    "a German sports club during World War II",
]),
209: ("Which was the coat of arms of the German Democratic Republic?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
210: ("What happened on 17 June 1953 in the GDR?", [
    "the ceremonial accession to the Warsaw Pact",
    "nationwide strikes and a popular uprising",
    "the 1st SED party congress",
    "the first visit by Fidel Castro",
]),
211: ("Which politician stands for the 'Eastern Treaties' (Ostverträge)?", [
    "Helmut Kohl",
    "Willy Brandt",
    "Mikhail Gorbachev",
    "Ludwig Erhard",
]),
212: ("What is Germany's full name?", [
    "Federal State Germany",
    "Federal States Germany",
    "Federal Republic of Germany",
    "Federal District Germany",
]),
213: ("How many inhabitants does Germany have?", [
    "70 million",
    "78 million",
    "84 million",
    "90 million",
]),
214: ("What colours does the German flag have?", [
    "black-red-gold",
    "red-white-black",
    "black-red-green",
    "black-yellow-red",
]),
215: ("Who is referred to as the 'Chancellor of German Unity'?", [
    "Gerhard Schröder",
    "Helmut Kohl",
    "Konrad Adenauer",
    "Helmut Schmidt",
]),
216: ("Which symbol can be seen in the plenary hall of the German Bundestag?", [
    "the Federal Eagle",
    "the flag of the city of Berlin",
    "the Imperial Eagle",
    "the Imperial Crown",
]),
217: ("In what period did the German Democratic Republic (GDR) exist?", [
    "1919 to 1927",
    "1933 to 1945",
    "1945 to 1961",
    "1949 to 1990",
]),
218: ("How many federal states were added to the Federal Republic of Germany at reunification in 1990?", [
    "4",
    "5",
    "6",
    "7",
]),
219: ("The Federal Republic of Germany has had its current borders since …", [
    "1933",
    "1949",
    "1971",
    "1990",
]),
220: ("27 January is an official day of remembrance in Germany. What does this day commemorate?", [
    "the end of World War II",
    "the adoption of the Basic Law",
    "the reunification of Germany",
    "the victims of National Socialism (day of liberation of the Auschwitz extermination camp)",
]),
221: ("Germany is a member of the Schengen Agreement. What does that mean?", [
    "Germans can travel to many European countries without passport control.",
    "All people can enter Germany without identity checks.",
    "Germans can travel to any country without passport control.",
    "Germans can pay with the euro in any country.",
]),
222: ("Which country is a neighbour of Germany?", [
    "Hungary",
    "Portugal",
    "Spain",
    "Switzerland",
]),
223: ("Which country is a neighbour of Germany?", [
    "Romania",
    "Bulgaria",
    "Poland",
    "Greece",
]),
224: ("What does the abbreviation EU stand for?", [
    "European Enterprises",
    "European Union",
    "Unified Union",
    "Euro Union",
]),
225: ("In which other country is there a large German-speaking population?", [
    "Czech Republic",
    "Norway",
    "Spain",
    "Austria",
]),
226: ("Which is the flag of the European Union?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
227: ("Which country is a neighbour of Germany?", [
    "Finland",
    "Denmark",
    "Norway",
    "Sweden",
]),
228: ("What is the accession of the GDR to the Federal Republic of Germany in 1990 generally called?", [
    "NATO eastward expansion",
    "EU eastward expansion",
    "German Reunification",
    "European Community",
]),
229: ("Which country is a neighbour of Germany?", [
    "Spain",
    "Bulgaria",
    "Norway",
    "Luxembourg",
]),
230: ("The European Parliament is regularly elected, namely every …", [
    "5 years.",
    "6 years.",
    "7 years.",
    "8 years.",
]),
231: ("What does the term 'European integration' mean?", [
    "It refers to American immigrants in Europe.",
    "The term means a stop to immigration to Europe.",
    "It refers to European emigrants in the USA.",
    "The term means the unification of European states into the EU.",
]),
232: ("Who is elected in European elections?", [
    "the European Commission",
    "the countries allowed to join the EU",
    "the members of the European Parliament",
    "the European constitution",
]),
233: ("Which country is a neighbour of Germany?", [
    "Czech Republic",
    "Bulgaria",
    "Greece",
    "Portugal",
]),
234: ("Where is one seat of the European Parliament?", [
    "London",
    "Paris",
    "Berlin",
    "Strasbourg",
]),
235: ("The then French President François Mitterrand and the then German Federal Chancellor Helmut Kohl jointly commemorate the fallen of both World Wars in Verdun. Which goal of the European Union becomes clear at this meeting?", [
    "friendship between England and Germany",
    "freedom to travel to all EU countries",
    "peace and security in the EU countries",
    "uniform public holidays in the EU countries",
]),
236: ("How many member states does the EU have today?", [
    "21",
    "23",
    "25",
    "27",
]),
237: ("In 2007 the 50th anniversary of the 'Treaties of Rome' was celebrated. What was the content of the treaties?", [
    "Germany's accession to NATO",
    "founding of the European Economic Community (EEC)",
    "Germany's obligation to make reparations",
    "establishing the Oder-Neisse line as the eastern border",
]),
238: ("At which locations does the European Parliament work?", [
    "Paris, London and The Hague",
    "Strasbourg, Luxembourg and Brussels",
    "Rome, Bern and Vienna",
    "Bonn, Zurich and Milan",
]),
239: ("Through which treaties did the Federal Republic of Germany join with other states to form the European Economic Community?", [
    "the 'Hamburg Treaties'",
    "the 'Treaties of Rome'",
    "the 'Paris Treaties'",
    "the 'London Treaties'",
]),
240: ("Since when has Germany been paying with the euro in cash?", [
    "1995",
    "1998",
    "2002",
    "2005",
]),
241: ("Mrs Seger is having a child. What must she do to receive parental benefit (Elterngeld)?", [
    "She must write to her health insurance fund.",
    "She must submit an application to the parental benefit office.",
    "She doesn't need to do anything, as she automatically receives parental benefit.",
    "She must ask the employment office for permission.",
]),
242: ("Who decides whether a child in Germany goes to kindergarten?", [
    "the state",
    "the federal states",
    "the parents/legal guardians",
    "the schools",
]),
243: ("Maik and Sybille want to hold a demonstration on the street at their place of residence in Germany with friends. What must they do beforehand?", [
    "They must register the demonstration.",
    "They don't need to do anything. In Germany, demonstrations are permitted anywhere at any time.",
    "They can't do anything at all, because demonstrations are fundamentally prohibited in Germany.",
    "Maik and Sybille must found a new association because only associations are allowed to demonstrate.",
]),
244: ("What school leaving certificate do you normally need to begin a degree at a university in Germany?", [
    "the Abitur (university entrance qualification)",
    "a diploma",
    "procuration",
    "a journeyman's examination",
]),
245: ("Who is not allowed to live together as a couple in Germany?", [
    "Hans (20 years) and Marie (19 years)",
    "Tom (20 years) and Klaus (45 years)",
    "Sofie (35 years) and Lisa (40 years)",
    "Anne (13 years) and Tim (25 years)",
]),
246: ("From what age are you an adult (of legal age) in Germany?", [
    "16",
    "18",
    "19",
    "21",
]),
247: ("A woman is pregnant. She is specially protected by law shortly before and after the birth of her child. What is this protection called?", [
    "parental leave",
    "maternity protection (Mutterschutz)",
    "birth preparation",
    "lying-in period",
]),
248: ("Raising children in Germany is primarily the task of …", [
    "the state.",
    "the parents.",
    "the grandparents.",
    "the schools.",
]),
249: ("Who is mainly responsible for raising children in Germany?", [
    "the state",
    "the parents",
    "the relatives",
    "the schools",
]),
250: ("In Germany, you have the best chance of a well-paid job if you …", [
    "are Catholic.",
    "are well-educated.",
    "are a woman.",
    "are a member of a party.",
]),
251: ("If you hit a child in Germany, …", [
    "it is nobody else's business.",
    "it is only the family's business.",
    "you cannot be punished for it.",
    "you can be punished for it.",
]),
252: ("In Germany …", [
    "you may only be married to one partner at a time.",
    "you can have several spouses at the same time.",
    "you are not allowed to remarry if you have been married once.",
    "a woman is not allowed to remarry if her husband has died.",
]),
253: ("Where must you register when you move in Germany?", [
    "at the residents' registration office (Einwohnermeldeamt)",
    "at the registry office (Standesamt)",
    "at the public order office",
    "at the trade office",
]),
254: ("In Germany, married couples are allowed to divorce. In most cases, they must comply with the 'separation year' (Trennungsjahr). What does that mean?", [
    "The divorce proceedings last a year.",
    "The spouses are married for a year, then divorce is possible.",
    "The right of access to the children applies for a year.",
    "The spouses lead separate lives for at least one year. After that, divorce is possible.",
]),
255: ("Parents in Germany can receive help with parenting problems from the …", [
    "public order office.",
    "school authority.",
    "youth welfare office (Jugendamt).",
    "public health office.",
]),
256: ("A married couple wants to open a restaurant in Germany. What do they absolutely need for this?", [
    "a permit from the police",
    "a permit from a political party",
    "a permit from the residents' registration office",
    "a restaurant licence from the responsible authority",
]),
257: ("An adult woman wants to obtain her Abitur later in Germany. She can do this at …", [
    "a university.",
    "an evening grammar school.",
    "a secondary modern school.",
    "a private university.",
]),
258: ("What is the youth welfare office (Jugendamt) allowed to do in Germany?", [
    "It decides which school the child attends.",
    "It can remove a child who is beaten or goes hungry from the family.",
    "It pays child benefit to the parents.",
    "It checks whether the child attends kindergarten.",
]),
259: ("The Vocational Information Centre (BIZ) at the Federal Employment Agency in Germany helps with …", [
    "pension calculation.",
    "looking for an apprenticeship.",
    "tax returns.",
    "health insurance.",
]),
260: ("In Germany, a child at school …", [
    "has the right to unlimited free time.",
    "has free choice of all subjects.",
    "is entitled to school fees.",
    "has compulsory attendance.",
]),
261: ("A man wants to obtain his Abitur later at the age of 30 in Germany. Where can he do this? At …", [
    "a university.",
    "an evening grammar school.",
    "a secondary modern school.",
    "a private university.",
]),
262: ("What does the principle of equal treatment mean in Germany?", [
    "Nobody may be discriminated against, e.g. because of a disability.",
    "You are allowed to discriminate against other people if you have sufficient personal reasons.",
    "Nobody is allowed to take legal action against people who have been discriminated against.",
    "It is a legal obligation for everyone to donate money annually to disadvantaged groups.",
]),
263: ("In Germany, young people are criminally responsible from the age of 14. This means: young people aged 14 and over who violate criminal law …", [
    "are punished.",
    "are treated like adults.",
    "share the punishment with their parents.",
    "are not punished.",
]),
264: ("For which festival do people in Germany wear colourful costumes and masks?", [
    "on Rose Monday (Rosenmontag)",
    "on Labour Day (May 1)",
    "at the Oktoberfest",
    "at Whitsun",
]),
265: ("Where must you go first in Germany if you want to get married?", [
    "to the residents' registration office",
    "to the public order office",
    "to the employment agency",
    "to the registry office (Standesamt)",
]),
266: ("When does the statutory quiet period (Nachtruhe) begin in Germany?", [
    "when the sun goes down",
    "when the neighbours go to bed",
    "at midnight (0:00)",
    "at 22:00",
]),
267: ("A young woman in Germany, 22 years old, is living with her boyfriend. Her parents disapprove because they don't like her boyfriend. What can the parents do?", [
    "They must respect the decision of their adult daughter.",
    "They have the right to bring the daughter back to the parental home.",
    "They can go to the police and report their daughter.",
    "They look for another man for their daughter.",
]),
268: ("A young woman wants to get her driving licence. She is nervous about the test because German is not her first language. What is correct?", [
    "She must have lived in Germany for at least ten years before she can get her driving licence.",
    "If she doesn't speak German, she is not allowed to have a driving licence.",
    "She must take her driving licence in the country where her language is spoken.",
    "She may be able to take the theory test in her native language. There are more than ten languages to choose from.",
]),
269: ("In Germany, children from the age of three have the right to … until they start school.", [
    "monthly pocket money.",
    "a place in a sports club.",
    "a kindergarten place.",
    "a holiday pass.",
]),
270: ("The adult education centre (Volkshochschule) in Germany is an institution …", [
    "for religious education.",
    "only for young people.",
    "for continuing education.",
    "only for retirees.",
]),
271: ("What is a tradition in Germany at Christmas?", [
    "hiding colourful eggs",
    "decorating a Christmas tree",
    "dressing up in masks and costumes",
    "placing pumpkins in front of the door",
]),
272: ("Which form of cohabitation is NOT permitted in Germany?", [
    "A man and a woman are divorced and live together with new partners.",
    "Two women live together.",
    "A single father lives with his two children.",
    "A man is married to two women at the same time.",
]),
273: ("For parenting problems, you go in Germany to …", [
    "the doctor.",
    "the public health office.",
    "the residents' registration office.",
    "the youth welfare office (Jugendamt).",
]),
274: ("In Germany, you have intentionally opened a letter addressed to another person. Which right have you not respected?", [
    "the right to silence",
    "the privacy of correspondence (Briefgeheimnis)",
    "the duty of confidentiality",
    "freedom of opinion",
]),
275: ("What do you need in Germany for a divorce?", [
    "the consent of the parents",
    "a certificate from a doctor",
    "the consent of the children",
    "the support of a lawyer",
]),
276: ("What should you do if you are treated poorly by your contact person at a German authority?", [
    "I can't do anything.",
    "I have to accept this treatment.",
    "I threaten the person.",
    "I can complain to the head of the authority.",
]),
277: ("A woman who has a two-year-old child applies for a job in Germany. What is an example of discrimination? She only doesn't get the job because she …", [
    "doesn't speak English.",
    "has too high salary expectations.",
    "has no experience in this profession.",
    "is a mother.",
]),
278: ("A man in a wheelchair has applied for a job as an accountant. What is an example of discrimination? He only doesn't get the job because he …", [
    "is in a wheelchair.",
    "has no experience.",
    "has too high salary expectations.",
    "doesn't speak English.",
]),
279: ("In most apartment buildings in Germany there is a 'house rules' document (Hausordnung). What is stated in such 'house rules'? It lists …", [
    "rules for the use of public transport.",
    "all tenants in the building.",
    "rules that all residents must follow.",
    "the address of the nearest public order office.",
]),
280: ("If you want to challenge an incorrect tax assessment in Germany, you must …", [
    "do nothing.",
    "throw away the assessment.",
    "file an objection.",
    "wait until another assessment arrives.",
]),
281: ("Two friends want to go to a public swimming pool in Germany. Both have dark skin and are therefore not allowed in. Which right is being violated in this situation? The right to …", [
    "freedom of opinion",
    "equal treatment",
    "freedom of assembly",
    "freedom of movement",
]),
282: ("Which honorary office must German citizens take on if requested to do so?", [
    "club trainer",
    "election worker",
    "library supervisor",
    "teacher",
]),
283: ("What do you do if you receive an incorrect invoice from a German authority?", [
    "I leave the invoice lying there.",
    "I file an objection with the authority.",
    "I send the invoice back to the authority.",
    "I take the invoice to the tax office.",
]),
284: ("What you need to be able to do for work will change very quickly in the future. What can you do?", [
    "It doesn't matter what you learn.",
    "Adults must keep learning even after completing their training.",
    "Children learn everything that is important for their career at school. After school, you don't need to keep learning.",
    "Everyone has to stop working earlier because everything is changing.",
]),
285: ("Ms Frost works as a permanently employed staff member in an office. What does she NOT have to pay from her salary?", [
    "income tax",
    "contributions to unemployment insurance",
    "contributions to pension and health insurance",
    "VAT (sales tax)",
]),
286: ("Which organisation in a company helps employees with problems with the employer?", [
    "the works council (Betriebsrat)",
    "the auditor",
    "the company group",
    "company management",
]),
287: ("You want to end your employment at a company in Germany. What must you pay attention to?", [
    "the salary payments",
    "the working hours",
    "the notice period",
    "the insurance obligation",
]),
288: ("What is the basis of Germany's special responsibility towards Israel?", [
    "membership in the European Union (EU)",
    "the National Socialist crimes against Jews",
    "the Basic Law of the Federal Republic of Germany",
    "the Christian tradition",
]),
289: ("A man with dark skin applies for a job as a waiter in a restaurant in Germany. What is an example of discrimination? He only doesn't get the job because …", [
    "his German skills are insufficient.",
    "he has too high salary expectations.",
    "he has dark skin.",
    "he has no work experience.",
]),
290: ("You have bought a television in Germany. At home you unpack the television, but it doesn't work. What can you do?", [
    "write a complaint",
    "make a warranty claim",
    "exchange the device without asking",
    "extend the warranty",
]),
291: ("Why must you state whether you belong to a church or not in your German tax return? Because …", [
    "there is a church tax linked to income and wage tax.",
    "this is important for statistics in Germany.",
    "you have to pay more taxes if you don't belong to a church.",
    "the church is responsible for the tax return.",
]),
292: ("The people in Germany live according to the principle of religious tolerance. What does that mean?", [
    "No mosques may be built.",
    "All people believe in God.",
    "Everyone can believe what they want.",
    "The state decides which God people believe in.",
]),
293: ("What is a German tradition at Easter?", [
    "placing pumpkins in front of the door",
    "decorating a Christmas tree",
    "painting eggs",
    "firing rockets into the air",
]),
294: ("Whitsun (Pfingsten) is a …", [
    "Christian public holiday.",
    "German day of remembrance.",
    "international day of mourning.",
    "Bavarian custom.",
]),
295: ("Which religion has shaped European and German culture?", [
    "Hinduism",
    "Christianity",
    "Buddhism",
    "Islam",
]),
296: ("In Germany, the last four weeks before Christmas are called …", [
    "the Day of Prayer and Repentance (Buß- und Bettag).",
    "Harvest Festival (Erntedankfest).",
    "the Advent season.",
    "All Saints' Day (Allerheiligen).",
]),
297: ("From which country have most migrants come to Germany?", [
    "Italy",
    "Poland",
    "Morocco",
    "Turkey",
]),
298: ("In the GDR, migrants mainly came from …", [
    "Vietnam, Poland, Mozambique.",
    "France, Romania, Somalia.",
    "Chile, Hungary, Zimbabwe.",
    "North Korea, Mexico, Egypt.",
]),
299: ("Foreign workers recruited by the Federal Republic of Germany in the 1950s and 1960s were called …", [
    "undocumented workers.",
    "guest workers (Gastarbeiter).",
    "temporary workers.",
    "shift workers.",
]),
300: ("From which country did the first guest workers (Gastarbeiter) come to the Federal Republic of Germany?", [
    "Italy",
    "Spain",
    "Portugal",
    "Turkey",
]),
301: ("Which coat of arms belongs to the federal state of Berlin?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
302: ("Which is a district of Berlin?", [
    "Altona",
    "Prignitz",
    "Pankow",
    "Mecklenburgische Seenplatte",
]),
303: ("For how many years is the state parliament in Berlin elected?", [
    "3",
    "4",
    "5",
    "6",
]),
304: ("From what age may you vote in Berlin in local elections (election of the district assembly)?", [
    "14",
    "16",
    "18",
    "20",
]),
305: ("What colours does the state flag of Berlin have?", [
    "blue-white-red",
    "white-red",
    "green-white-red",
    "black-gold",
]),
306: ("Where can you get information about political topics in Berlin?", [
    "at the public order office of the municipality",
    "at the churches",
    "at the consumer advice centre",
    "at the State Centre for Political Education",
]),
307: ("Which federal state is a city-state?", [
    "Berlin",
    "Saarland",
    "Brandenburg",
    "Hesse",
]),
308: ("Which federal state is Berlin?", [
    "Image 1",
    "Image 2",
    "Image 3",
    "Image 4",
]),
309: ("What is the head of government of the city-state of Berlin called?", [
    "Minister-President",
    "Lord Mayor",
    "President of the Senate",
    "Governing Mayor (Regierender Bürgermeister/in)",
]),
310: ("Which senator does Berlin NOT have?", [
    "Senator for Finance",
    "Senator for the Interior",
    "Senator for Foreign Relations",
    "Senator for Justice",
]),
}

def escape_ts(s):
    """Escape a string for use inside a TypeScript double-quoted string."""
    return s.replace('\\', '\\\\').replace('"', '\\"')

def main():
    src = '/Users/hasan/Documents/claude-101/pr-test-practice/einbuergerungstest/src/data/questions.ts'
    with open(src, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    current_id = None
    opt_index = 0  # which option within current question
    in_opts = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # Detect question id
        id_match = re.match(r'\s*id:\s*(\d+),', line)
        if id_match:
            current_id = int(id_match.group(1))
            opt_index = 0
            in_opts = False
            out.append(line)
            i += 1
            continue

        # Detect start/end of opts array
        if re.search(r'opts:\s*\[', line):
            in_opts = True
        if in_opts and re.search(r'^\s*\],', line):
            in_opts = False

        # Replace question-level en: ''
        if not in_opts and re.match(r"(\s*en:\s*)'',", line):
            if current_id and current_id in TRANSLATIONS:
                indent = re.match(r'(\s*)', line).group(1)
                q_en = escape_ts(TRANSLATIONS[current_id][0])
                out.append(f'{indent}en: "{q_en}",\n')
                i += 1
                continue

        # Replace option-level en: ''
        if in_opts and re.match(r"(\s*)\{ de:", line):
            # This is an option line; check if it has en: ''
            if re.search(r"en: ''", line):
                if current_id and current_id in TRANSLATIONS:
                    opts_list = TRANSLATIONS[current_id][1]
                    if opt_index < len(opts_list):
                        opt_en = escape_ts(opts_list[opt_index])
                        new_line = re.sub(r"en: ''", f'en: "{opt_en}"', line)
                        out.append(new_line)
                        opt_index += 1
                        i += 1
                        continue
            opt_index += 1

        out.append(line)
        i += 1

    with open(src, 'w', encoding='utf-8') as f:
        f.writelines(out)

    print(f"Done. Processed {len(TRANSLATIONS)} questions.")

if __name__ == '__main__':
    main()
