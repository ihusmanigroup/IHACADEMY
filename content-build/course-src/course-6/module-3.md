# MODULE: Module 3 — Authentication, Security & Rate Limits
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: API Keys & Authentication

## Introduction & Core Concepts

Most real APIs are not public: they require proof of who you are (**authentication**) and often proof of what you're allowed to do (**authorization**).

### Why APIs Need Auth

- Protect private user data
- Prevent abuse: attackers flooding an endpoint with millions of requests
- Track usage and bill customers per call
- Identify which app is making requests

### API Keys: The Simplest Form

An **API key** is a unique string identifying your account/app. You register at the provider's dashboard, get a key, and send it with every request:

```
GET https://api.example.com/v1/weather?city=Lahore
Authorization: Bearer iha_live_9f8e7d6c5b4a
```

```js
const res = await fetch("https://api.example.com/v1/weather?city=Lahore", {
    headers: {
        Authorization: "Bearer iha_live_9f8e7d6c5b4a",
    },
});
```

### Common Auth Methods

| Method | How It Works | Used By |
|---|---|---|
| API key | Single secret string per client | Weather, maps, AI services |
| Bearer token (OAuth2) | Short-lived tokens issued at login | GitHub, Google, Stripe |
| Basic auth | username:password base64-encoded | Legacy/internal systems |
| OAuth2 (social login) | "Sign in with Google" — grants scoped access | Almost every modern app |

**Real-world analogy:** An API key is the ID badge at an office building: you swipe it at every door (request), and the security system (server) checks whether your badge is valid and which rooms (endpoints) you may enter.

### Real-World Use Cases & Rules

- Keys/tokens go in the Authorization header, never in the URL (URLs get logged)
- Store keys in environment variables — never hardcode or commit them
- Restrict keys: scope (which endpoints), IP limits, expiry
- 401 = bad/missing credentials; 403 = valid credentials, insufficient scope

### Key Takeaways

- Auth proves who you are; authorization controls what you can do
- API keys = simple secrets per client; tokens = short-lived credentials
- Send secrets in Authorization headers
- Keep secrets in environment variables

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: Tokens, Sessions & OAuth

## Introduction & Core Concepts

Sessions and tokens are how apps keep you logged in across many requests.

### Sessions (Server-Side State)

1. Client logs in with username + password
2. Server stores a session record, returns a session cookie
3. Client sends the cookie with every request
4. Server checks its session store — logged in!

### Tokens (Stateless)

The modern alternative: the server signs a **JWT (JSON Web Token)** containing the user's identity and expiry, and the client sends it on every request. The server verifies the signature — no server-side session storage needed.

```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyfQ.x0p7V...
```

```js
const login = async () => {
    const res = await fetch("https://api.example.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@ihacademy.com", password: "..." }),
    });
    const { token } = await res.json();
    localStorage.setItem("token", token);
};

const getUser = async () => {
    const res = await fetch("https://api.example.com/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.json();
};
```

**Explanation:** The login endpoint validates credentials and returns a signed token. Subsequent requests attach `Bearer <token>`; the server verifies the signature, reads the expiry, and knows who the caller is — no session database required.

### OAuth: Sign In With Google

**OAuth** lets users log in with an existing account (Google, GitHub, Facebook):

```
User clicks "Sign in with Google"
   → redirected to Google's login page
   → Google asks user to grant scopes (email, profile)
   → user approves
   → Google returns a code to the app
   → app exchanges code for an access token
   → app uses token to fetch user info
```

**Real-world analogy:** A token is like a stamped concert wristband: the band (signature) proves you paid, it expires at midnight (expiry), and staff at every gate just check the band — no central list needed. OAuth is like letting a trusted venue's membership card get you into partner venues: you use your existing identity elsewhere.

### Real-World Use Cases & Rules

- Tokens are signed — verify, don't trust: check expiry and signature server-side
- Never store secrets in localStorage for production; use httpOnly cookies or secure vaults
- JWTs contain identity claims: userId, roles, exp (expiry)
- OAuth = delegated authorization: users grant specific scopes, nothing more

### Key Takeaways

- Sessions: server-side state via cookies; Tokens: stateless signed JWTs
- Authorization: Bearer <token> on every protected request
- OAuth lets users sign in with existing accounts and scoped permissions
- Verify tokens server-side; respect expiry

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Security Essentials

## Introduction & Core Concepts

APIs are attacked constantly. The most important defenses every API developer must know:

### SQL Injection — Your #1 Threat

```sql
-- Attacker input: 1; DROP TABLE users--
SELECT * FROM users WHERE id = 1; DROP TABLE users--
```

**Defense:** Never build SQL by string concatenation. Always parameterized queries (`$1` placeholders in pg, or ORM query builders) — the driver escapes the input so it can never become SQL.

### HTTPS Always

- HTTPS encrypts everything in transit; without it, anyone on the network can read tokens and passwords
- Production APIs must be HTTPS-only; redirect HTTP and reject mixed content

### The Security Checklist

