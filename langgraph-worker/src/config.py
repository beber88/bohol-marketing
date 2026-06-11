import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Model defaults
CMO_MODEL = "claude-sonnet-4-20250514"
HAIKU_MODEL = "claude-haiku-4-5-20251001"

# Brand guard constraints for Blue Everest / Panglao Prime Villas
BRAND_GUARD_RULES = {
    "forbidden_words": [
        "amazing", "incredible", "dream home", "once in a lifetime",
    ],
    "required_cta_whatsapp": ["+639542555553", "+639958565865"],
    "israeli_currency": "ILS",
    "filipino_currency": "PHP",
    "company_name": "Blue Everest Asset Group Holding Inc.",
    "project_name": "Panglao Prime Villas",
    "max_revision_rounds": 3,
}
