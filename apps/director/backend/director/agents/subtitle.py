import logging

from director.agents.base import BaseAgent, AgentResponse, AgentStatus
from director.core.session import (
    Session,
    VideoContent,
    VideoData,
    MsgStatus,
)
from director.tools.videodb_tool import VideoDBTool

from videodb.exceptions import InvalidRequestError

logger = logging.getLogger(__name__)

SUBTITLE_AGENT_PARAMETERS = {
    "type": "object",
    "properties": {
        "video_id": {
            "type": "string",
            "description": "The unique identifier of the video to which subtitles will be added.",
        },
        "collection_id": {
            "type": "string",
            "description": "The unique identifier of the collection containing the video.",
        },
        "video_language": {
            "type": "string",
            "description": 'The language spoken in the video. Use the full English name (e.g., "English", "Spanish", "French", "Hindi", "Kannada"). This is used for transcript generation. Ask the user which language is spoken in the video".',
        },
        "target_language": {
            "type": "string",
            "description": 'The desired language for the subtitles. Use the full English name (e.g., "English", "Spanish", "French", "Hindi", "Kannada"). If different from video_language, the transcript will be translated. Defaults to the video_language.',
        },
        "target_language_iso_code": {
            "type": "string",
            "description": 'ISO 639-1 language code for the target language (e.g., "en" for English, "es" for Spanish, "fr" for French, "hi" for Hindi, "kn" for Kannada). Required when target_language is different from video_language for proper translation.',
        },
        "notes": {
            "type": "string",
            "description": "Additional requirements for the style of language translation.",
        },
        "template": {
            "type": "string",
            "description": 'Predefined template name. Options: "tiktok_classic" (default - white bold text with black outline, impact animation), "cinematic_gold" (elegant golden italic with reveal), "bold_impact" (large white center text with impact), "box_highlight" (words with animated box), "color_wave" (karaoke-style color sweep), "supersize_drama" (dramatic scale-up animation), "clean_minimal" (elegant serif, no animation), "modern_boxed" (white text in black boxes with reveal).',
        },
        "font_name": {
            "type": "string",
            "description": 'Font family name. Common options: "Arial", "Georgia", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Courier New", "Comic Sans MS". Defaults to "Arial".',
        },
        "font_size": {
            "type": "integer",
            "description": "Font size in pixels. Recommended range: 40-70. Defaults to 58.",
        },
        "font_bold": {
            "type": "boolean",
            "description": "Whether text should be bold. Defaults to true.",
        },
        "font_italic": {
            "type": "boolean",
            "description": "Whether text should be italic. Defaults to false.",
        },
        "animation": {
            "type": "string",
            "description": 'Animation style. Options: "impact" (default - punchy scale effect), "reveal" (gradual appearance), "supersize" (dramatic scale-up), "box_highlight" (animated box around words), "color_highlight" (karaoke-style color sweep), "none" (static, no animation).',
        },
        "position_alignment": {
            "type": "string",
            "description": 'Caption position. Options: "bottom_center" (default), "bottom_left", "bottom_right", "middle_center", "middle_left", "middle_right", "top_center", "top_left", "top_right".',
        },
        "primary_color": {
            "type": "string",
            "description": 'Main text color in ASS format (&HAABBGGRR). Examples: "&H00FFFFFF" (white - default), "&H00000000" (black), "&H000000FF" (red), "&H0000FF00" (green), "&H00FF0000" (blue), "&H0000FFFF" (yellow), "&H00FF00FF" (magenta).',
        },
        "secondary_color": {
            "type": "string",
            "description": 'Highlight/accent color for animations in ASS format. Defaults to "&H0000FFFF" (yellow). Used for color_highlight animation and box_highlight.',
        },
        "back_color": {
            "type": "string",
            "description": 'Background/shadow color in ASS format. Examples: "&H00000000" (transparent - default), "&H80000000" (semi-transparent black), "&HA0000000" (more opaque black), "&HE0000000" (nearly opaque black box).',
        },
        "outline_color": {
            "type": "string",
            "description": 'Text outline color in ASS format. Defaults to "&H00000000" (black outline).',
        },
        "outline_width": {
            "type": "integer",
            "description": "Outline thickness in pixels. Range: 0-5. Defaults to 3. Use 0 for no outline.",
        },
        "margin_vertical": {
            "type": "integer",
            "description": "Vertical margin from edge in pixels. Defaults to 40 for bottom positions, 20 for others.",
        },
        "margin_horizontal": {
            "type": "integer",
            "description": "Horizontal margin from edge in pixels. Defaults to 15.",
        },
    },
    "required": ["video_id", "collection_id", "video_language", "target_language"],
}

