import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import MedicationSummaryRequest, SymptomAnalysisRequest, InsightsRequest
from app.utils.auth import get_current_user_id, get_token
from app.utils.data_fetcher import fetch_all_data, summarize_health_data
from app.utils.gemini_client import call_gemini, PRESET_QUESTIONS
from app.rate_limiter import check_rate_limits
from app.cache import (
    cache_get, cache_set,
    key_ai_weekly, key_ai_med, key_ai_symptom, key_ai_insight,
    TTL_AI_REPORT, TTL_AI_INSIGHT,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


async def _process_ai_request(
    user_id: str,
    token: str,
    endpoint: str,
    cache_key: str,
    ttl: int,
    question: str,
    days: int,
):
    """Common AI request processing flow."""
    # 1. JWT already verified via dependency
    # 2. Check rate limits + increment counters
    await check_rate_limits(user_id, endpoint)

    # 3. Check AI cache
    cached = await cache_get(cache_key)
    if cached is not None:
        return {"success": True, "data": {"response": cached}}

    # 4. Fetch user data from other services
    raw_data = await fetch_all_data(token, days)

    # 5. Summarize data in Python
    summary = summarize_health_data(raw_data, days)

    # 6-8. Build prompt, guard size, call Gemini
    try:
        ai_response = await call_gemini(summary, question, days)
    except Exception as e:
        logger.error(f"Gemini call failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "message": "AI service temporarily unavailable. Try again later.",
            },
        )

    # 9. Store response in cache
    await cache_set(cache_key, ai_response, ttl)

    # 10. Return response
    return {"success": True, "data": {"response": ai_response}}


@router.post("/weekly-report")
async def weekly_report(
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_token),
):
    days = 7
    cache_key = key_ai_weekly(user_id)
    question = PRESET_QUESTIONS["weekly_report"]
    return await _process_ai_request(
        user_id, token, "weekly_report", cache_key, TTL_AI_REPORT, question, days
    )


@router.post("/medication-summary")
async def medication_summary(
    body: MedicationSummaryRequest = MedicationSummaryRequest(),
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_token),
):
    days = body.days or 30
    cache_key = key_ai_med(user_id, days)
    question = PRESET_QUESTIONS["med_summary"].format(days=days)
    return await _process_ai_request(
        user_id, token, "med_summary", cache_key, TTL_AI_REPORT, question, days
    )


@router.post("/symptom-analysis")
async def symptom_analysis(
    body: SymptomAnalysisRequest = SymptomAnalysisRequest(),
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_token),
):
    days = body.days or 14
    cache_key = key_ai_symptom(user_id, days)
    question = PRESET_QUESTIONS["symptom_analysis"].format(days=days)
    return await _process_ai_request(
        user_id, token, "symptom_analysis", cache_key, TTL_AI_REPORT, question, days
    )


@router.post("/insights")
async def insights(
    body: InsightsRequest,
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_token),
):
    days = body.days or 7
    cache_key = key_ai_insight(user_id, body.question, days)
    return await _process_ai_request(
        user_id, token, "insights", cache_key, TTL_AI_INSIGHT, body.question, days
    )
