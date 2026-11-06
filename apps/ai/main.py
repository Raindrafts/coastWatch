from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import re

app = FastAPI(title="CoastWatch AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_VERSION = "0.1.0-keyword-heuristics"

# Hazard keyword dictionaries
HAZARD_KEYWORDS = {
    "coastal_flooding": [
        "flood", "flooding", "submerged", "high tide", "water surge", "overflow", "inundation", "water level rising"
    ],
    "high_waves": [
        "high wave", "rough sea", "heavy surf", "swell", "breakers", "tsunami", "dangerous wave", "giant waves"
    ],
    "oil_spill": [
        "oil spill", "petroleum", "slick", "crude oil", "fuel leak", "tar balls", "chemical sheen"
    ],
    "coastal_erosion": [
        "erosion", "cliff collapse", "sand washing away", "beach loss", "rockfall", "shoreline retreat"
    ],
    "marine_debris": [
        "debris", "plastic waste", "ghost net", "garbage on beach", "trash", "discarded fishing gear", "rubbish"
    ]
}

class HealthStatus(BaseModel):
    status: str
    modelLoaded: bool
    modelVersion: str

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    location: Optional[str] = None
    timestamp: Optional[str] = None

class AnalyzeResponse(BaseModel):
    hazardType: str
    confidence: float
    keywords: List[str]
    explanation: str
    needsReview: bool
    modelVersion: str

@app.get("/health", response_model=HealthStatus)
def health_check():
    return {
        "status": "ok",
        "modelLoaded": True,
        "modelVersion": MODEL_VERSION
    }

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_text(request: AnalyzeRequest):
    text = request.text.lower()
    
    # Empty or purely whitespace check
    if not text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty or blank")

    matched_keywords = {}
    for hazard, kw_list in HAZARD_KEYWORDS.items():
        found = [kw for kw in kw_list if re.search(r'\b' + re.escape(kw) + r'\b', text)]
        if found:
            matched_keywords[hazard] = found

    if not matched_keywords:
        return AnalyzeResponse(
            hazardType="unknown",
            confidence=0.1,
            keywords=[],
            explanation="No matching coastal hazard signals detected in report description.",
            needsReview=True,
            modelVersion=MODEL_VERSION
        )

    # Pick hazard with maximum matches
    sorted_hazards = sorted(matched_keywords.items(), key=lambda item: len(item[1]), reverse=True)
    best_hazard, found_words = sorted_hazards[0]

    # Calculate confidence baseline (0.6 base + 0.15 per additional keyword up to 0.95)
    confidence = min(0.95, 0.60 + (len(found_words) - 1) * 0.15)
    
    # Ambiguous if multiple categories tied with equal max count
    if len(sorted_hazards) > 1 and len(sorted_hazards[0][1]) == len(sorted_hazards[1][1]):
        needs_review = True
        explanation = f"Ambiguous content: signals match both {sorted_hazards[0][0]} and {sorted_hazards[1][0]}."
    else:
        needs_review = confidence < 0.75
        explanation = f"Detected {best_hazard.replace('_', ' ')} based on matching terms: {', '.join(found_words)}."

    return AnalyzeResponse(
        hazardType=best_hazard,
        confidence=round(confidence, 2),
        keywords=found_words,
        explanation=explanation,
        needsReview=needs_review,
        modelVersion=MODEL_VERSION
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
