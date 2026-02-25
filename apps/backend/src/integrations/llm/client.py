import logging
from typing import Optional, Dict, Any
import json
import google.generativeai as genai
from openai import AsyncOpenAI
from src.core.config import settings
import asyncio # Needed for to_thread fallback in older SDKs or simple async patterns

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')

    async def generate_json(self, prompt: str, system_message: str) -> Optional[Dict[str, Any]]:
        try:
            if settings.GEMINI_API_KEY:
                # Gemini doesn't always have a strict JSON mode like OpenAI,
                # so we enforce it via the prompt.
                full_prompt = f"{system_message}\n\n{prompt}\n\nReturn strictly valid JSON."
                response = await asyncio.to_thread(self.gemini_model.generate_content, full_prompt)
                
                if not response.text:
                    logger.warning(f"Gemini returned empty text. Safety block? {response.prompt_feedback}")
                    return None
                    
                # Cleanup potential markdown markers in output
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                
                parsed = json.loads(text.strip())
                logger.info("Successfully generated AI analysis via Gemini")
                return parsed
            
            elif self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                parsed = json.loads(content)
                logger.info("Successfully generated AI analysis via OpenAI")
                return parsed
            
            logger.warning("No LLM API keys configured")
            return None
        except Exception as e:
            if "quota" in str(e).lower() or "429" in str(e):
                logger.warning("LLM Quota exceeded. Falling back to heuristic analysis.")
            else:
                logger.error(f"LLM Error (JSON): {e}")
            return None

    async def generate_explanation(self, prompt: str) -> Optional[str]:
        # Legacy method
        analysis = await self.generate_analysis(prompt)
        return analysis.get("explanation") if analysis else None

    async def generate_analysis(self, prompt: str) -> Optional[Dict[str, str]]:
        """Generates both an explanation and actionable compliance recommendations."""
        system_msg = """
        You are a compliance analyst. Analyze the following crypto transaction anomaly.
        Return a JSON object with:
        1. "explanation": A concise description of why this is suspicious.
        2. "recommendations": Concrete actionable steps (e.g., "Request KYC", "File SAR", "Block address").
        """
        try:
            return await self.generate_json(prompt, system_msg)
        except Exception as e:
            logger.error(f"LLM Error (Analysis): {e}")
            return None
