# MODULE: Module 2 — Prompting & Working with Models
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: System vs User Prompts

## Introduction & Core Concepts

API calls to LLMs send a list of messages. Two roles matter most: **system** — the invisible instructions setting the model's behavior — and **user** — what the user actually asked.

```js
const messages = [
    {
        role: "system",
        content:
            "You are a strict math tutor. Explain step by step. " +
            "Never give the answer directly — guide the student. " +
            "Keep answers under 150 words.",
    },
    {
        role: "user",
        content: "Solve: 3x + 5 = 20. What is x?",
    },
];
```

**Explanation:** The system prompt is the constitution of the conversation: it defines persona, rules, tone, format, and constraints. The user message is the actual task. Everything the model "knows" about how to behave comes from system instructions.

### What Goes in a System Prompt

| Element | Example |
|---|---|
| Role/persona | "You are a professional career advisor" |
| Task rules | "Answer only from the provided document" |
| Format | "Respond as a numbered list with headers" |
| Tone | "Use simple language for beginners" |
| Constraints | "Never invent statistics" |
| Safety | "Refuse harmful requests politely" |

### How Roles Differ

- **system** — persistent instructions, first in the list
- **user** — the question/task (real user or your app's data)
- **assistant** — the model's own past responses (history for follow-ups)

**Real-world analogy:** The system prompt is the job briefing given to a new employee on day one: the role, the rules, the format, the no-go areas. The user prompt is each customer request that walks in afterward. The employee responds differently to the same request depending on the briefing they received.

### Real-World Use Cases & Rules

- Put durable rules in system, variable tasks in user
- Repeating the same rule in every user message wastes tokens
- System instructions are tampered with only by developers — that's the point
- Persona + rules + format + constraints = the complete briefing

### Key Takeaways

- system = the model's standing instructions
- user = the specific request
- assistant = history
- A strong system prompt beats a thousand reworded user prompts

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: Prompt Design & Clarity

## Introduction & Core Concepts

**Prompting** is the skill of writing instructions an LLM follows well. Small wording changes produce dramatically different results — this is the single most practical skill in this course.

### The Recipe: Context → Task → Constraints → Format

```
Context:  what the model needs to know (data, audience, situation)
Task:     the exact job (in imperative verbs)
Constraints: limits (length, tone, no-X, only-from-document)
Format:   how to shape the answer (JSON, list, table, headings)
```

### Weak vs Strong

```
❌ Weak: "Write about React."

✅ Strong: "You are a technical writer. Write a 120-word
introduction to React for absolute beginners with no coding
background. Explain what React is and why companies use it.
Use everyday language, avoid jargon, and end with a single
sentence on where to learn more."
```

### The Power of Examples (Few-Shot)

```
Task: Classify the sentiment of product reviews as Positive,
Neutral, or Negative.

Example 1: "Battery dies in an hour." → Negative
Example 2: "Great value for the price." → Positive

Now classify: "It's okay, does the job." →
```

**Explanation:** One or two worked examples teach the model the exact output shape — often beating long verbal descriptions. This technique is called **few-shot prompting**.

**Real-world analogy:** A vague prompt is like telling a taxi driver "take me somewhere nice." A strong prompt is "take me to the airport, departures, via the highway, no tunnels, and I need to be there by 6 PM" — context, task, constraints, and format in one briefing.

### Real-World Use Cases & Rules

- Imperative verbs: "Summarize", "List", "Convert"
- Specify the audience: "for a 10-year-old", "for a senior engineer"
- Give the exact format: JSON schema, markdown table, bullet count
- Add examples when precision matters (few-shot)
- If output is wrong, tighten the prompt before blaming the model

### Key Takeaways

- Recipe: Context → Task → Constraints → Format
- Specify audience, length, and format explicitly
- Examples (few-shot) teach exact output shapes
- Prompt quality drives output quality

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Output Formats & JSON Mode

## Introduction & Core Concepts

For APIs, free-form prose is rarely enough — applications need **structured output**. Modern LLMs support guaranteed **JSON mode** (or structured outputs): the response is valid JSON matching a schema you define.

### JSON Mode

```js
const response = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "system",
            content:
                "Extract the information and return valid JSON " +
                "matching this schema exactly: " +
                '{"title": string, "author": string, "year": number}',
        },
        {
            role: "user",
            content: "The Great Gatsby, by F. Scott Fitzgerald, 1925.",
        },
    ],
    response_format: { type: "json_object" },
});
```

**Expected output:**
```json
{ "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": 1925 }
```

**Explanation:** JSON mode guarantees a parseable JSON response, so your code can reliably extract fields instead of parsing prose. You still specify the schema in the prompt — the model follows it because it's constrained to valid JSON.

### Why Structured Output Matters

- Directly feed results into databases and code — no fragile text parsing
- Catch errors in your app, not in free-form text
- Build LLM features that feel like normal software

### Beyond JSON: Other Formats

| Format | Use Case |
|---|---|
| JSON | API data extraction, app integration |
| Markdown | Documentation, chat rendering |
| CSV/table | Spreadsheet-style data |
| XML | Legacy systems, structured documents |

### Real-World Use Cases & Rules

- Enable JSON mode when the app consumes the output programmatically
- Define the schema in the system prompt and repeat it in the format instruction
- Validate the parsed JSON in code — models still make mistakes
- Give examples of valid output when the schema is complex

### Key Takeaways

- Structured output (JSON mode) = parseable, reliable results
- Schema is defined by you in the prompt
- Always validate JSON in your application code
- Prose for humans, structured output for machines

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: Iterating on Prompts

## Introduction & Core Concepts

Prompting is an **iteration loop**, not a single shot. Professionals refine prompts until behavior is correct — the same discipline as debugging code.

### The Iteration Loop

```
Write prompt
   │
   ▼
Test with real inputs (several of them!)
   │
   ▼
Observe failures & close calls
   │
   ▼
Diagnose: what is ambiguous? what is missing?
   │
   ▼
Refine: clarify, add constraint, add example
   │
   ▼
Re-test → repeat until consistent
```

### Common Fixes

| Problem | Fix |
|---|---|
| Answer too long | "Respond in exactly 3 sentences" |
| Wrong format | Add an example of the exact format |
| Hallucinated facts | "Only use information provided below" + attach the source text |
| Inconsistent tone | Add a tone rule: "casual and friendly" |
| Ignores a rule | Move the rule to the system prompt, restate it clearly |
| Edge cases missed | Add an example covering each case |

### A Real Refinement Sequence

```
v1: "Summarize this article." 
    → "Summary is 400 words. Too long."

v2: "Summarize this article in exactly 3 sentences, in your own words."
    → "Three sentences, but mentions a statistic not in the article."

v3: "Using ONLY the article below, summarize it in exactly 3
sentences. Do not add information that is not in the article.
Article: ..."
    → "Three sentences, article-only facts. Good."
```

**Real-world analogy:** Prompt iteration is tuning a guitar: each pass checks the strings (outputs), finds which is off (diagnosis), and adjusts one knob at a time (single-change refinements) until the chord rings true across all test notes.

### Real-World Use Cases & Rules

- Change ONE thing per iteration — combined edits hide the cause
- Test with multiple inputs, including edge cases
- Keep a version history of prompts (git!) — regressions happen
- If it still fails, simplify the task instead of lengthening the prompt
- Treat prompt quality like code quality: reviewed, tested, versioned

### Key Takeaways

- Prompting = iterate: test, diagnose, refine, re-test
- One change per iteration
- Examples and constraints fix the most common failures
- Version and review prompts like code

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: Which message role holds the model's standing instructions?
A: user
A: system
A: assistant
A: tool
ANS: 1

Q: Where does the actual task belong in an API call?
A: In the system prompt
A: In the user message
A: In the model name
A: In the temperature
ANS: 1

Q: What is the recommended prompt recipe?
A: Task → Format → Task again
A: Context → Task → Constraints → Format
A: Greeting → Joke → Question
A: Format → Context → Joke
ANS: 1

Q: Why specify the audience in a prompt?
A: It is a tradition
A: It shapes tone, vocabulary, and depth of the response
A: The model needs a target to sound human
A: It saves tokens
ANS: 1

Q: What is few-shot prompting?
A: Sending multiple prompts at once
A: Including worked examples in the prompt to teach the output shape
A: Retrying failed calls
A: Using a small model
ANS: 1

Q: What does JSON mode guarantee?
A: Shorter responses
A: A valid JSON response matching the schema you specify
A: Lower cost
A: Faster responses
ANS: 1

Q: Why do apps use structured output instead of prose?
A: Prose is invalid JSON
A: Structured output is directly usable by databases and code
A: Models cannot write prose
A: It doubles the token budget
ANS: 1

Q: What should you change per iteration when refining a prompt?
A: Everything at once
A: One thing at a time
A: The model
A: Nothing — prompts never change
ANS: 1

Q: How do you stop a model from inventing facts?
A: Raise temperature to 2.0
A: Instruct it to use only the provided source text and attach that text
A: Ask it politely
A: Use longer prompts
ANS: 1

Q: How should prompts be managed in a team?
A: Emailed around
A: Versioned and reviewed like code
A: Kept in chat history
A: Deleted after use
ANS: 1
