import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from chat_request import ChatRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def send_completion_stream(request: ChatRequest):
    async def event_stream():
        try:
            print(request.messages[-1]["content"])
            chunk_message = "reply : " + request.messages[-1]["content"]
            yield f"data: {json.dumps({'content': chunk_message})}\n\n"
            yield f"data: [DONE]"
        except Exception as e:
            print(e)
            yield f"data: {json.dumps({'content': "Error : " + str(e)})}\n\n"
            yield f"data: [DONE]"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/v2/chat/completions")
async def get_chat_completion_stream(request: ChatRequest):
    return await send_completion_stream(request)
