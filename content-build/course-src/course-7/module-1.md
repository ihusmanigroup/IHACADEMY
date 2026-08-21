# MODULE: Module 1 — What Are LLMs?
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: Understanding LLMs

## Introduction & Core Concepts

A **Large Language Model (LLM)** is an AI system trained on enormous amounts of text that can understand, generate, and work with human language. "Large" refers to the billions of parameters — the model's internal settings, learned from training data, that shape how it responds.

**Explanation:** LLMs predict the next word in a sequence. Show them "The capital of France is..." and they continue "...Paris." Every sentence they produce is built word-by-word from probability — but the scale of training makes this simple mechanism produce astonishing results.

**Real-world analogy:** An LLM is like a librarian who has read nearly every book ever written. When you ask a question, they don't look anything up in a database — they answer from everything they've absorbed, in fluent, confident language. Their strength is breadth and speed; their weakness is that their "memory" is training data, not a live reference desk.

### Famous LLMs

| Model | Company | Known For |
|---|---|---|
| GPT-4 / GPT-5 | OpenAI | ChatGPT — general assistant |
| Claude | Anthropic | Long documents, careful writing |
| Gemini | Google | Integrated with Google products |
| Llama | Meta | Open-source, runnable locally |
| DeepSeek | DeepSeek AI | Open-weight models, strong reasoning |

### What LLMs Can Do

- Write, summarize, and translate text
- Answer questions and explain concepts
- Generate code and debug existing code
- Structure and analyze data (with limitations)
- Power chatbots and virtual assistants
- Help with learning — exactly how this course uses them

### Real-World Use Cases & Rules

- LLMs predict text; everything else follows from that
- They have no built-in "truth check" — verify important facts
- Training data has a cutoff date — they don't know recent events unless given them
- Context (what you provide) matters more than the model: prompt quality drives output quality

### Key Takeaways

- LLM = AI trained on massive text data to understand and generate language
- "Large" = billions of learned parameters
- Word-by-word prediction at scale = fluent language
- Powerful but imperfect: verify, provide context, learn prompting

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: Tokens & Parameters

## Introduction & Core Concepts

LLMs don't read words — they read **tokens**: chunks of text (a word, part of a word, or punctuation). Models have a **context window**: the maximum number of tokens they can hold at once.

### Tokenization: The Word Breakdown

```
"I love IH Academy!" → ["I", " love", " IH", " Academy", "!"]

Supercalifragilistic → ["Super", "cali", "fragil", "istic"]
```

**Explanation:** Tokens are how the model prices and limits everything: input, output, and context all count in tokens. Rough rule of thumb: about 750 words ≈ 1,000 tokens in English (it varies by language — some languages need far more tokens per word).

### The Key Numbers

| Term | Meaning | Example |
|---|---|---|
| Context window | Max tokens the model can process at once | 8K, 32K, 128K, 200K+ |
| Max output | Longest single response | Often 4K–8K tokens |
| Input tokens | Your message + system prompt + history | Billed as input |
| Output tokens | The model's response | Billed as output |

### Why Context Size Matters

- Small window → your document + prompt must fit together
- Long history eats context: "chat history bloat" makes early messages forgotten
- Bigger windows cost more per call
- Token math decides what fits: 100K tokens ≈ a medium novel

**Real-world analogy:** The context window is the model's desk. Your question, the attached document, the system instructions, and past conversation all share one desk. Slide too much onto it and the oldest papers fall off — the model literally "forgets" them. Choosing what stays on the desk is a core skill.

### Real-World Use Cases & Rules

- Costs scale with tokens — shorter prompts = cheaper calls
- Count tokens before building features (most providers give token counters)
- Prioritize: system instructions and task-critical content beat chat history
- Different models = different windows; match the model to the job

### Key Takeaways

- Tokens = the model's unit of text and price
- Context window = the desk everything must fit on
- Input + output + history all count toward limits
- Manage context deliberately — it's a skill, not a setting

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: Training: How LLMs Learn

## Introduction & Core Concepts

LLMs learn in three stages. Each stage builds on the last, and each explains a behavior you'll observe in practice.

### Stage 1: Pre-training (The Library)

The model reads petabytes of text — books, articles, websites, code — and learns to **predict the next word**. Trillions of examples tune billions of parameters until the model has absorbed grammar, facts, reasoning patterns, and language structure.

**Result:** A raw "next-word machine" — knows a lot, but doesn't follow instructions well.

### Stage 2: Fine-tuning / Supervised Learning (The Classroom)

Humans write high-quality example conversations: "Given this instruction, here is an excellent response." The model trains on these examples to follow instructions, adopt helpfulness, and refuse harmful requests.

**Result:** An assistant that understands what you want.

### Stage 3: Reinforcement Learning (The Coach)