TEMPLATES = {
    "tiktok_classic": {
        "font_name": "Arial",
        "font_size": 58,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "bottom_center",
        "animation": "impact",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H0000FFFF",
        "back_color": "&H80000000",
        "outline_color": "&H00000000",
        "outline_width": 3,
    },
    "cinematic_gold": {
        "font_name": "Georgia",
        "font_size": 52,
        "font_bold": False,
        "font_italic": True,
        "position_alignment": "bottom_center",
        "animation": "reveal",
        "primary_color": "&H0000D7FF",
        "secondary_color": "&H0000FFFF",
        "back_color": "&H00000000",
        "outline_color": "&H00000000",
        "outline_width": 2,
    },
    "bold_impact": {
        "font_name": "Arial",
        "font_size": 62,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "middle_center",
        "animation": "impact",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00FFFFFF",
        "back_color": "&H00000000",
        "outline_color": "&H00000000",
        "outline_width": 4,
    },
    "box_highlight": {
        "font_name": "Verdana",
        "font_size": 50,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "bottom_center",
        "animation": "box_highlight",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00FF00FF",
        "back_color": "&H00000000",
        "outline_color": "&H00000000",
        "outline_width": 2,
    },
    "color_wave": {
        "font_name": "Tahoma",
        "font_size": 54,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "bottom_center",
        "animation": "color_highlight",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H005DE2F7",
        "back_color": "&H00000000",
        "outline_color": "&H00000000",
        "outline_width": 2,
    },
    "supersize_drama": {
        "font_name": "Trebuchet MS",
        "font_size": 56,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "middle_center",
        "animation": "supersize",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H0000FF00",
        "back_color": "&H00000000",
        "outline_color": "&H00000000",
        "outline_width": 3,
    },
    "clean_minimal": {
        "font_name": "Georgia",
        "font_size": 46,
        "font_bold": False,
        "font_italic": False,
        "position_alignment": "bottom_center",
        "animation": "none",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00FFFFFF",
        "back_color": "&HA0000000",
        "outline_color": "&H00000000",
        "outline_width": 1,
    },
    "modern_boxed": {
        "font_name": "Verdana",
        "font_size": 44,
        "font_bold": True,
        "font_italic": False,
        "position_alignment": "bottom_center",
        "animation": "reveal",
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00FFFFFF",
        "back_color": "&HE0000000",
        "outline_color": "&H00000000",
        "outline_width": 0,
    },
}

ALIGNMENT_MAP = {
    "bottom_left": "bottom_left",
    "bottom_center": "bottom_center",
    "bottom_right": "bottom_right",
    "middle_left": "middle_left",
    "middle_center": "middle_center",
    "middle_right": "middle_right",
    "top_left": "top_left",
    "top_center": "top_center",
    "top_right": "top_right",
}

INDIAN_LANGUAGE_FONTS = {
    "hindi": "Noto Sans Devanagari",
    "marathi": "Noto Sans Devanagari",
    "kannada": "Noto Sans Kannada",
    "gujarati": "Noto Sans Gujarati",
    "gurmukhi": "Noto Sans Gurmukhi",
    "punjabi": "Noto Sans Gurmukhi",
}


