import logging

from director.agents.base import BaseAgent, AgentResponse, AgentStatus
from director.core.session import (
    Session,
    VideoContent,
    VideoData,
    MsgStatus,
    ContextMessage,
    RoleTypes,
)
from director.llm import get_default_llm
from director.llm.base import LLMResponse
from director.agents.editing.code_executor import CodeExecutor
from director.agents.editing.media_handler import MediaHandler

logger = logging.getLogger(__name__)


EDITING_AGENT_PARAMETERS = {
    "type": "object",
    "properties": {
        "prompt": {
            "type": "string",
            "description": """Detailed editing prompt for the editing agent to edit the videos always include media id in the prompt for reference.

            example: Create a cinematic tribute video celebrating Steve Jobs using video m-xxx, use timestamps 0 to 71, 121 to 135, 170 to 196, 207 to 295 seconds

                VIDEO STRUCTURE:

                1. Opening Title: Text overlay "CELEBRATING STEVE JOBS" (3 seconds, fade in/out)
                2. Main Montage: 5-7 video segments (each 8-12 seconds) from the analyzed content
                3. Inspiring Words: Between segments, add text overlays with:
                * "VISIONARY" (2 seconds)
                * "INNOVATOR" (2 seconds)
                * "GENIUS" (2 seconds)
                * "THINK DIFFERENT" (2 seconds)
                4. Steve Jobs Quotes: Add 2-3 famous quotes as text overlays between segments:
                * "Stay hungry. Stay foolish."
                * "Innovation distinguishes between a leader and a follower."
                * "Your work is going to fill a large part of your life."

                AUDIO TREATMENT:

                * Use the original audio from the video segments
                * Keep audio continuous across transitions - don't cut it with text overlays
                * Audio should flow naturally even when showing text overlays
                * No need to sync audio perfectly with video - create emotional flow

                VISUAL EFFECTS:

                * Apply subtle cinematic filters (slight contrast boost, cinematic color grading)
                * Add smooth transitions between all segments (crossfade/dissolve, 1 second duration)
                * Text overlays should have elegant typography (large, bold, centered)
                * Text should fade in and fade out smoothly

                PACING:

                * Total video length: 180 seconds
                * Text overlays: 2-3 seconds each
                * Smooth, inspirational pacing with emotional build-up
            """,
        },
        "collection_id": {
            "type": "string",
            "description": "The ID of the collection to process. Always include the collection id in the prompt for reference.",
        },
    },
    "required": ["prompt", "collection_id"],
}

