# MODULE: Module 3 — Capabilities, Limitations & API Basics
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Capabilities & Use Cases

## Introduction & Core Concepts

LLMs are general-purpose tools, but their sweet spot is **language tasks**: anything that turns input text into better text. Knowing where they shine — and where they don't — is the difference between shipping real features and forcing square pegs.

### Where LLMs Excel

| Capability | Example |
|---|---|
| Summarization | Contract summaries, meeting notes, article digests |
| Generation | Drafts, emails, marketing copy, blog posts |
| Translation | Cross-language text, preserving tone |
| Rewriting | Simplify, formalize, shorten, expand |
| Code | Generate, explain, review, convert languages |
| Extraction | Pull names, dates, amounts from documents |
| Classification | Sentiment, intent, topic tagging |
| Chat/QA | Support bots, tutors, document Q&A |
| Structuring | Unstructured text → tables, JSON |

### Where LLMs Fail

| Weakness | Why |
|---|---|
| Exact arithmetic | Word-prediction isn't computation |
| Current events | Knowledge cutoff |
| Precision facts | Hallucination risk |
| Sensitive data | Privacy — data enters the provider's systems |
| Arbitrary rules | "Count the letter r in strawberry" — attention limits |

### The Capability-Confidence Scale

```
What you can trust with care:
Summaries, drafts, explanations, first-draft code

What you must verify:
Numbers, quotes, references, legal/medical advice, exact counts

What you should never delegate:
Passwords, decisions with real-world consequences
```

**Real-world analogy:** An LLM is like a brilliant, fast-reading intern: superb at first drafts, digests, and rephrasing — but you'd never let the intern alone sign a contract, quote a price, or handle the safe combination. You review their work because they occasionally get details wrong with total confidence.

### Real-World Use Cases & Rules

- Match the task to the model: language tasks = LLM territory
- For facts, give the source text in the prompt (RAG, next module)
- For math/logic, use tools (code, calculators) instead of the model
- Never process unapproved sensitive data

### Key Takeaways

- Excel: summarize, generate, translate, rewrite, code, extract, classify
- Fail: exact math, live facts, precision counts
- Draft-grade output needs human verification for anything consequential
- Capability awareness prevents embarrassing features

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Hallucinations & How to Reduce Them

## Introduction & Core Concepts

**Hallucination** is when a model generates plausible-sounding content that is wrong — made-up facts, fake citations, invented statistics. It happens because models optimize for fluent continuation, not truth.

### Why It Happens

- The model predicts likely text — and wrong facts can be "likely"
- Ambiguous or empty context forces confident guessing
- No verification step exists at generation time
- Training data itself contains errors

### The Severity Spectrum

```
Made-up example that clearly didn't happen   → caught by humans
Fake citation (looks real, doesn't exist)    → dangerous in research
Confident wrong number in an otherwise perfect answer → worst kind
```

**Real-world analogy:** Hallucination is the guest at a party who tells fascinating stories with total conviction — some true, some embellished, some entirely invented. The stories are compelling because the storyteller believes them. Your job is to fact-check the storyteller, never to quote them as a source.

### The Anti-Hallucination Toolkit

| Technique | How It Works |
|---|---|
| Ground the model | "Answer ONLY from the text below" + attach source (RAG) |
| Few-shot with correct answers | Model imitates verified examples |
| Lower temperature | Reduces wilder sampling |
| Ask for hedging | "If unknown, say 'not found in the provided text'" |
| Ask for evidence | "Quote the exact sentence supporting this" |
| Verify in code | Check citations exist; validate JSON fields |
| Human review loop | Flag uncertain answers for a person |

### Real-World Use Cases & Rules

- RAG (grounding with sources) is the #1 mitigation
- Explicitly allow "I don't know" — models need permission to abstain
- Critical outputs: always verify before acting
- Never present model output as authoritative without review

### Key Takeaways

- Hallucination = fluent, confident, wrong content
- Ground with source text; allow "I don't know"
- Lower temperature; demand quotes/evidence
- Consequential outputs always get human verification

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Making Your First API Call

## Introduction & Core Concepts

LLMs are consumed through **APIs** — the same HTTP/JSON concepts you learned in the API course. This topic covers the universal shape of an LLM API call.

### The Universal Pattern

```js
// Pseudocode — every provider (OpenAI, Anthropic, DeepSeek...) follows this shape
const response = await client.chat.completions.create({
    model: "gpt-5",                    // which model
    messages: [                        // the conversation
        { role: "system", content: "You are a helpful tutor." },
        { role: "user", content: "Explain REST APIs simply." },
    ],
    temperature: 0.7,                  // creativity control
    max_tokens: 500,                   // output cap
});
```

### Anatomy of the Request

| Field | Meaning |
|---|---|
| model | Which model to use (pricing and quality vary) |
| messages | Ordered list: system, user, assistant... |
| temperature | Randomness (0–1+ typical) |
| max_tokens | Response length cap |
| response_format | JSON mode when needed |

### Anatomy of the Response

