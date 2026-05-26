import asyncio
import logging
from typing import List, Optional
import aiohttp
from tenacity import retry, stop_after_attempt
from utils.retry import after_func
from interfaces.image_output import ImageOutput


FREEPIK_API_BASE = "https://api.freepik.com/v1/ai"
POLL_INTERVAL = 5
POLL_TIMEOUT = 300


class ImageGeneratorFreepikMysticAPI:
    def __init__(
        self,
        api_key: str,
        resolution: str = "1k",
        rate_limiter=None,
    ):
        self.api_key = api_key
        self.resolution = resolution
        self.rate_limiter = rate_limiter

    def _headers(self):
        return {
            "x-freepik-api-key": self.api_key,
            "Content-Type": "application/json",
        }

    @retry(stop=stop_after_attempt(3), after=after_func)
    async def generate_single_image(
        self,
        prompt: str,
        reference_image_paths: List[str] = [],
        aspect_ratio: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        seed: Optional[int] = None,
        **kwargs,
    ) -> ImageOutput:
        if self.rate_limiter:
            await self.rate_limiter.acquire()

        logging.info(f"Calling Freepik Mystic to generate image (resolution={self.resolution})...")

        payload = {
            "prompt": prompt,
            "resolution": self.resolution,
            "aspect_ratio": aspect_ratio or "widescreen_16_9",
        }
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
        if seed is not None:
            payload["seed"] = seed

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{FREEPIK_API_BASE}/mystic",
                json=payload,
                headers=self._headers(),
            ) as resp:
                if resp.status not in (200, 201, 202):
                    body = await resp.text()
                    raise ValueError(f"Freepik Mystic POST failed ({resp.status}): {body}")
                data = await resp.json()

        task_id = data.get("data", {}).get("task_id")
        if not task_id:
            raise ValueError(f"Freepik Mystic: no task_id in response: {data}")

        logging.info(f"Freepik Mystic task created: {task_id}. Polling for completion...")

        image_url = await self._poll_task(task_id)
        return ImageOutput(fmt="url", ext="png", data=image_url)

    async def _poll_task(self, task_id: str) -> str:
        elapsed = 0
        async with aiohttp.ClientSession() as session:
            while elapsed < POLL_TIMEOUT:
                await asyncio.sleep(POLL_INTERVAL)
                elapsed += POLL_INTERVAL

                async with session.get(
                    f"{FREEPIK_API_BASE}/mystic/{task_id}",
                    headers=self._headers(),
                ) as resp:
                    if resp.status != 200:
                        body = await resp.text()
                        raise ValueError(f"Freepik Mystic poll failed ({resp.status}): {body}")
                    result = await resp.json()

                task_data = result.get("data", {})
                status = task_data.get("status", "")

                logging.info(f"Freepik Mystic task {task_id} status: {status} ({elapsed}s)")

                if status == "COMPLETED":
                    generated = task_data.get("generated", [])
                    if not generated:
                        raise ValueError("Freepik Mystic: COMPLETED but no generated images")
                    return generated[0]["url"]

                if status in ("FAILED", "CANCELED"):
                    raise ValueError(f"Freepik Mystic task {task_id} ended with status: {status}")

        raise TimeoutError(f"Freepik Mystic task {task_id} timed out after {POLL_TIMEOUT}s")