EDITING_PROMPT =  """
You are an AI video editing code generation assistant using the VideoDB SDK.
Your job is to generate EXECUTABLE PYTHON CODE that creates video edits using the videodb editor framework.

User will provide their editing requirements in natural language.
You will generate clean, well-commented Python code.

CRITICAL: You generate CODE, not JSON. The code should be ready to execute.

=============================
 VIDEODB EDITOR SDK CLASS REFERENCE
=============================

Below is the complete SDK class reference for the VideoDB Editor module.
Use this as an authoritative reference for class signatures, parameters, and their types.

```python
from typing import List, Optional, Union
from enum import Enum


class AssetType(str, Enum):
    '''The type of asset to display for the duration of the Clip.'''

    video = "video"
    image = "image"
    audio = "audio"
    text = "text"
    caption = "caption"


class Fit(str, Enum):
    '''Set how the asset should be scaled to fit the viewport using one of the following options:
    crop (default) - scale the asset to fill the viewport while maintaining the aspect ratio. The asset will be cropped if it exceeds the bounds of the viewport.

    cover - stretch the asset to fill the viewport without maintaining the aspect ratio.
    contain - fit the entire asset within the viewport while maintaining the original aspect ratio.
    none - preserves the original asset dimensions and does not apply any scaling.'''

    crop = "crop"
    cover = "cover"
    contain = "contain"


class Position(str, Enum):
    '''Place the asset in one of nine predefined positions of the viewport. This is most effective for when the asset is scaled and you want to position the element to a specific position.'''

    top = "top"
    bottom = "bottom"
    left = "left"
    right = "right"
    center = "center"
    top_left = "top_left"
    top_right = "top_right"
    bottom_left = "bottom_left"
    bottom_right = "bottom_right"


class Filter(str, Enum):
    '''A filter effect to apply to the Clip.'''

    blur = "blur"
    boost = "boost"
    contrast = "contrast"
    darken = "darken"
    greyscale = "greyscale"
    lighten = "lighten"
    muted = "muted"
    negative = "negative"


class TextAlignment(str, Enum):
    '''Place the text in one of nine predefined positions of the background.'''

    top = "top"
    top_right = "top_right"
    right = "right"
    bottom_right = "bottom_right"
    bottom = "bottom"
    bottom_left = "bottom_left"
    left = "left"
    top_left = "top_left"
    center = "center"


class HorizontalAlignment(str, Enum):
    '''Horizontal text alignment options.'''

    left = "left"
    center = "center"
    right = "right"


class CaptionBorderStyle(str, Enum):
    '''Border style properties for caption assets.'''

    outline_and_shadow = "outline_and_shadow"
    opaque_box = "opaque_box"


class CaptionAlignment(str, Enum):
    '''Caption alignment properties for caption assets.'''

    bottom_left = "bottom_left"
    bottom_center = "bottom_center"
    bottom_right = "bottom_right"
    middle_left = "middle_left"
    middle_center = "middle_center"
    middle_right = "middle_right"
    top_left = "top_left"
    top_center = "top_center"
    top_right = "top_right"


class CaptionAnimation(str, Enum):
    '''Caption animation properties for caption assets.'''

    box_highlight = "box_highlight"
    color_highlight = "color_highlight"
    reveal = "reveal"
    karaoke = "karaoke"
    impact = "impact"
    supersize = "supersize"


class VerticalAlignment(str, Enum):
    '''Vertical text alignment options.'''

    top = "top"
    center = "center"
    bottom = "bottom"


class Offset:
    '''Offset position for positioning elements on the viewport.'''

    def __init__(self, x: float = 0, y: float = 0):
        '''Initialize an Offset instance.

        :param float x: Horizontal offset value (default: 0)
        :param float y: Vertical offset value (default: 0)
        '''
        self.x = x
        self.y = y


class Crop:
    '''Crop settings for trimming edges of an asset.'''

    def __init__(self, top: int = 0, right: int = 0, bottom: int = 0, left: int = 0):
        '''Initialize a Crop instance.

        :param int top: Pixels to crop from top (default: 0)
        :param int right: Pixels to crop from right (default: 0)
        :param int bottom: Pixels to crop from bottom (default: 0)
        :param int left: Pixels to crop from left (default: 0)
        '''
        self.top = top
        self.right = right
        self.bottom = bottom
        self.left = left


class Transition:
    '''Transition effect settings for clip entry and exit animations.'''

    def __init__(self, in_: str = None, out: str = None, duration: int = 0.5):
        '''Initialize a Transition instance.

        :param str in_: Entry transition effect name (default: None)
        :param str out: Exit transition effect name (default: None)
        :param float duration: Transition duration in seconds (default: 0.5)
        '''
        self.in_ = in_
        self.out = out
        self.duration = duration


class BaseAsset:
    '''The type of asset to display for the duration of the Clip.'''

    type: AssetType


class VideoAsset(BaseAsset):
    '''The VideoAsset is used to create video sequences from video files.

    The src must be a publicly accessible URL to a video resource.
    '''

    type = AssetType.video

    def __init__(
        self,
        id: str,
        start: int = 0,
        volume: float = 1,
        crop: Optional[Crop] = None,
    ):
        '''Initialize a VideoAsset instance.

        :param str id: Unique identifier for the video asset
        :param int start: Start time offset in seconds (default: 0)
        :param float volume: Audio volume level between 0 and 5 (default: 1)
        :param Crop crop: (optional) Crop settings for the video
        :raises ValueError: If start is negative or volume is not between 0 and 5
        '''
        pass


class ImageAsset(BaseAsset):
    '''The ImageAsset is used to create video from images.

    The src must be a publicly accessible URL to an image resource such as a jpg or png file.
    '''

    type = AssetType.image

    def __init__(self, id: str, crop: Optional[Crop] = None):
        '''Initialize an ImageAsset instance.

        :param str id: Unique identifier for the image asset
        :param Crop crop: (optional) Crop settings for the image
        '''
        pass


class AudioAsset(BaseAsset):
    '''The AudioAsset is used to create audio sequences from audio files.

    The src must be a publicly accessible URL to an audio resource.
    '''

    type = AssetType.audio

    def __init__(self, id: str, start: int = 0, volume: float = 1):
        '''Initialize an AudioAsset instance.

        :param str id: Unique identifier for the audio asset
        :param int start: Start time offset in seconds (default: 0)
        :param float volume: Audio volume level (default: 1)
        '''
        pass


class Font:
    '''Font styling properties for text assets.'''

    def __init__(
        self,
        family: str = "Clear Sans",
        size: int = 48,
        color: str = "#FFFFFF",
        opacity: float = 1.0,
        weight: Optional[int] = None,
    ):
        '''Initialize a Font instance.

        :param str family: Font family name (default: "Clear Sans")
        :param int size: Font size in pixels (default: 48)
        :param str color: Font color in hex format (default: "#FFFFFF")
        :param float opacity: Font opacity between 0.0 and 1.0 (default: 1.0)
        :param int weight: (optional) Font weight between 100 and 900
        :raises ValueError: If size < 1, opacity not in [0.0, 1.0], or weight not in [100, 900]
        '''
        pass


class Border:
    '''Text border properties.'''

    def __init__(self, color: str = "#000000", width: float = 0.0):
        '''Initialize a Border instance.

        :param str color: Border color in hex format (default: "#000000")
        :param float width: Border width in pixels (default: 0.0)
        :raises ValueError: If width is negative
        '''
        pass


class Shadow:
    '''Text shadow properties.'''

    def __init__(self, color: str = "#000000", x: float = 0.0, y: float = 0.0):
        '''Initialize a Shadow instance.

        :param str color: Shadow color in hex format (default: "#000000")
        :param float x: Horizontal shadow offset in pixels (default: 0.0)
        :param float y: Vertical shadow offset in pixels (default: 0.0)
        :raises ValueError: If x or y is negative
        '''
        pass


class Background:
    '''Text background styling properties.'''

    def __init__(
        self,
        width: float = 0.0,
        height: float = 0.0,
        color: str = "#000000",
        border_width: float = 0.0,
        opacity: float = 1.0,
        text_alignment: TextAlignment = TextAlignment.center,
    ):
        '''Initialize a Background instance.

        :param float width: Background width in pixels (default: 0.0)
        :param float height: Background height in pixels (default: 0.0)
        :param str color: Background color in hex format (default: "#000000")
        :param float border_width: Border width in pixels (default: 0.0)
        :param float opacity: Background opacity between 0.0 and 1.0 (default: 1.0)
        :param TextAlignment text_alignment: Text alignment position (default: TextAlignment.center)
        :raises ValueError: If width, height, or border_width is negative, or opacity not in [0.0, 1.0]
        '''
        pass


class Alignment:
    '''Text alignment properties.'''

    def __init__(
        self,
        horizontal: HorizontalAlignment = HorizontalAlignment.center,
        vertical: VerticalAlignment = VerticalAlignment.center,
    ):
        '''Initialize an Alignment instance.

        :param HorizontalAlignment horizontal: Horizontal alignment (default: HorizontalAlignment.center)
        :param VerticalAlignment vertical: Vertical alignment (default: VerticalAlignment.center)
        '''
        pass


class TextAsset(BaseAsset):
    '''The TextAsset is used to create text sequences from text strings.

    Provides full control over the text styling and positioning.
    '''

    type = AssetType.text

    def __init__(
        self,
        text: str,
        font: Optional[Font] = None,
        border: Optional[Border] = None,
        shadow: Optional[Shadow] = None,
        background: Optional[Background] = None,
        alignment: Optional[Alignment] = None,
        tabsize: int = 4,
        line_spacing: float = 0,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ):
        '''Initialize a TextAsset instance.

        :param str text: The text content to display
        :param Font font: (optional) Font styling properties
        :param Border border: (optional) Text border properties
        :param Shadow shadow: (optional) Text shadow properties
        :param Background background: (optional) Text background properties
        :param Alignment alignment: (optional) Text alignment properties
        :param int tabsize: Tab character size in spaces (default: 4)
        :param float line_spacing: Space between lines (default: 0)
        :param int width: (optional) Text box width in pixels
        :param int height: (optional) Text box height in pixels
        :raises ValueError: If tabsize < 1, line_spacing < 0, width < 1, or height < 1
        '''
        pass


class FontStyling:
    '''Font styling properties for caption assets.'''

    def __init__(
        self,
        name: str = "Clear Sans",
        size: int = 30,
        bold: bool = False,
        italic: bool = False,
        underline: bool = False,
        strikeout: bool = False,
        scale_x: float = 100,
        scale_y: float = 100,
        spacing: float = 0.0,
        angle: float = 0.0,
    ):
        '''Initialize a FontStyling instance.

        :param str name: Font family name (default: "Clear Sans")
        :param int size: Font size in pixels (default: 30)
        :param bool bold: Enable bold text (default: False)
        :param bool italic: Enable italic text (default: False)
        :param bool underline: Enable underlined text (default: False)
        :param bool strikeout: Enable strikethrough text (default: False)
        :param float scale_x: Horizontal scale percentage (default: 100)
        :param float scale_y: Vertical scale percentage (default: 100)
        :param float spacing: Character spacing (default: 0.0)
        :param float angle: Text rotation angle in degrees (default: 0.0)
        '''
        pass


class BorderAndShadow:
    '''Border and shadow properties for caption assets.'''

    def __init__(
        self,
        style: CaptionBorderStyle = CaptionBorderStyle.outline_and_shadow,
        outline: int = 1,
        outline_color: str = "&H00000000",
        shadow: int = 0,
    ):
        '''Initialize a BorderAndShadow instance.

        :param CaptionBorderStyle style: Border style type (default: CaptionBorderStyle.outline_and_shadow)
        :param int outline: Outline thickness in pixels (default: 1)
        :param str outline_color: Outline color in ASS format (default: "&H00000000")
        :param int shadow: Shadow depth in pixels (default: 0)
        '''
        pass


class Positioning:
    '''Positioning properties for caption assets.'''

    def __init__(
        self,
        alignment: CaptionAlignment = CaptionAlignment.bottom_center,
        margin_l: int = 30,
        margin_r: int = 30,
        margin_v: int = 30,
    ):
        '''Initialize a Positioning instance.

        :param CaptionAlignment alignment: Caption alignment position (default: CaptionAlignment.bottom_center)
        :param int margin_l: Left margin in pixels (default: 30)
        :param int margin_r: Right margin in pixels (default: 30)
        :param int margin_v: Vertical margin in pixels (default: 30)
        '''
        pass


class CaptionAsset(BaseAsset):
    '''The CaptionAsset is used to create auto-generated or custom captions.

    Provides full styling and ASS (Advanced SubStation Alpha) subtitle format support.
    '''

    type = AssetType.caption

    def __init__(
        self,
        src: str = "auto",
        font: Optional[FontStyling] = None,
        primary_color: str = "&H00FFFFFF",
        secondary_color: str = "&H000000FF",
        back_color: str = "&H00000000",
        border: Optional[BorderAndShadow] = None,
        position: Optional[Positioning] = None,
        animation: Optional[CaptionAnimation] = None,
    ):
        '''Initialize a CaptionAsset instance.

        :param str src: Caption source ("auto" for auto-generated or base64 encoded ass string)
        :param FontStyling font: (optional) Font styling properties
        :param str primary_color: Primary text color in ASS format (default: "&H00FFFFFF")
        :param str secondary_color: Secondary text color in ASS format (default: "&H000000FF")
        :param str back_color: Background color in ASS format (default: "&H00000000")
        :param BorderAndShadow border: (optional) Border and shadow properties
        :param Positioning position: (optional) Caption positioning properties
        :param CaptionAnimation animation: (optional) Caption animation effect
        '''
        pass


AnyAsset = Union[VideoAsset, ImageAsset, AudioAsset, TextAsset, CaptionAsset]


class Clip:
    '''A clip is a container for a specific type of asset.

    Assets can be title, image, video, audio, or caption. Use a Clip to define
    when an asset will display on the timeline, how long it will play for,
    and transitions, filters and effects to apply to it.
    '''

    def __init__(
        self,
        asset: AnyAsset,
        duration: Union[float, int],
        transition: Optional[Transition] = None,
        effect: Optional[str] = None,
        filter: Optional[Filter] = None,
        scale: float = 1,
        opacity: float = 1,
        fit: Optional[Fit] = Fit.crop,
        position: Position = Position.center,
        offset: Optional[Offset] = None,
        z_index: int = 0,
    ):
        '''Initialize a Clip instance.

        :param AnyAsset asset: The asset to display (VideoAsset, ImageAsset, AudioAsset, TextAsset, or CaptionAsset)
        :param Union[float, int] duration: Duration of the clip in seconds
        :param Transition transition: (optional) Transition effects for entry/exit
        :param str effect: (optional) Effect name to apply
        :param Filter filter: (optional) Filter to apply to the clip
        :param float scale: Scale factor between 0 and 10 (default: 1)
        :param float opacity: Opacity level between 0 and 1 (default: 1)
        :param Fit fit: Asset scaling mode (default: Fit.crop)
        :param Position position: Asset position in viewport (default: Position.center)
        :param Offset offset: (optional) Fine-tune position offset
        :param int z_index: Layering order (default: 0)
        :raises ValueError: If scale not in [0, 10] or opacity not in [0, 1]
        '''
        pass


class TrackItem:
    '''Wrapper class that positions a clip at a specific start time on a track.'''

    def __init__(self, start: int, clip: Clip):
        '''Initialize a TrackItem instance.

        :param int start: Start time in seconds when the clip begins
        :param Clip clip: The clip to be placed on the track
        '''
        pass


class Track:
    '''A track contains an array of clips.

    Tracks are layered on top of each other in the order in the array.
    The top most track will render on top of those below it.
    '''

    def __init__(self, z_index: int = 0):
        '''Initialize a Track instance.

        :param int z_index: Z-index for track layering order (default: 0)
        '''
        self.clips: List[TrackItem] = []
        self.z_index: int = z_index

    def add_clip(self, start: int, clip: Clip) -> None:
        '''Add a clip to the track at a specific start time.

        :param int start: Start time in seconds when the clip begins
        :param Clip clip: The clip to add to the track
        :return: None
        :rtype: None
        '''
        pass


class Timeline:
    '''A timeline represents the contents of a video edit over time.

    A timeline consists of layers called tracks. Tracks are composed of titles,
    images, audio, html or video segments referred to as clips which are placed
    along the track at specific starting points and lasting for a specific
    amount of time.
    '''

    def __init__(self, connection):
        '''Initialize a Timeline instance.

        :param connection: API connection instance for making requests
        '''
        self.background: str = "#000000"
        self.resolution: str = "1280x720"
        self.tracks: List[Track] = []
        self.stream_url = None
        self.player_url = None

    def add_track(self, track: Track) -> None:
        '''Add a track to the timeline.

        :param Track track: The track to add to the timeline
        :return: None
        :rtype: None
        '''
        pass

    def generate_stream(self) -> str:
        '''Generate a stream from the timeline.

        Makes an API request to render the timeline and generate streaming URLs.
        Updates the stream_url and player_url instance variables.

        :return: The stream URL of the generated video
        :rtype: str
        '''
        pass

    def download_stream(self, stream_url: str) -> dict:
        '''Download a stream from the timeline.

        :param str stream_url: The URL of the stream to download
        :return: Dictionary containing download information
        :rtype: dict
        '''
        pass
```

CODE STRUCTURE TEMPLATE
=============================
```python
# Import Editor SDK components and all the classes you use in your code
from videodb.editor import (
    Timeline, Track, Clip,
    VideoAsset, Position, Offset, Filter
)

# Initialize timeline, conn is always available in the session
timeline = Timeline(conn)
timeline.background = "#000000"
timeline.resolution = "1280x720"

# Section 1: Create assets
video1 = VideoAsset(id="VIDEO_ID_1")

# Section 2: Create clips
clip1 = Clip(asset=video1, duration=10)

# Section 3: Create tracks and add clips with start times
track = Track()
track.add_clip(start=0, clip=clip1)

# Section 4: Add to timeline
timeline.add_track(track)

# Section 5: Generate stream
stream_url = timeline.generate_stream()
```

FINAL CRITICAL REMINDER
================================
BEFORE generating your code, verify you have:
✅ Import statement includes: ALL classes you use in your code
✅ Code is COMPLETE and RUNNABLE (no placeholders or comments)
✅ Always use the resolution "600x1060" and fit "crop" if asked for Vertical/reel/shorts Videos and 9:16 ratio
✅ If media id is not provided by user, ask user to provide media id and verify it using get_media tool


Your import MUST be:
```python
from videodb.editor import (
    Timeline, Track, Clip,
    VideoAsset, ImageAsset, AudioAsset, TextAsset,
    Position, Offset, Filter, Transition, Fit,
    Font, Border, Shadow, Background, Alignment,
    HorizontalAlignment, VerticalAlignment, TextAlignment
)
```

Now generate code based on user requirements and **ALWAYS call generate_timeline_code()** tool!
""".strip()


