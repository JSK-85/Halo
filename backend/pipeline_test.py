import asyncio
import os
from dotenv import load_dotenv

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask, PipelineParams
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.google.llm import GoogleLLMService
from pipecat.services.deepgram.tts import DeepgramTTSService
from pipecat.transports.local.audio import LocalAudioTransport
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.audio.vad.silero import SileroVADAnalyzer

load_dotenv()

async def main():
    # Local audio — uses system mic and speakers
    transport = LocalAudioTransport()

    # Deepgram Nova-2 streaming STT
    stt = DeepgramSTTService(api_key=os.getenv('DEEPGRAM_API_KEY'))

    # System prompt — defines assistant personality
    system_instruction = (
        'You are a helpful personal AI assistant named Halo. '
        'Keep responses concise: 1-3 sentences unless the user asks for detail. '
        'You are speaking out loud, so NEVER use markdown, bullet points, '
        'or any formatting. Just plain conversational sentences.'
    )

    # Gemini LLM
    llm = GoogleLLMService(
        api_key=os.getenv('GOOGLE_API_KEY'),
        model="gemini-2.5-flash",
        settings=GoogleLLMService.Settings(
            model='gemini-2.5-flash',
            system_instruction=system_instruction
        )
    )

    # Deepgram TTS — Asteria voice
    tts = DeepgramTTSService(
        api_key=os.getenv('DEEPGRAM_API_KEY'),
        voice='aura-asteria-en'
    )

    # Initialize empty context
    context = LLMContext()
    
    # Set up aggregators and VAD
    user_agg, assistant_agg = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            vad_analyzer=SileroVADAnalyzer()
        )
    )

    # Build the pipeline in order
    pipeline = Pipeline([
        transport.input(),          # capture mic audio
        stt,                        # audio -> transcript text
        user_agg,                   # add transcript to conversation history (also runs VAD)
        llm,                        # transcript -> Claude response
        tts,                        # Claude text -> speech audio
        transport.output(),         # play audio through speakers
        assistant_agg,              # save assistant reply to history
    ])

    runner = PipelineRunner()
    task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
    await runner.run(task)

if __name__ == '__main__':
    asyncio.run(main())
