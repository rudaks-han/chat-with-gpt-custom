import EventEmitter from "events";
import SSE from "../utils/sse";
import {OpenAIMessage, Parameters} from "./types";

export const defaultModel = "gpt-3.5-turbo";

function getEndpoint() {
  // return "/endpoint___";
  return "http://localhost:8000";
}

export interface OpenAIResponseChunk {
  id?: string;
  done: boolean;
  choices?: {
    delta: {
      content: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
  model?: string;
}

export async function createStreamingChatCompletion(
  messages: OpenAIMessage[],
  parameters: Parameters,
) {
  const emitter = new EventEmitter();

  const endpoint = getEndpoint();

  const eventSource = new SSE(endpoint + "/v2/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      Authorization: "++++ ",
      "Content-Type": "application/json",
    },
    payload: JSON.stringify({
      model: parameters.model,
      messages: messages,
      stream: true,
    }),
  }) as SSE;

  let contents = "";

  eventSource.addEventListener("error", (event: any) => {
    if (!contents) {
      let error = event.data;
      try {
        error = JSON.parse(error).error.message;
      } catch (e) {}
      emitter.emit("error", error);
    }
  });

  eventSource.addEventListener("message", async (event: any) => {
    if (event.data === "[DONE]") {
      emitter.emit("done");
      return;
    }

    try {
      if (event.data) {
        const chunk = JSON.parse(event.data);
        contents += chunk.content || "";
        emitter.emit("data", contents);
      }
    } catch (e) {
      console.error(e);
    }
  });

  eventSource.stream();

  return {
    emitter,
    cancel: () => eventSource.close(),
  };
}