GEMINI_SUPPORTED_LANGUAGES = {
    "hindi": "hi" ,
    "tamil": "ta" ,
    "bengali": "bn" ,
    "gujarati": "gu" ,
    "telugu": "te" ,
    "kannada": "kn" ,
    "punjabi": "pa" ,
    "odia": "or" ,
    "malayalam": "ml" ,
    "assamese": "as" ,
    "marathi": "mr" ,
    "manipuri": "mni" ,
    "rajasthani": "raj" ,
}

class SubtitleAgent(BaseAgent):
    def __init__(self, session: Session, **kwargs):
        self.agent_name = "subtitle"
        self.description = "Advanced subtitle agent with professional templates, animations, and extensive styling options. Supports 8 predefined templates (TikTok Classic, Cinematic Gold, Bold Impact, Box Highlight, Color Wave, Supersize Drama, Clean Minimal, Modern Boxed) plus full customization of fonts, colors, animations, and positioning. Uses the new VideoDB Editor API for word-level timing and advanced effects."
        self.parameters = SUBTITLE_AGENT_PARAMETERS
        super().__init__(session=session, **kwargs)

    def _get_alignment_enum(self, position_alignment: str):
        """Convert position string to CaptionAlignment enum."""
        from videodb.editor import CaptionAlignment

        alignment_map = {
            "bottom_left": CaptionAlignment.bottom_left,
            "bottom_center": CaptionAlignment.bottom_center,
            "bottom_right": CaptionAlignment.bottom_right,
            "middle_left": CaptionAlignment.middle_left,
            "middle_center": CaptionAlignment.middle_center,
            "middle_right": CaptionAlignment.middle_right,
            "top_left": CaptionAlignment.top_left,
            "top_center": CaptionAlignment.top_center,
            "top_right": CaptionAlignment.top_right,
        }
        return alignment_map.get(position_alignment, CaptionAlignment.bottom_center)

    def _get_animation_enum(self, animation: str):
        """Convert animation string to CaptionAnimation enum."""
        from videodb.editor import CaptionAnimation

        if not animation or animation == "none":
            return None

        animation_map = {
            "reveal": CaptionAnimation.reveal,
            "impact": CaptionAnimation.impact,
            "supersize": CaptionAnimation.supersize,
            "box_highlight": CaptionAnimation.box_highlight,
            "color_highlight": CaptionAnimation.color_highlight,
        }
        return animation_map.get(animation)

    def _build_config(self, **kwargs):
        """Build configuration from template and overrides."""
        template_name = kwargs.get("template", "tiktok_classic")
        target_language = kwargs.get("target_language", "english").lower()

        if template_name in TEMPLATES:
            config = TEMPLATES[template_name].copy()
        else:
            config = TEMPLATES["tiktok_classic"].copy()

        override_keys = [
            "font_name", "font_size", "font_bold", "font_italic",
            "animation", "position_alignment", "primary_color",
            "secondary_color", "back_color", "outline_color", "outline_width"
        ]

        for key in override_keys:
            if kwargs.get(key) is not None:
                config[key] = kwargs[key]

        if kwargs.get("font_name") is None and target_language in INDIAN_LANGUAGE_FONTS:
            config["font_name"] = INDIAN_LANGUAGE_FONTS[target_language]

        position = config["position_alignment"]
        if kwargs.get("margin_vertical") is not None:
            config["margin_vertical"] = kwargs["margin_vertical"]
        else:
            config["margin_vertical"] = 40 if "bottom" in position else 20

        if kwargs.get("margin_horizontal") is not None:
            config["margin_horizontal"] = kwargs["margin_horizontal"]
        else:
            config["margin_horizontal"] = 20 if "left" in position or "right" in position else 15
        
        return config

    def _create_caption_clip(self, config: dict, duration: float, transcript_src: str = "auto"):
        """Create a CaptionAsset clip based on configuration."""
        from videodb.editor import (
            CaptionAsset,
            FontStyling,
            Positioning,
            BorderAndShadow,
            Clip,
        )

        animation = self._get_animation_enum(config.get("animation", "impact"))
        font = FontStyling(
            name=config.get("font_name", "Arial"),
            bold=config.get("font_bold", True),
            italic=config.get("font_italic", False),
            size=config.get("font_size", 58),
        )

        caption_alignment = self._get_alignment_enum(config.get("position_alignment", "bottom_center"))
        position = Positioning(
            alignment=caption_alignment,
            margin_l=config.get("margin_horizontal", 15),
            margin_r=config.get("margin_horizontal", 15),
            margin_v=config.get("margin_vertical", 40),
        )

        border = BorderAndShadow(
            outline=config.get("outline_width", 3),
            outline_color=config.get("outline_color", "&H00000000"),
        )

        caption_asset = CaptionAsset(
            src=transcript_src,
            animation=animation,
            position=position,
            font=font,
            primary_color=config.get("primary_color", "&H00FFFFFF"),
            secondary_color=config.get("secondary_color", "&H0000FFFF"),
            back_color=config.get("back_color", "&H80000000"),
            border=border,
        )

        caption_clip = Clip(
            asset=caption_asset,
            duration=duration,
        )

        return caption_clip

    def run(
        self,
        video_id: str,
        collection_id: str,
        video_language: str,
        target_language: str,
        target_language_iso_code: str = None,
        notes: str = "",
        template: str = "tiktok_classic",
        font_name: str = None,
        font_size: int = None,
        font_bold: bool = None,
        font_italic: bool = None,
        animation: str = None,
        position_alignment: str = None,
        primary_color: str = None,
        secondary_color: str = None,
        back_color: str = None,
        outline_color: str = None,
        outline_width: int = None,
        margin_vertical: int = None,
        margin_horizontal: int = None,
        *args,
        **kwargs,
    ) -> AgentResponse:
        """
        Adds professional animated subtitles to the specified video using the new Editor API.

        :param str video_id: The unique identifier of the video to process.
        :param str collection_id: The unique identifier of the collection containing the video.
        :param str video_language: Language spoken in the video (default: "english").
        :param str target_language: Desired subtitle language. If different from video_language, transcript will be translated (default: same as video_language).
        :param str target_language_iso_code: ISO 639-1 code for target language (e.g., "en", "es", "fr"). Required for translation.
        :param str notes: Additional style requirements for translation (only used when translating).
        :param str template: Predefined template name (default: "tiktok_classic").
        :param str font_name: Font family (overrides template).
        :param int font_size: Font size in pixels (overrides template).
        :param bool font_bold: Bold text (overrides template).
        :param bool font_italic: Italic text (overrides template).
        :param str animation: Animation style (overrides template).
        :param str position_alignment: Caption position (overrides template).
        :param str primary_color: Main text color in ASS format (overrides template).
        :param str secondary_color: Highlight color (overrides template).
        :param str back_color: Background color (overrides template).
        :param str outline_color: Outline color (overrides template).
        :param int outline_width: Outline thickness (overrides template).
        :param int margin_vertical: Vertical margin in pixels (overrides template).
        :param int margin_horizontal: Horizontal margin in pixels (overrides template).
        :return: The response indicating success or failure.
        :rtype: AgentResponse
        """
        try:
            from videodb.editor import Timeline, Track, Clip, VideoAsset
            self.video_id = video_id
            self.videodb_tool = VideoDBTool(collection_id=collection_id)

            video_lang = video_language.lower()
            target_lang = (target_language or video_language).lower()
            needs_translation = video_lang != target_lang

            self.output_message.actions.append(
                "Initializing professional subtitle generation with Editor API"
            )
            subtitles_content = VideoContent(
                agent_name=self.agent_name,
                status=MsgStatus.progress,
                status_message="Processing...",
            )
            self.output_message.push_update()

            self.output_message.actions.append("Retrieving video information")
            self.output_message.push_update()
            video_info = self.videodb_tool.get_video(video_id)
            video_duration = video_info.get("length", 30)

            try:
                final_transcript = self.videodb_tool.get_transcript(video_id, text=False)
            except InvalidRequestError:
                logger.info(
                    f"Transcript not available for video {video_id}. Indexing spoken words in {video_language}.."
                )
                self.output_message.actions.append(f"Indexing spoken words in {video_language}...")
                self.output_message.push_update()

                language_code = GEMINI_SUPPORTED_LANGUAGES.get(video_lang, None)
                self.videodb_tool.index_spoken_words(video_id, language_code=language_code)
                final_transcript = self.videodb_tool.get_transcript(video_id, text=False)

            self.output_message.content.append(subtitles_content)
            if needs_translation:
                self.output_message.actions.append(
                    f"Translating subtitles from {video_language} to {target_language}.."
                )
                self.output_message.push_update()

                try:
                    final_transcript = self.videodb_tool.translate_transcript(
                        video_id=video_id,
                        language=target_language_iso_code,
                        additional_notes=notes,
                    )
                except Exception as e:
                    logger.error(f"Translation failed: {e}")
                    subtitles_content.status = MsgStatus.error
                    subtitles_content.status_message = "Translation failed. Please try again."
                    self.output_message.publish()
                    return AgentResponse(
                        status=AgentStatus.ERROR,
                        message=f"Translation failed: {str(e)}",
                    )
            else:
                self.output_message.actions.append(f"Using original transcript in {video_language} and preparing the subtitles in {target_language}...")
                self.output_message.push_update()

            self.output_message.actions.append("Building subtitle configuration")
            self.output_message.push_update()

            config = self._build_config(
                target_language=target_lang,
                template=template,
                font_name=font_name,
                font_size=font_size,
                font_bold=font_bold,
                font_italic=font_italic,
                animation=animation,
                position_alignment=position_alignment,
                primary_color=primary_color,
                secondary_color=secondary_color,
                back_color=back_color,
                outline_color=outline_color,
                outline_width=outline_width,
                margin_vertical=margin_vertical,
                margin_horizontal=margin_horizontal,
            )

            self.output_message.actions.append(
                "Creating timeline with professional captions"
            )
            self.output_message.push_update()

            timeline = Timeline(self.videodb_tool.conn)
            timeline.background = "#000000"
            timeline.resolution = "1280x720"

            video_clip = Clip(
                asset=VideoAsset(id=video_id, start=0),
                duration=video_duration,
            )
            caption_clip = self._create_caption_clip(config, video_duration, final_transcript)

            track = Track()
            track.add_clip(0, video_clip)
            track.add_clip(0, caption_clip)
            timeline.add_track(track)

            self.output_message.actions.append(
                "Generating final video with animated subtitles"
            )
            self.output_message.push_update()

            stream_url = timeline.generate_stream()

            video_data = VideoData(
                stream_url=stream_url,
            )
            subtitles_content.video = video_data
            subtitles_content.status = MsgStatus.success
            
            animation_text = config.get("animation", "none")
            if animation_text == "none":
                animation_text = "static (no animation)"
            
            subtitle_lang_msg = target_language or video_language
            if needs_translation:
                subtitle_lang_msg = f"{target_language} (translated from {video_language})"
            
            subtitles_content.status_message = (
                f"Professional subtitles in {subtitle_lang_msg} added successfully! "
                f"Using template: {template}"
            )
            self.output_message.publish()

        except Exception as e:
            logger.exception(f"Error in {self.agent_name} agent: {e}")
            subtitles_content.status = MsgStatus.error
            subtitles_content.status_message = (
                f"An error occurred while adding professional subtitles: {str(e)}"
            )
            self.output_message.publish()
            return AgentResponse(status=AgentStatus.ERROR, message=str(e))

        return AgentResponse(
            status=AgentStatus.SUCCESS,
            message=f"Professional subtitles added successfully in {target_language or video_language}",
            data={
                "stream_url": stream_url,
                "template": template,
                "config": config,
                "video_language": video_language,
                "target_language": target_language or video_language,
                "translated": needs_translation,
            },
        )

