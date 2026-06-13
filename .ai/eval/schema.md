# Evaluation Dataset Schema

Golden examples are stored as JSON Lines. Each line is one deterministic test
case used by `scripts/eval/ragas_eval.py`.

```json
{
  "id": "chatbot-bio-001",
  "feature": "chatbot",
  "question": "Who is Zishen?",
  "ground_truth": "A concise answer with facts the response should include.",
  "contexts": ["Verbatim knowledge snippets used as retrieval context."],
  "metadata": {
    "category": "bio",
    "notes": "Optional reviewer notes."
  }
}
```

Fields:

- `id`: stable unique identifier.
- `feature`: either `chatbot` or `resume`.
- `question`: chatbot user question or target resume job description.
- `ground_truth`: reference answer or must-include outline.
- `contexts`: committed fixture snippets, copied from `.ai/eval/fixtures/knowledge/`.
- `metadata`: optional structured details such as category, expected function call,
  or source fixture ids.

The committed contexts keep CI independent from S3 and make score changes easier
to review.
