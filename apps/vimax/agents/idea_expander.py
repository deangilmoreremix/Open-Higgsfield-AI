import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt


system_prompt_template_idea_expander = \
"""
[Role]
You are a creative video concept developer who transforms brief ideas into rich, production-ready video descriptions.

[Task]
Expand a short video idea into a detailed, vivid concept description that gives an AI video production system everything it needs to generate a compelling video. Add specific visual details, mood, setting, emotional arc, pacing, and key moments.

[Input]
You will receive a brief video idea within <IDEA_START> and <IDEA_END>.

[Output]
{format_instructions}

[Guidelines]
1. Preserve the original intent, topic, and core message of the idea exactly.
2. Add specific visual details: lighting conditions, environment textures, color palette, time of day, weather if relevant.
3. Describe the emotional tone and pacing (e.g., builds slowly, punchy and fast, calm and steady).
4. Include the target audience or intended context if it can be inferred.
5. Describe 2-4 key visual moments or scenes that should appear in the video.
6. Keep the description concrete and grounded in observable reality.
7. Do not add camera directions (no "cut to", "close-up", "pan", "zoom").
8. No metaphors or abstract language.
9. Write in present tense as a description, not a screenplay.
10. Output should be 3-6 focused sentences, production-ready.

Warnings
No camera directions. No metaphors. Preserve the original topic and intent. Do not invent brand names or people if they are not in the original idea.
"""


human_prompt_template_idea_expander = \
"""
<IDEA_START>
{idea}
<IDEA_END>
"""


class ExpandedIdeaResponse(BaseModel):
    expanded_idea: str = Field(
        ...,
        description="A richly detailed video concept description expanded from the original idea, ready for AI video generation."
    )


class IdeaExpander:
    def __init__(
        self,
        chat_model: str,
        base_url: str,
        api_key: str,
        model_provider: str = "openai",
    ):
        self.chat_model = init_chat_model(
            model=chat_model,
            model_provider=model_provider,
            base_url=base_url,
            api_key=api_key,
        )

    @retry(
        stop=stop_after_attempt(3),
        after=lambda retry_state: logging.warning(f"Retrying expand_idea due to error: {retry_state.outcome.exception()}"),
    )
    async def expand_idea(
        self,
        idea: str,
    ) -> str:
        parser = PydanticOutputParser(pydantic_object=ExpandedIdeaResponse)
        prompt_template = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt_template_idea_expander),
                ("human", human_prompt_template_idea_expander),
            ]
        )
        chain = prompt_template | self.chat_model | parser

        try:
            logging.info("Expanding idea...")
            response: ExpandedIdeaResponse = await chain.ainvoke(
                {
                    "format_instructions": parser.get_format_instructions(),
                    "idea": idea,
                }
            )
            logging.info("Idea expansion completed.")
            return response.expanded_idea
        except Exception as e:
            logging.error(f"Error expanding idea: \n{e}")
            raise e