| Threat | Defense |
|---|---|
| SQL injection | Parameterized queries only |
| Stolen tokens | HTTPS, short expiry, rotation |
| Data exposure | Never return passwords/hashes; return only needed fields |
| Rate abuse | Rate limiting (next topic) |
| CORS abuse | Restrict allowed origins on the server |
| Secrets in code | Environment variables, never commit .env |
| Mass assignment | Accept only whitelisted fields in bodies |

### Input Validation: The Front Line

```js
// Accept exactly what the API expects — nothing more
const { title, level } = req.body;   // whitelist, don't spread all fields
if (!title || typeof title !== "string" || title.length > 200) {
    return res.status(400).json({ error: "invalid title" });
}
```

**Real-world analogy:** Security is a bank vault: the vault door (HTTPS) protects the corridor, the guards (auth) check every visitor, the teller windows (input validation) only accept deposit slips — never raw instructions. Attackers succeed only when one of these layers is missing.

### Real-World Use Cases & Rules

- Parameterized queries: ALWAYS, no exceptions
- Never log secrets; mask tokens in logs
- Return minimal data: no password hashes, no internal IDs you don't need
- Validate and whitelist every incoming field
- Keep dependencies updated (npm audit)

### Key Takeaways

- SQL injection is defeated by parameterized queries
- HTTPS, validation, whitelisting, minimal responses
- Secrets: env variables, never in code or logs
- Security is layers — each one counts

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Rate Limiting & CORS

## Introduction & Core Concepts

**Rate limiting** controls how many requests a client may make in a window. **CORS** is the browser's security policy for cross-origin requests.

### Rate Limiting: Why and How

Without limits, one misbehaving client can take an API down. Common limits: 100 requests/hour, or 10/second, per client (identified by API key or IP).

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
Retry-After: 3600
```

**Explanation:** When a client exceeds the limit, the server returns **429 Too Many Requests** with headers telling the client how long to wait (`Retry-After`). Well-behaved clients respect these headers and back off.

**Real-world analogy:** Rate limiting is the velvet rope at a club: 100 guests inside at a time (the limit). The bouncer (server) counts arrivals; when capacity is reached, you wait (429 + Retry-After) until someone leaves. No rope, and the club is overrun — same with APIs.

### CORS: The Browser's Rules for Cross-Origin

A browser page at `https://app.example.com` fetching `https://api.example.com` is a **cross-origin** request. Browsers block reading responses unless the server allows it:

```
Access-Control-Allow-Origin: https://app.example.com
```

**Explanation:** The server opts in via headers. Without the right CORS header, the browser silently blocks the response — the request may reach the server, but the page cannot read the data. This prevents malicious sites from reading your API's responses with your cookies.

### The CORS Headers

| Header | Meaning |
|---|---|
| Access-Control-Allow-Origin | Which origins may read responses (`*` = anyone) |
| Access-Control-Allow-Methods | Which methods are allowed (GET, POST...) |
| Access-Control-Allow-Headers | Which request headers are allowed (Authorization...) |

### Real-World Use Cases & Rules

- Rate limit by key/IP; return 429 with Retry-After
- CORS is server-configured; browsers enforce it
- `*` is fine for public data APIs, too loose for authenticated ones
- Preflight requests (OPTIONS) check CORS before real requests

### Key Takeaways

- Rate limiting = 429 + Retry-After headers
- CORS headers control which browsers may read your API
- Server sets the rules; the browser enforces them
- Design limits and origins intentionally

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: Why do most real APIs require authentication?
A: To slow down clients
A: To protect data, prevent abuse, and track usage
A: It is a JavaScript feature
A: It is optional styling
ANS: 1

Q: Where should an API key be sent in a request?
A: In the URL
A: In the Authorization header
A: In the body of a GET
A: As a cookie named key
ANS: 1

Q: What does a 401 status mean?
A: Forbidden — no permission
A: Unauthorized — missing or invalid credentials
A: Not found
A: Created
ANS: 1

Q: What is a JWT?
A: A JavaScript web template
A: A signed token containing identity claims
A: A CSS framework
A: A database index
ANS: 1

Q: Why are tokens signed?
A: To make them longer
A: So the server can verify they weren't forged and check expiry
A: For aesthetics
A: To compress them
ANS: 1

Q: What defeats SQL injection?
A: Uppercase SQL
A: Parameterized queries
A: Shorter queries
A: Comments in the code
ANS: 1

Q: Why must production APIs use HTTPS?
A: It is faster
A: It encrypts traffic so secrets can't be read in transit
A: HTTPS is only for banks
A: It avoids CORS
ANS: 1

Q: What does a 429 response mean?
A: Server crashed
A: Too many requests — rate limit exceeded
A: Not found
A: Unauthorized
ANS: 1

Q: What does the Retry-After header tell the client?
A: The server's uptime
A: How long to wait before trying again
A: The token expiry
A: The API version
ANS: 1

Q: What is CORS?
A: A database protocol
A: Browser security rules for cross-origin requests, enforced via server headers
A: A caching system
A: An encryption algorithm
ANS: 1
