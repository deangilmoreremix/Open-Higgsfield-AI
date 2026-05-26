import logging

from director.agents.base import AgentResponse, AgentStatus

logger = logging.getLogger(__name__)


class CodeExecutor:
    """Executes Timeline Python code safely."""

    def __init__(self, session):
        self.session = session

    def execute_code(self, code: str, description: str = "") -> AgentResponse:
        try:
            conn = self.session.state.get("conn")
            if not conn:
                raise ValueError("No VideoDB connection available in session")

            exec_globals = {
                "conn": conn,
                "__builtins__": __builtins__,
            }
            exec_locals = {}

            logger.info("Executing generated code.")
            stream_url = self._execute_with_retry(code, exec_globals, exec_locals)

            if not stream_url:
                raise ValueError("Generated code did not produce a stream_url variable")

            data = {
                "stream_url": stream_url,
                "generated_code": code,
                "description": description,
                "execution_success": True,
            }

            return AgentResponse(
                data=data,
                message=f"Timeline code executed successfully{': ' + description if description else ''}",
                status=AgentStatus.SUCCESS,
            )

        except SyntaxError as e:
            logger.exception(f"Syntax error in generated code: {e}")
            return AgentResponse(
                data={
                    "code": code,
                    "error": str(e),
                    "error_type": "SyntaxError",
                    "line_number": e.lineno,
                    "execution_success": False,
                },
                message=f"Syntax error in generated code at line {e.lineno}: {str(e)}",
                status=AgentStatus.ERROR,
            )

        except NameError as e:
            logger.exception(f"Name error in generated code: {e}")
            return AgentResponse(
                data={
                    "code": code,
                    "error": str(e),
                    "error_type": "NameError",
                    "execution_success": False,
                },
                message=f"Name error in generated code: {str(e)}",
                status=AgentStatus.ERROR,
            )

        except ValueError as e:
            logger.exception(f"Value error in generated code: {e}")
            return AgentResponse(
                data={
                    "code": code,
                    "error": str(e),
                    "error_type": "ValueError",
                    "execution_success": False,
                },
                message=f"Value error: {str(e)}",
                status=AgentStatus.ERROR,
            )

        except Exception as e:
            logger.exception(f"Error executing Timeline code: {e}")
            return AgentResponse(
                data={
                    "code": code,
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "execution_success": False,
                },
                message=f"Error executing code: {str(e)}",
                status=AgentStatus.ERROR,
            )

    def _execute_with_retry(
        self,
        code: str,
        exec_globals: dict,
        exec_locals: dict,
        max_retries: int = 3,
    ) -> str:
        import time

        for attempt in range(max_retries):
            try:
                exec(code, exec_globals, exec_locals)
                stream_url = exec_locals.get("stream_url")

                if stream_url:
                    logger.info(f"Code execution successful on attempt {attempt + 1}")
                    return stream_url

                raise ValueError("No stream_url produced")

            except Exception as e:
                error_str = str(e).lower()

                if any(
                    keyword in error_str
                    for keyword in [
                        "audio chunks failed",
                        "transcoding",
                        "runtime error",
                    ]
                ):
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2
                        logger.warning(
                            "Audio transcoding error on attempt "
                            f"{attempt + 1}/{max_retries}: {e}"
                        )
                        logger.info(f"Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                        continue

                    logger.error(
                        "Audio transcoding failed after retries, trying "
                        f"video-only fallback: {e}"
                    )
                    try:
                        video_only_code = self._generate_video_only_fallback(code)
                        exec(video_only_code, exec_globals, exec_locals)
                        fallback_url = exec_locals.get("stream_url")
                        if fallback_url:
                            logger.info("Video-only fallback successful")
                            return fallback_url
                    except Exception as fallback_error:
                        logger.error(
                            "Video-only fallback also failed: "
                            f"{fallback_error}"
                        )

                    raise Exception(
                        "Audio transcoding failed after retries and video-only "
                        "fallback also failed. This typically indicates a "
                        "corrupted or unsupported audio track in the source "
                        "media. Suggested fixes: 1) Re-upload the asset without "
                        "an audio track (silent), 2) Upload a re-muxed version "
                        "with a valid audio codec, or 3) Regenerate code for a "
                        "purely visual edit and provide a separate AudioAsset "
                        f"later. Original error: {e}"
                    )

                logger.error(
                    f"Code execution failed with non-transcoding error: {e}"
                )
                raise e

        raise Exception("Unexpected error in retry logic")

    def _generate_video_only_fallback(self, original_code: str) -> str:
        import re

        pattern = r"VideoAsset\(([^)]*)\)"

        def add_volume_zero(match):
            params = match.group(1)
            if "volume=" not in params:
                if params.strip():
                    return f"VideoAsset({params}, volume=0)"
                else:
                    return "VideoAsset(volume=0)"
            return match.group(0)

        modified_code = re.sub(pattern, add_volume_zero, original_code)
        logger.info("Generated video-only fallback code.")
        return modified_code
