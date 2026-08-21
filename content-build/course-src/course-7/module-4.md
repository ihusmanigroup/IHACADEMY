# MODULE: Module 4 — Best Practices, Ethics & Real-World Use
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: Costs & Model Selection

## Introduction & Core Concepts

LLM features have real operating costs — every API call burns tokens. Choosing the right model and optimizing usage is an engineering skill, not an afterthought.

### How Pricing Works

```
cost = (input_tokens × input_price) + (output_tokens × output_price)
```

- Input tokens are cheap; **output tokens cost several times more** per token
- Prices vary by model tier: frontier models cost more per token than small models
- Long system prompts and history are paid on EVERY call — they add up
- Caching exists: some providers discount repeated input prefixes

### The Model Tier Ladder

| Tier | Best For | Example Families |
|---|---|---|
| Small/fast | Classification, extraction, high volume, low latency | gpt-mini, llama small, claude-haiku |
| Mid | General assistance, summarization, chat | gpt, claude-sonnet, gemini |
| Large/frontier | Hard reasoning, long documents, complex code | gpt-5, claude-opus, deepseek-reasoner |

**Rule of thumb:** use the smallest model that passes your quality tests — most workloads don't need frontier models.

### Cost Control Playbook

| Technique | Effect |
|---|---|
| Right-size the model | Large savings vs frontier tier |
| Trim system prompts | Saved on EVERY call |
| Cap max_tokens | No surprise long answers |
| Shorten history | Keep only recent relevant turns |
| Batch low-priority jobs | Cheaper offline paths |
| Cache prompts | Discounted repeated prefixes |
| Monitor usage | Dashboard + budget alerts |

**Real-world analogy:** Model selection is vehicle choice: a cargo van (small model) delivers most goods cheaply; a sports car (frontier model) is exciting but burns money per trip. Fleet managers pick the vehicle per route — smart teams do the same per task.

### Real-World Use Cases & Rules

- Track tokens per feature; measure cost per successful action
- Test small models before upgrading tier
- Cache and reuse where possible
- Set hard budget alerts before shipping

### Key Takeaways

- Output tokens dominate cost
- Smallest model that passes tests wins
- Trim prompts, cap outputs, shorten history
- Monitor and alert on spend

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Privacy, Security & Responsible AI

## Introduction & Core Concepts

LLM features handle real user data. The responsible pattern: **minimize data, protect secrets, design for safety.**

### Data Minimization

- Send only what the task needs — not the whole conversation, not the whole database
- Prompt-injectable data (emails, documents) is a vector — treat it as untrusted input
- Understand the provider's data policy: what is retained, what is used for training? Enterprise tiers offer zero-retention options

### Secrets & Leaks

```
❌ Never:
  - Put API keys in prompts or code
  - Log raw prompts or responses with sensitive content
  - Let model output be rendered as HTML without escaping
     (the model can output <script> tags!)

✅ Always:
  - Keys in environment variables
  - Redact PII in logs
  - Sanitize model output before rendering
```

### The Safety Layer: System Prompts

```
"You are a helpful tutor. Refuse requests to produce harmful
content: violence instructions, fraud, harassment, or
misleading dangerous advice. Politely decline and offer a
safe alternative."
```

**Explanation:** Safety instructions in the system prompt shape behavior — but never rely on them alone. Add application-level guardrails: input filtering, output checks, human review for sensitive actions.

### The Four Pillars of Responsible LLM Apps

| Pillar | Practice |
|---|---|
| Transparency | Tell users they're talking to AI |
| Accuracy | Ground with sources; flag uncertainty |
| Privacy | Minimize data; secure storage |
| Oversight | Human review for consequential outputs |

**Real-world analogy:** Responsible AI is a teenager's first job: the teenager (model) is capable but needs rules (system safety), supervision (review loops), and a safe cash box (key management). The store's reputation depends on how carefully the system is designed — not on the teenager's good intentions.

### Real-World Use Cases & Rules

- Minimize data; know your provider's retention policy
- Keys in env; redact logs; escape model output in HTML
- Safety prompts + application-level guardrails together
- Transparency and human oversight for anything consequential

### Key Takeaways

- Send minimum data; treat injected text as untrusted
- Protect keys; sanitize output; scrub logs
- Safety = system prompt + app guardrails + review
- Design for transparency and oversight

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: Evaluating LLM Outputs

## Introduction & Core Concepts

"How do I know the model is doing a good job?" — **evaluation** answers that with measurements instead of vibes. Teams that ship reliable AI features evaluate systematically.

### The Evaluation Dimensions

| Dimension | Measures |
|---|---|
| Accuracy | Does the output match ground truth? |
| Faithfulness | Does it stay within the provided context? |
| Format compliance | Does it follow the requested JSON/schema? |
| Relevance | Does it answer the actual question? |
| Safety | Does it refuse harmful requests? |
| Latency/cost | Is it fast and affordable enough? |

### The Evaluation Loop

```
1. Build a golden set: 50–200 realistic inputs with expected outputs
2. Run the pipeline on the set
3. Score automatically (exact match, schema check, LLM-as-judge)
   + spot-check by humans
4. Change prompt/model/parameters
5. Re-run and compare scores
6. Accept the change only if scores hold or improve
```