Humans rank several model responses from best to worst. The model is trained to prefer higher-ranked answers — the "RLHF" technique (Reinforcement Learning from Human Feedback) made famous by ChatGPT.

**Result:** Responses that align with human preferences: helpful, safe, and well-structured.

### What Training Does NOT Do

- No internet access at inference — the model generates from what it learned
- Knowledge frozen at the training cutoff date
- No ability to verify facts in real time
- No memory of your previous conversations across sessions (unless the app stores them)

**Real-world analogy:** Training is like becoming a chess grandmaster: first you study thousands of games (pre-training), then you learn tournament rules and etiquette (fine-tuning), then a coach ranks your moves and sharpens your play (RLHF). On the day of a match you have no coach and no internet — you play purely from everything you internalized.

### Real-World Use Cases & Rules

- Responses come from training, not live research
- Facts older than the cutoff are unknown; newer facts must be supplied
- RLHF is why models are generally helpful and safe — but it's preference shaping, not truth verification
- Knowing the stages explains "why did it say that?" in production

### Key Takeaways

- Three stages: pre-training (next-word), fine-tuning (instruction following), RLHF (human preference)
- No live internet at generation time
- Knowledge cutoff = frozen knowledge
- Training explains model behavior — and its limits

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Inference: How LLMs Generate

## Introduction & Core Concepts

**Inference** is the moment of truth: the model generating a response. Generation is sequential — one token at a time — with **sampling** choosing each next token from probabilities.

```
User: "Explain APIs"
      ▼
System prompt + user message → tokens → model weights
      ▼
Token 1: "APIs"      (chosen from top candidates)
Token 2: " are"      (probabilities updated by context)
Token 3: " the"
Token 4: " backbone"
   ... (repeats until stop token or max output)
```

**Explanation:** Each token choice is a probability decision over the whole vocabulary — influenced by the model's temperature setting and the context so far. This is why the same prompt can produce different answers: the generation has randomness built in.

### The Parameters You Control

| Parameter | What It Does | Effect |
|---|---|---|
| temperature | Randomness of choices | Low (0–0.3): focused, factual; High (0.7–1+): creative, varied |
| max_tokens | Cap on output length | Controls response size and cost |
| top_p | Candidate cutoff | Alternative to temperature for diversity |
| seed | Fix randomness | Same prompt → same output (where supported) |

### Why Responses Vary

- Sampling is probabilistic — multiple valid continuations exist
- Higher temperature = wider sampling = more variety (and more risk of hallucination)
- Lower temperature = more deterministic = better for code and math
- The "same" model can answer differently on two calls — that's normal

**Real-world analogy:** Inference is a game of Chinese whispers with a probabilistic dictionary: each word is chosen from a ranked list of likely next words, influenced by everything said so far. Turn up temperature and the player takes bolder guesses; turn it down and they stick to the safest word every time.

### Real-World Use Cases & Rules

- Set temperature by job: factual → low, creative → high
- Cap max_tokens to control cost and response size
- For reproducible outputs, lower temperature and use a fixed seed
- Generation is sequential — long responses are slower and costlier than short ones

### Key Takeaways

- Inference = sequential token-by-token generation with sampling
- temperature controls creativity/randomness; low = factual
- max_tokens caps output; seed enables reproducibility
- Probabilistic generation explains answer variety

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What does "LLM" stand for?
A: Large Language Model
A: Long Learning Memory
A: Low Latency Machine
A: Logical Language Module
ANS: 0

Q: How does an LLM generate language?
A: By copying from a database
A: By predicting the next token word-by-word
A: By searching the internet
A: By running rule-based grammars
ANS: 1

Q: What are tokens?
A: Security keys
A: Chunks of text the model reads and prices
A: Network packets
A: Database rows
ANS: 1

Q: What is the context window?
A: A browser popup
A: The maximum tokens the model can process at once
A: The training dataset
A: A chat interface
ANS: 1

Q: What happens when input exceeds the context window?
A: The model restarts
A: The oldest content is dropped — the model "forgets" it
A: The call is free
A: The output becomes longer
ANS: 1

Q: Which stage teaches an LLM to follow instructions?
A: Pre-training
A: Fine-tuning
A: Tokenization
A: Inference
ANS: 1

Q: What does RLHF stand for?
A: Really Large Human Files
A: Reinforcement Learning from Human Feedback
A: Rapid Language Handling Framework
A: Recursive Learning Helper Function
ANS: 1

Q: Can an LLM access the internet while generating a response?
A: Yes, always
A: No — it generates from its training
A: Only during pre-training
A: Only with a plugin enabled by default
ANS: 1

Q: What does a high temperature setting do?
A: Makes output more random and creative
A: Freezes the model
A: Shortens responses
A: Enables the internet
ANS: 0

Q: What temperature is best for code generation and math?
A: High (1.0+)
A: Low (0–0.3)
A: Temperature does not matter
A: Negative
ANS: 1
