---
name: repaso
description: Query and practice Spanish sentences from the Repaso database. Supports searching by tag or keyword, and interactive conversation practice.
metadata: {"openclaw": {"requires": {"env": ["REPASO_API_KEY", "REPASO_API_URL"]}, "emoji": "🇪🇸"}}
---

# Repaso — Spanish Sentence Practice

You have access to a personal Spanish sentence database via the Repaso API.
Use it when the user asks to look up Spanish sentences or practice a grammar topic.

## Environment

- `REPASO_API_URL` — base URL of the Repaso app (e.g. `https://repaso-random-words.vercel.app`)
- `REPASO_API_KEY` — Bearer token for authentication

## How to call the API

**CRITICAL: Always use the exec tool to run curl commands directly.**

Endpoint: `GET {REPASO_API_URL}/api/sentences/search`

Query params (all optional, AND-combined):
- `tag` — filter by tag name (e.g. `subjuntivo`, `llegar`, `antes-de-que`)
- `q` — search across sentence text and translation

Examples:
```bash
# By tag
exec -> curl -s -H "Authorization: Bearer $REPASO_API_KEY" "$REPASO_API_URL/api/sentences/search?tag=subjuntivo"

# By keyword
exec -> curl -s -H "Authorization: Bearer $REPASO_API_KEY" "$REPASO_API_URL/api/sentences/search?q=llegar"

# Both combined
exec -> curl -s -H "Authorization: Bearer $REPASO_API_KEY" "$REPASO_API_URL/api/sentences/search?tag=subjuntivo&q=llegar"

# All sentences (no filter)
exec -> curl -s -H "Authorization: Bearer $REPASO_API_KEY" "$REPASO_API_URL/api/sentences/search"
```

Response format:
```json
{
  "sentences": [
    {
      "sentence": "Ella había llegado antes de que empezara la reunión.",
      "translation": "She had arrived before the meeting started.",
      "tags": ["pluscuamperfecto", "subjuntivo-imperfecto", "antes-de-que", "llegar"]
    }
  ],
  "count": 1
}
```

## Behaviour A — Query sentences

**Trigger:** The user asks to find, show, list, or look up sentences — by tag, tense, verb, phrase, or keyword. Messages may be in English, Chinese, or Spanish. Examples:
- "Get subjuntivo examples"
- "查 subjuntivo 的句子"
- "Show me sentences with llegar"

**Steps:**
1. Identify the search intent. If the user mentions a grammar topic, tense, verb, or phrase → use `tag`. If they mention a word or fragment to search in context → use `q`. Use both when appropriate.
2. Use the exec tool to call the API (see examples above).
3. Format the results clearly. For each sentence show:
   - The Spanish sentence
   - The English translation
   - Tags as a compact list
4. If no results, say so and suggest alternative search terms.

## Behaviour B — Conversation practice

**Trigger:** The user asks to practice, drill, or review a topic. Examples:
- "Practice subjuntivo"
- "我想練 pluscuamperfecto"
- "Quiz me on antes-de-que"

**Steps:**
1. Use the exec tool to query relevant sentences from the API (use `tag` for the topic).
2. Use the returned sentences as your reference material. Do NOT show them all at once.
3. Start an interactive practice session:
   - Present one sentence at a time as a fill-in-the-blank, translation challenge, or conjugation exercise.
   - Wait for the user's answer before moving on.
   - Give feedback: confirm if correct, explain the grammar point if wrong, and show the full sentence.
   - After a few rounds, offer to continue or switch topics.
4. Keep the conversation natural and encouraging. Adapt difficulty to the user's level.
5. You may mix in your own knowledge of Spanish grammar to explain concepts, but ground exercises in the real sentences from the database.
