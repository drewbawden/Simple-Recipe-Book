from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

from categories import CATEGORIES


app = FastAPI()


MODEL_NAME = "facebook/bart-large-mnli"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

model.eval()


class ClassifyRequest(BaseModel):
    product_name: str


def classify_product(product_name: str):
    premises = []
    hypotheses = []

    for category in CATEGORIES:
        premises.append(product_name)

        hypotheses.append(
            f"This shopping item belongs in the "
            f"{category['id'].replace('_', ' ')} category."
        )

    inputs = tokenizer(
        premises,
        hypotheses,
        padding=True,
        truncation=True,
        return_tensors="pt",
    )

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    entailment_logits = logits[:, 2]

    probabilities = torch.softmax(
        entailment_logits,
        dim=0,
    )

    ranked = torch.argsort(
        probabilities,
        descending=True,
    )

    results = []

    for index in ranked:
        i = int(index)

        results.append(
            {
                "category": CATEGORIES[i]["id"],
                "confidence": float(probabilities[i]),
                "entailment": float(logits[i, 2]),
                "neutral": float(logits[i, 1]),
                "contradiction": float(logits[i, 0]),
            }
        )

    return results;
    


@app.post("/classify")
def classify(request: ClassifyRequest):
    return classify_product(request.product_name)