class EditingAgent(BaseAgent):
    """Agent for editing videos and audio files uploaded on VideoDB, using videodb editor timeline features."""

    def __init__(self, session: Session, **kwargs):
        """Initialize the EditingAgent."""
        self.agent_name = "editing"
        self.description = """Timeline-based video editor for cutting, combining, and transforming media.

            CAPABILITIES:
            - Assets: video, image, audio, text overlays, captions
            - Video/Image: trim, crop, scale, position (9 positions), fit modes (crop/cover/contain), opacity, z-index layering
            - Text: custom fonts, colors, borders, shadows, backgrounds, alignment (horizontal/vertical)
            - Captions: auto-generated or custom, animations (karaoke, reveal, highlight, impact, supersize)
            - Audio: volume control (0-5), start offset, background music overlay
            - Effects: transitions (fade, crossfade), filters (blur, greyscale, contrast, darken, lighten, negative, boost)
            - Timeline: multi-track composition with precise start times and durations

            EXAMPLES:
            - "Trim video m-xxx from 30 to 120 seconds"
            - "Merge intro video m-xxx and outro video m-xxx with crossfade transition"
            - "Add title 'Chapter 1' with white text on black background at the start for 3 seconds on video m-xxx"
            - "Overlay background music a-xxx at 50% volume on video m-xxx"
            - "Add auto-captions with karaoke animation on video m-xxx"
            - "Create montage from clips at 60s, 225s, 320s with fade transitions on video m-xxx"
            - "Apply greyscale filter to the entire video m-xxx"
            - "Add image watermark i-xxx in bottom-right corner at 30% opacity on video m-xxx"

            NOTES:
            - Media IDs required: always include media IDs in the prompt (e.g., m-xxxx for video, a-xxxx for audio, i-xxxx for image)
            - Timestamps: use seconds (e.g., 30, 90, 120.5)
            - Multiple media: can combine multiple videos, audio tracks, and images in one edit
            - Iterative editing: supports follow-up requests to refine the output

            """
        self.parameters = EDITING_AGENT_PARAMETERS
        super().__init__(session=session, **kwargs)

        self.llm = get_default_llm()

        self.agent_context: list[ContextMessage] = self.session.get_context_messages(
            agent_name=self.agent_name
        )

        self.code_executor = CodeExecutor(session)
        self.media_handler = None
        self.editing_response = None

        # Define tools for LLM
        self.tools = self._define_tools()
        logger.info("EditingAgent initialized with VideoDB LLM interface")

    def _update_context(self, context: ContextMessage):
        """Update the context for the editing agent."""
        self.agent_context.append(context)
        self.session.agent_context.update({self.agent_name: self.agent_context})

    def _define_tools(self):
        """Define available tools for the LLM."""
        return [
            {
                "name": "get_media",
                "description": "Fetch media details from VideoDB to verify existence and get information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "media_id": {
                            "type": "string",
                            "description": "ID of the media to fetch",
                        },
                        "media_type": {
                            "type": "string",
                            "description": "Type of media",
                            "enum": ["audio", "video", "image"],
                        },
                        "step_reasoning": {
                            "type": "string",
                            "description": "A brief, elegant description of what this step accomplishes (e.g., 'Fetching video metadata', 'Verifying audio duration')",
                        },
                    },
                    "required": ["media_id", "media_type", "step_reasoning"],
                },
            },
            {
                "name": "code_executor",
                "description": "Execute Timeline Python code in controlled environment.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "string",
                            "description": "Complete executable Timeline Python code",
                        },
                        "description": {
                            "type": "string",
                            "description": "Brief description of the code",
                        },
                        "step_reasoning": {
                            "type": "string",
                            "description": "A brief, elegant summary of the editing operations being performed (e.g., 'Combined 3 clips with audio overlay', 'Applied text captions at key moments')",
                        },
                    },
                    "required": ["code", "description", "step_reasoning"],
                },
            },
        ]

    def get_media(
        self,
        media_id: str,
        media_type: str,
        step_reasoning: str = None,
    ) -> AgentResponse:
        if step_reasoning:
            self.output_message.actions.append(step_reasoning)
            self.output_message.push_update()
        return self.media_handler.get_media(media_id, media_type)

    def execute_code(
        self,
        code: str,
        description: str,
        step_reasoning: str = None,
    ) -> AgentResponse:
        if step_reasoning:
            self.output_message.actions.append(step_reasoning)
            self.output_message.push_update()
        return self.code_executor.execute_code(code, description)

    def run_llm(self):
        llm_response: LLMResponse = self.llm.chat_completions(
            messages=[message.to_llm_msg() for message in self.agent_context],
            tools=self.tools,
        )
        has_tool_calls = bool(llm_response.tool_calls)

        if has_tool_calls:
            self._update_context(
                ContextMessage(
                    content=llm_response.content,
                    tool_calls=llm_response.tool_calls,
                    role=RoleTypes.assistant,
                )
            )
            for tool_call in llm_response.tool_calls:
                tool_name = tool_call["tool"]["name"]
                tool_args = tool_call["tool"]["arguments"]

                if tool_name == "code_executor":
                    response = self.execute_code(**tool_args)
                    self.editing_response = response
                elif tool_name == "get_media":
                    response = self.get_media(**tool_args)
                else:
                    response = AgentResponse(
                        data={},
                        message=f"Unknown tool: {tool_name}",
                        status=AgentStatus.ERROR,
                    )

                self._update_context(
                    ContextMessage(
                        content=response.__str__(),
                        tool_call_id=tool_call["id"],
                        role=RoleTypes.tool,
                    )
                )

        if (
            llm_response.finish_reason in {"stop", "end_turn"}
            or self.iterations == 0
        ):
            if self.editing_response or self.iterations == 0:
                self._update_context(
                    ContextMessage(
                        content=llm_response.content,
                        role=RoleTypes.assistant,
                    )
                )
                self.stop_flag = True
            else:
                self._update_context(
                    ContextMessage(
                        content=llm_response.content,
                        role=RoleTypes.assistant,
                    )
                )
                self.editing_response = AgentResponse(
                    data={},
                    message=llm_response.content,
                    status=AgentStatus.ERROR,
                )

    def run(self, prompt: str, collection_id: str, *args, **kwargs) -> AgentResponse:
        try:
            self.prompt = prompt
            self.collection_id = collection_id
            self.iterations = 25
            self.stop_flag = False

            self.media_handler = MediaHandler(collection_id)
            self.output_message.actions.append("Preparing your editing workspace..")

            video_content = VideoContent(
                agent_name=self.agent_name,
                status=MsgStatus.progress,
                status_message="Generating editing instructions...",
            )
            self.output_message.content.append(video_content)
            self.output_message.push_update()

            input_context = ContextMessage(
                content=f"{self.prompt}", role=RoleTypes.user
            )
            if not self.agent_context:
                system_context = ContextMessage(
                    content=EDITING_PROMPT, role=RoleTypes.system
                )
                self._update_context(system_context)
            self._update_context(input_context)

            self.output_message.actions.append("Crafting your video edit...")
            self.output_message.push_update()

            iteration = 0
            while self.iterations > 0:
                self.iterations -= 1
                logger.info(f"Code generation iteration {iteration}")

                if self.stop_flag:
                    break

                self.run_llm()
                iteration += 1
            logger.info("Timeline code generation completed")

            if (
                self.editing_response
                and self.editing_response.status == AgentStatus.SUCCESS
            ):
                stream_url = self.editing_response.data.get("stream_url")

                if stream_url:
                    video_content.video = VideoData(stream_url=stream_url)
                    video_content.status = MsgStatus.success
                    video_content.status_message = (
                        "Editing instructions executed successfully."
                    )
                    self.output_message.actions.append("Video edit complete!")
                else:
                    video_content.status = MsgStatus.error
                    video_content.status_message = (
                        "No stream URL generated from Timeline execution."
                    )
            else:
                video_content.status = MsgStatus.error
                video_content.status_message = (
                    "Something went wrong with Timeline execution. Please try again."
                )

            self.output_message.publish()

        except Exception as e:
            logger.exception(f"Error in {self.agent_name}")
            video_content.status = MsgStatus.error
            video_content.status_message = "Error in Timeline code generation."
            self.output_message.publish()
            return AgentResponse(
                status=AgentStatus.ERROR, message=f"Agent failed with error: {e}"
            )

        final_status = AgentStatus.SUCCESS
        final_message = "Timeline code generation completed successfully."
        final_data = {
            "collection_id": collection_id,
            "editing_response": self.editing_response.data
            if self.editing_response
            else {},
        }

        if not self.editing_response:
            final_status = AgentStatus.ERROR
            final_message = "No editing response produced by code generator."
        else:
            inner_success = self.editing_response.data.get("execution_success")
            if (
                self.editing_response.status != AgentStatus.SUCCESS
                or inner_success is False
            ):
                final_status = AgentStatus.ERROR
                message = self.editing_response.message
                err = self.editing_response.data.get("error")
                err_type = self.editing_response.data.get("error_type")

                final_message = f"Timeline execution failed {message}, error: {err_type + ': ' if err_type else ''}{err}"

        return AgentResponse(
            status=final_status,
            message=final_message,
            data=final_data,
        )
