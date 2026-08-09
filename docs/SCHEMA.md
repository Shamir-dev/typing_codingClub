# Lesson Schema

Every lesson (any language, any track type) follows this shape. Keeping
one schema across DSA-native and practice-native tracks means the same
typing engine and review UI work for all 8 languages.

```json
{
  "id": "js-easy-001",
  "language": "javascript",
  "trackType": "dsa",              // "dsa" | "practice"
  "difficulty": "easy",            // "easy" | "medium" | "hard"
  "title": "Find the Largest Number",
  "prompt": "Plain-language problem statement. What is the user solving?",
  "approach": "2-3 sentence plain-English explanation of the approach BEFORE the code — read this first, then type.",
  "code": "the exact code the user types, formatted like a real file",
  "charCount": 210,                 // used to sanity-check timing tier
  "timeTargetSec": 60,              // 60 | 120 | 150
  "review": {
    "walkthrough": "Line-by-line or block-by-block plain explanation of why the code works, written for someone reviewing after typing it.",
    "commonMistakes": ["off-by-one on loop bound", "forgetting the return keyword"]
  },
  "tags": ["arrays", "loops"]
}
```

## Field notes

- **charCount is a guardrail, not decoration.** At 45 WPM (≈225 chars/min):
  easy ≈ 225 chars (1 min), medium ≈ 450 chars (2 min), hard ≈ 560 chars
  cap (2.5 min). Check every lesson's code length against this before
  publishing it — this is how the "never exceeds 2.5 min" rule gets
  enforced in practice, not just in intent.
- **code must read like real project code** — realistic variable names,
  correct indentation, no contrived one-liners just to hit a char count.
- **approach comes before code** — the user reads the plain-English idea
  first, then types the implementation, then reviews. This is what makes
  the DSA content "easier to visualize and understand" per the original
  requirement.
- **trackType: "practice"** (for HTML/CSS/React) uses the same fields —
  "prompt" becomes "build this UI piece", "approach" explains the
  layout/pattern used, "review" explains why the markup/CSS is structured
  that way.
