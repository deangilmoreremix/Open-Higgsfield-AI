import logging
from typing import Dict, Any

from director.agents.base import AgentResponse, AgentStatus
from director.tools.videodb_tool import VideoDBTool

logger = logging.getLogger(__name__)


class MediaHandler:
    """Handles media operations for the editing agent."""

    def __init__(self, collection_id: str):
        self.collection_id = collection_id
        self.videodb_tool = VideoDBTool(collection_id=collection_id)

    def get_media(self, media_id: str, media_type: str) -> AgentResponse:
        try:
            if media_type == "video":
                media_data = self.videodb_tool.get_video(media_id)
            elif media_type == "audio":
                media_data = self.videodb_tool.get_audio(media_id)
            elif media_type == "image":
                media_data = self.videodb_tool.get_image(media_id)
            else:
                raise ValueError(f"Unsupported media type: {media_type}")
        except Exception as e:
            logger.error(f"Error fetching media {media_id}: {e}")
            return AgentResponse(
                data={},
                message=f"Error fetching media {media_id}: {str(e)}",
                status=AgentStatus.ERROR,
            )

        return AgentResponse(
            data=media_data,
            message=f"Media {media_id} retrieved successfully",
            status=AgentStatus.SUCCESS,
        )

    def get_media_list(
        self, media_ids: list[str], media_type: str = "video"
    ) -> list[Dict[str, Any]]:
        results = []
        for media_id in media_ids:
            response = self.get_media(media_id, media_type)
            if response.status == AgentStatus.SUCCESS:
                results.append(response.data)
        return results
