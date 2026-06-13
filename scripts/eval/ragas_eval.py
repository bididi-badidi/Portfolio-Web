from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from collect_chatbot import collect_chatbot_answer
from collect_resume import collect_resume_answer

ROOT = Path(__file__).resolve().parents[2]
EVAL_DIR = ROOT / ".ai" / "eval"

CHATBOT_METRICS = (
    "faithfulness",
    "answer_relevancy",
    "context_precision",
    "context_recall",
)
RESUME_METRICS = ("faithfulness", "answer_relevancy", "answer_correctness")


@dataclass
class EvalRow:
    example: dict[str, Any]
    answer: str
    contexts: list[str]
    source: str
    scores: dict[str, float]


class HashEmbeddings:
    """Small local embeddings implementation for RAGAS similarity metrics."""

    dimensions = 128

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        words = normalize_words(text)
        if not words:
            return vector

        for word in words:
            digest = hashlib.sha256(word.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimensions
            vector[index] += 1.0

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0.0:
            return vector
        return [value / norm for value in vector]


def make_ragas_embeddings() -> Any:
    from langchain_core.embeddings import Embeddings

    class LangChainHashEmbeddings(HashEmbeddings, Embeddings):
        pass

    return LangChainHashEmbeddings()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    examples: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            item = json.loads(line)
            validate_example(item, path, line_number)
            examples.append(item)
    return examples


def validate_example(item: dict[str, Any], path: Path, line_number: int) -> None:
    required = {"id", "feature", "question", "ground_truth", "contexts", "metadata"}
    missing = required - set(item)
    if missing:
        raise ValueError(
            f"{path}:{line_number} missing fields: {', '.join(sorted(missing))}"
        )
    if item["feature"] not in {"chatbot", "resume"}:
        raise ValueError(
            f"{path}:{line_number} has unsupported feature {item['feature']!r}"
        )
    if not isinstance(item["contexts"], list) or not item["contexts"]:
        raise ValueError(f"{path}:{line_number} must include at least one context")


def normalize_words(text: str) -> set[str]:
    stop_words = {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "by",
        "for",
        "from",
        "in",
        "is",
        "it",
        "of",
        "on",
        "or",
        "that",
        "the",
        "this",
        "to",
        "with",
    }
    words = set(re.findall(r"[a-z0-9]+", text.lower()))
    return {word for word in words if len(word) > 2 and word not in stop_words}


def overlap_score(left: str, right: str) -> float:
    left_words = normalize_words(left)
    right_words = normalize_words(right)
    if not left_words or not right_words:
        return 0.0
    return len(left_words & right_words) / len(left_words)


def clamp(value: float) -> float:
    if math.isnan(value):
        return 0.0
    return max(0.0, min(1.0, value))


def lexical_scores(
    feature: str, question: str, answer: str, contexts: list[str], ground_truth: str
) -> dict[str, float]:
    if answer.strip() == ground_truth.strip():
        metrics = CHATBOT_METRICS if feature == "chatbot" else RESUME_METRICS
        return {metric: 1.0 for metric in metrics}

    context_blob = "\n".join(contexts)
    scores = {
        "faithfulness": overlap_score(answer, context_blob),
        "answer_relevancy": max(
            overlap_score(question, answer), overlap_score(ground_truth, answer)
        ),
    }

    if feature == "chatbot":
        scores["context_precision"] = overlap_score(
            question + " " + ground_truth, context_blob
        )
        scores["context_recall"] = overlap_score(ground_truth, context_blob)
    else:
        scores["answer_correctness"] = overlap_score(ground_truth, answer)

    return {metric: clamp(score) for metric, score in scores.items()}


def collect_examples(
    feature: str, examples: Iterable[dict[str, Any]]
) -> tuple[list[EvalRow], bool]:
    rows: list[EvalRow] = []
    uses_live_answers = False
    for example in examples:
        collected = (
            collect_chatbot_answer(example)
            if feature == "chatbot"
            else collect_resume_answer(example)
        )
        answer = str(collected.get("answer", ""))
        contexts = [str(context) for context in collected.get("contexts", [])]
        source = str(collected.get("source", "unknown"))
        uses_live_answers = uses_live_answers or source != "offline-ground-truth"
        scores = lexical_scores(
            feature, example["question"], answer, contexts, example["ground_truth"]
        )
        rows.append(
            EvalRow(
                example=example,
                answer=answer,
                contexts=contexts,
                source=source,
                scores=scores,
            )
        )
    return rows, uses_live_answers


def ragas_metrics_for(feature: str) -> list[Any]:
    from ragas.metrics import (
        answer_correctness,
        answer_relevancy,
        context_precision,
        context_recall,
        faithfulness,
    )

    if feature == "chatbot":
        return [faithfulness, answer_relevancy, context_precision, context_recall]
    return [faithfulness, answer_relevancy, answer_correctness]


def apply_ragas_scores(feature: str, rows: list[EvalRow]) -> None:
    from datasets import Dataset
    from gemini_judge import GeminiJudge
    from ragas import evaluate

    dataset = Dataset.from_list(
        [
            {
                "user_input": row.example["question"],
                "response": row.answer,
                "retrieved_contexts": row.contexts,
                "reference": row.example["ground_truth"],
            }
            for row in rows
        ]
    )

    result = evaluate(
        dataset,
        metrics=ragas_metrics_for(feature),
        llm=GeminiJudge(),
        embeddings=make_ragas_embeddings(),
        raise_exceptions=True,
        show_progress=False,
    )
    frame = result.to_pandas()
    metrics = CHATBOT_METRICS if feature == "chatbot" else RESUME_METRICS

    for index, row in enumerate(rows):
        row.scores = {
            metric: clamp(float(frame.iloc[index][metric])) for metric in metrics
        }


def aggregate(rows: list[EvalRow], metrics: tuple[str, ...]) -> dict[str, float]:
    if not rows:
        return {metric: 0.0 for metric in metrics}
    return {
        metric: sum(row.scores.get(metric, 0.0) for row in rows) / len(rows)
        for metric in metrics
    }


def write_reports(
    all_rows: dict[str, list[EvalRow]], out_dir: Path, mode: str
) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    generated_at = datetime.now(timezone.utc).isoformat()

    report: dict[str, Any] = {
        "generated_at": generated_at,
        "mode": mode,
        "features": {},
    }

    for feature, rows in all_rows.items():
        metrics = CHATBOT_METRICS if feature == "chatbot" else RESUME_METRICS
        report["features"][feature] = {
            "sample_size": len(rows),
            "aggregate": aggregate(rows, metrics),
            "examples": [
                {
                    "id": row.example["id"],
                    "question": row.example["question"],
                    "answer": row.answer,
                    "ground_truth": row.example["ground_truth"],
                    "scores": row.scores,
                    "source": row.source,
                }
                for row in rows
            ],
        }

    (out_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    with (out_dir / "report.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["feature", "metric", "score", "sample_size"])
        for feature, feature_report in report["features"].items():
            for metric, score in feature_report["aggregate"].items():
                writer.writerow(
                    [feature, metric, f"{score:.4f}", feature_report["sample_size"]]
                )

    lines = [
        "<!-- ragas-eval -->",
        "# RAGAS evaluation summary",
        "",
        f"Generated: {generated_at}",
        f"Mode: `{mode}`",
        "",
    ]
    for feature, feature_report in report["features"].items():
        lines.extend([f"## {feature}", "", "| Metric | Score |", "| --- | ---: |"])
        for metric, score in feature_report["aggregate"].items():
            lines.append(f"| {metric} | {score:.3f} |")
        lines.append("")
    (out_dir / "report.md").write_text("\n".join(lines), encoding="utf-8")

    return report


def load_thresholds() -> dict[str, dict[str, float]]:
    return json.loads((EVAL_DIR / "thresholds.json").read_text(encoding="utf-8"))


def threshold_failures(report: dict[str, Any]) -> list[str]:
    thresholds = load_thresholds()
    failures: list[str] = []
    for feature, feature_report in report["features"].items():
        aggregate_scores = feature_report["aggregate"]
        for metric, threshold in thresholds.get(feature, {}).items():
            score = aggregate_scores.get(metric, 0.0)
            if score < threshold:
                failures.append(
                    f"{feature}.{metric}={score:.3f} below threshold {threshold:.3f}"
                )
    return failures


def selected_features(feature_arg: str) -> list[str]:
    return ["chatbot", "resume"] if feature_arg == "all" else [feature_arg]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run portfolio RAGAS evals.")
    parser.add_argument(
        "--feature", choices=["chatbot", "resume", "all"], default="all"
    )
    parser.add_argument("--out", type=Path, default=EVAL_DIR / "reports")
    parser.add_argument(
        "--scoring-mode",
        choices=["auto", "ragas", "lexical-offline"],
        default="auto",
        help="Use RAGAS for live/API answers; lexical-offline is only a smoke-test placeholder.",
    )
    args = parser.parse_args()

    all_rows: dict[str, list[EvalRow]] = {}
    uses_live_answers = False
    for feature in selected_features(args.feature):
        dataset = EVAL_DIR / f"{feature}.jsonl"
        examples = load_jsonl(dataset)
        rows, feature_uses_live_answers = collect_examples(feature, examples)
        all_rows[feature] = rows
        uses_live_answers = uses_live_answers or feature_uses_live_answers

    scoring_mode = args.scoring_mode
    if scoring_mode == "auto":
        scoring_mode = "ragas" if uses_live_answers else "lexical-offline"

    if scoring_mode == "ragas":
        if not uses_live_answers:
            raise RuntimeError(
                "RAGAS scoring requires live/API answers. Set EVAL_BASE_URL."
            )
        for feature, rows in all_rows.items():
            apply_ragas_scores(feature, rows)

    mode = "ragas" if scoring_mode == "ragas" else "lexical-offline-placeholder"

    report = write_reports(all_rows, args.out, mode)
    failures = threshold_failures(report)
    if failures:
        for failure in failures:
            print(f"THRESHOLD FAILURE: {failure}", file=sys.stderr)
        return 1

    print(f"Wrote reports to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