```json
{
    "id": "chatcmpl-9x...",
    "model": "gpt-5",
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "REST is an API style where..."
            }
        }
    ],
    "usage": {
        "prompt_tokens": 45,
        "completion_tokens": 89,
        "total_tokens": 134
    }
}
```

**Explanation:** The answer lives in `response.choices[0].message.content`. The `usage` object reports exactly how many tokens were consumed — this is your billing receipt.

### The API Key

```
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer sk-...
Content-Type: application/json
```

- Keys are issued per account from the provider's dashboard
- Send them in the Authorization header — never in code you commit
- Keys are secret: rotate on leak, scope per project

**Real-world analogy:** The LLM API is a power socket: the model (power station) is far away; the API (socket) is the standard connection any device can use. The API key is your electricity bill account — without it, no power; misused, it's your name on the bill.

### Real-World Use Cases & Rules

- The chat-completions pattern is the industry standard
- Answer = choices[0].message.content; cost = usage.total_tokens
- Temperature by task: low for facts, higher for creativity
- Protect API keys like passwords — env variables, never git

### Key Takeaways

- LLM APIs follow one universal pattern: model + messages + parameters
- Response: choices[0].message.content; usage = tokens/cost
- Authorization: Bearer header with your key
- Handle errors and retries in production code

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: RAG: Grounding Models in Your Data

## Introduction & Core Concepts

**RAG (Retrieval-Augmented Generation)** is the standard way to make an LLM answer from YOUR documents instead of its training data: retrieve relevant text, inject it into the prompt as context, and instruct the model to answer only from it.

### The RAG Pipeline

```
User question: "What are the prerequisites for the React course?"
        │
        ▼
1. Embed the question (convert to numbers via an embedding model)
        │
        ▼
2. Search your document store for similar text
   (vector database, or keyword search — embeddings are better)
        │
        ▼
3. Retrieve top chunks (e.g., 3–5 most relevant passages)
        │
        ▼
4. Build the prompt: system instructions + retrieved chunks + question
        │
        ▼
5. LLM answers ONLY from the provided chunks
```

### The Prompt in RAG

```
System: "Answer the question using ONLY the provided context.
If the answer is not in the context, say 'I could not find
this in the provided material.'"

Context:
[Course syllabus excerpt 1...]
[Course syllabus excerpt 2...]

User: "What are the prerequisites for the React course?"
```

### Why RAG Beats Raw Models for Business Data

- Fresh, private, specific data — documents change daily
- Answers are traceable: every claim links to a source chunk
- Hallucination drops sharply (the answer must come from the context)
- Your data never needs to be part of the model's training

**Real-world analogy:** RAG is the librarian-assisted reference desk: the librarian (retriever) runs to the stacks, pulls the three most relevant books (chunks), opens them to the right pages, and only then does the assistant (LLM) answer — reading from the open pages, not from memory. The answer is accurate because it's read, not recalled.

### Real-World Use Cases & Rules

- RAG = retrieve relevant text → inject into prompt → answer from it
- Embeddings turn text into numbers for similarity search
- Retrieval quality limits answer quality — index good chunks
- Always instruct the model to answer only from context, and to abstain otherwise
- RAG powers the document Q&A bots used by enterprises everywhere

### Key Takeaways

- RAG grounds answers in your documents
- Pipeline: embed → retrieve → prompt with context → answer from it
- Traceability + freshness + fewer hallucinations
- The dominant pattern for real-world LLM products

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: Which task is an LLM best at?
A: Exact arithmetic
A: Summarizing documents
A: Live sports scores
A: Password generation
ANS: 1

Q: What is a hallucination?
A: A model that refuses to answer
A: Plausible but wrong content generated confidently
A: A slow response
A: A token limit error
ANS: 1

Q: What is the #1 technique to reduce hallucinations?
A: Higher temperature
A: Grounding the model with source text (RAG)
A: Longer prompts
A: Using a bigger model
ANS: 1

Q: Why should models be explicitly allowed to say "I don't know"?
A: It saves tokens
A: They otherwise guess rather than abstain
A: It is a UI requirement
A: It speeds up responses
ANS: 1

Q: Where does the assistant's answer live in an API response?
A: response.choices[0].message.content
A: response.model
A: response.id
A: response.usage
ANS: 0

Q: What does the usage object in a response tell you?
A: The model's version
A: The number of tokens consumed
A: The request time
A: The API key
ANS: 1

Q: How should API keys be handled?
A: Hardcoded in the repo
A: Stored in environment variables, never committed
A: Sent in the URL
A: Shared in chat
ANS: 1

Q: What does RAG stand for?
A: Rapid API Generation
A: Retrieval-Augmented Generation
A: Random Access Generator
A: Real-time Answer Gateway
ANS: 1

Q: In RAG, what does the retrieval step do?
A: Trains the model
A: Finds the most relevant chunks of your documents
A: Sends emails
A: Generates embeddings for the whole dataset each call
ANS: 1

Q: Why is RAG better than raw model answers for business data?
A: It is cheaper in all cases
A: Answers are traceable to sources and stay current
A: It removes the need for databases
A: It always works without prompts
ANS: 1