### Practical Techniques

- **Golden set**: curated Q&A pairs — the backbone of LLM evaluation
- **LLM-as-judge**: a second model grades outputs against rubrics (fast, scalable)
- **A/B testing**: compare prompt versions on live traffic
- **Regression guard**: re-run the golden set on every change — prompts degrade silently

**Real-world analogy:** Evaluation is a chef's tasting panel: you don't ship a new menu on a single taste test. A panel (golden set), scoring rubrics (criteria), and regular blind tastings (regression runs) decide what reaches customers — and the panel catches a bad batch before the public does.

### Real-World Use Cases & Rules

- Golden sets + automated scoring = the baseline
- Every prompt change re-runs the evaluation
- Track scores over time — model updates can change behavior
- Human review of samples catches what automation misses

### Key Takeaways

- Evaluate on accuracy, faithfulness, format, safety, cost
- Golden set + automated scoring + regression runs
- LLM-as-judge scales review; humans spot-check
- Any prompt change requires re-evaluation

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Real-World Usage & Capstone

## Introduction & Core Concepts

LLMs power products you use daily: ChatGPT, Claude, Gemini — and embedded features everywhere: email autocomplete, support bots, code assistants (Copilot), document Q&A, translation, meeting summaries, and this platform's future AI tutor. The pattern is always the same: prompt design, model selection, grounding, evaluation, and cost control.

### Capstone: Course Q&A Assistant with RAG

This project combines every module: system prompts, structured output, API calls, and RAG grounding:

```js
// assistant.js — RAG-powered Q&A for a course catalog
import { readFileSync } from "node:fs";

// 1. Pretend retrieval: our "vector search" returns these chunks
const chunks = [
    "The React course requires JavaScript fundamentals.",
    "REST APIs return JSON over HTTP.",
    "Git is used to track changes in code.",
];

// 2. Build the grounded prompt
const question = "What do I need before starting React?";

const systemPrompt = `
You are the IH Academy study assistant.
Answer ONLY from the context below.
If the answer is not in the context, reply:
"I could not find this in the provided material."
Keep answers under 60 words.
`;

const userPrompt = `
Context:
${chunks.join("\n")}

Question: ${question}
`;

// 3. Call the LLM API (pseudocode — use your provider's SDK)
const response = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ],
    temperature: 0.2,   // low: grounded, factual answers
    max_tokens: 150,
});

const answer = response.choices[0].message.content;
console.log("Assistant:", answer);
// Expected: mentions JavaScript fundamentals, drawn only from context
```

**Explanation:** The question is answered ONLY from the provided chunks — the system prompt forbids outside knowledge, temperature is low for factual stability, and the "I don't know" instruction covers gaps. Swap the fake chunks for a real vector search (an embeddings API + vector store) and you have a production RAG assistant.

### Your Next Steps

1. Replace the fake retrieval with real embeddings + vector search
2. Add an evaluation set of 20 Q&A pairs and score the system
3. Add cost tracking and a budget alert
4. Compare a small and a frontier model on the golden set
5. Build a chat UI on top (React, of course)

### Key Takeaways

- LLM products follow one pattern: prompt + model + grounding + evaluation
- The capstone is a production RAG assistant in miniature
- Next: embeddings, vector stores, fine-tuning, agent tool use
- You now understand how ChatGPT-class features are actually built

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: Which tokens are the most expensive per token?
A: Input tokens
A: Output tokens
A: System tokens
A: They all cost the same
ANS: 1

Q: Which model tier is right for high-volume classification?
A: Frontier model
A: Small/fast model
A: The most expensive model
A: There is no right tier
ANS: 1

Q: What is the rule of thumb for model selection?
A: Always the largest model
A: The smallest model that passes your quality tests
A: The most popular model
A: Any model works
ANS: 1

Q: Where should API keys live?
A: In the prompt
A: In environment variables
A: In the database
A: In logs
ANS: 1

Q: Why must model output be escaped before rendering as HTML?
A: It is prettier
A: The model can output <script> tags that would execute
A: It makes the page load faster
A: It is a CSS requirement
ANS: 1

Q: What is the first step of building an evaluation set?
A: Deploying to production
A: Collecting realistic inputs with expected outputs
A: Buying more GPUs
A: Asking the model
ANS: 1

Q: What is LLM-as-judge?
A: A court for AI disputes
A: Using a second model to grade outputs against rubrics
A: A legal requirement
A: A debugging tool
ANS: 1

Q: Why re-run the golden set after every prompt change?
A: To spend tokens
A: Prompt changes can silently degrade quality
A: It is a formality
A: The set changes itself
ANS: 1

Q: In the capstone, what keeps the answer grounded in the context?
A: A high temperature
A: The system prompt forbidding outside knowledge
A: The question length
A: The model name
ANS: 1

Q: What does the assistant reply when the answer is not in the context?
A: A random guess
A: "I could not find this in the provided material."
A: Nothing
A: It crashes
ANS: 1
