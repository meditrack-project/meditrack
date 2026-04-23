import os
import logging
from typing import Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """You are MediTrack AI, a friendly personal health assistant.
Analyze the health summary below and respond to the user.
Rules:
- Warm, supportive, concise (max 200 words)
- Bullet points where helpful
- Never diagnose or recommend medications
- Base answers only on provided data
- End with: "Always consult your doctor for medical decisions."
"""

PRESET_QUESTIONS = {
    "weekly_report": "Generate a complete weekly health summary covering medication adherence, symptoms, mood, energy, and doctor visits. Give 3 specific actionable recommendations for next week.",
    "med_summary": "Analyze my medication adherence for the past {days} days. Tell me how I am doing overall, which medications I miss most, and give practical tips to improve consistency.",
    "symptom_analysis": "Analyze my symptoms, mood, and energy for the past {days} days. Identify trends or patterns and suggest what might be contributing to them.",
}


def build_health_summary(summary: Dict[str, Any]) -> str:
    """Build the health summary section of the prompt from summary dict."""
    lines = [f"HEALTH SUMMARY — Last {summary['period_days']} days\n"]

    # Medications
    meds = summary.get("medications", {})
    lines.append(f"MEDICATIONS ({meds.get('total_count', 0)} total):")
    for m in meds.get("list", []):
        lines.append(f"  • {m['name']} {m['dosage']} — {m['frequency']}")

    today = meds.get("today", {})
    lines.append(f"\nTODAY: {today.get('taken', 0)}/{today.get('total', 0)} taken ({today.get('taken_percent', 0)}%)")
    for s in today.get("status_list", []):
        icon = "✅" if s["taken"] else "⬜"
        lines.append(f"  {icon} {s['name']}")

    adh = meds.get("adherence", {})
    lines.append(f"\nADHERENCE:")
    lines.append(f"  Overall: {adh.get('overall_avg', 0)}%")
    best = adh.get("best", {})
    worst = adh.get("worst", {})
    lines.append(f"  Best: {best.get('name', 'N/A')} — {best.get('percent', 0)}%")
    lines.append(f"  Worst: {worst.get('name', 'N/A')} — {worst.get('percent', 0)}%")
    for pm in adh.get("per_medication", []):
        lines.append(f"  • {pm['name']}: {pm['percent']}%")

    # Symptoms
    sym = summary.get("symptoms", {})
    lines.append(f"\nSYMPTOMS (last {summary['period_days']} days):")
    lines.append(f"  Logged: {sym.get('days_logged', 0)}/{summary['period_days']} days")
    lines.append(f"  Avg mood: {sym.get('avg_mood', 0)}/10 ({sym.get('mood_trend', 'stable')})")
    lines.append(f"  Avg energy: {sym.get('avg_energy', 0)}/10")
    lines.append(f"  Avg severity: {sym.get('avg_severity', 0)}/10")

    top_symptoms = sym.get("top_symptoms", [])
    if top_symptoms:
        symptom_str = ", ".join([f"{s['symptom']}({s['count']})" for s in top_symptoms])
        lines.append(f"  Top symptoms: {symptom_str}")

    best_day = sym.get("best_day", {})
    worst_day = sym.get("worst_day", {})
    lines.append(f"  Best day: {best_day.get('date', 'N/A')} — mood {best_day.get('mood', 0)}/10")
    lines.append(f"  Worst day: {worst_day.get('date', 'N/A')} — mood {worst_day.get('mood', 0)}/10")

    # Upcoming follow-ups
    upcoming = summary.get("upcoming_followups", [])
    lines.append(f"\nUPCOMING FOLLOW-UPS:")
    if not upcoming:
        lines.append("  None scheduled")
    else:
        for v in upcoming:
            lines.append(f"  • {v['doctor']} ({v['specialty']}) — {v['date']} (in {v['days_until']} days)")

    return "\n".join(lines)


def guard_prompt_size(health_summary_text: str, summary: Dict[str, Any]) -> str:
    """Guard prompt size to stay under ~900 tokens."""
    estimated_tokens = len(health_summary_text) / 4

    if estimated_tokens <= 900:
        return health_summary_text

    # Remove best_day and worst_day
    lines = health_summary_text.split("\n")
    lines = [l for l in lines if "Best day:" not in l and "Worst day:" not in l]
    health_summary_text = "\n".join(lines)

    # Reduce top symptoms to 3
    sym = summary.get("symptoms", {})
    top_symptoms = sym.get("top_symptoms", [])[:3]

    estimated_tokens = len(health_summary_text) / 4
    if estimated_tokens <= 900:
        return health_summary_text

    # Remove per_medication list
    new_lines = []
    in_per_med = False
    for line in health_summary_text.split("\n"):
        if "ADHERENCE:" in line:
            in_per_med = False
        if in_per_med and line.strip().startswith("•"):
            continue
        if "Worst:" in line:
            in_per_med = True
        new_lines.append(line)

    return "\n".join(new_lines)


async def call_gemini(summary: Dict[str, Any], user_question: str, days: int) -> str:
    """Build prompt from summary and call Gemini API."""
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")

    health_summary_text = build_health_summary(summary)
    health_summary_text = guard_prompt_size(health_summary_text, summary)

    final_prompt = f"{SYSTEM_INSTRUCTION}\n\n{health_summary_text}\n\nUSER REQUEST:\n{user_question}"

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={
                "max_output_tokens": 400,
                "temperature": 0.4,
                "top_p": 0.9,
            },
        )
        response = model.generate_content(final_prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        raise Exception(f"Gemini API error: {str(e)}")
