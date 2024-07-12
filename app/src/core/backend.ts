import EventEmitter from "events";
import * as Y from "yjs";
import { encode, decode } from "@msgpack/msgpack";
import { MessageTree } from "./chat/message-tree";
import { Chat } from "./chat/types";
import { AsyncLoop } from "./utils/async-loop";
import { ChatManager } from ".";
import { getRateLimitResetTimeFromResponse } from "./utils";
import { importChat } from "./chat/chat-persistance";

const endpoint = "/chatapi";

export let backend: {
  current?: Backend | null;
} = {};

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  services?: string[];
}

export class Backend extends EventEmitter {
  public user: User | null = null;
  public services: string[] = [];
  private checkedSession = false;

  // private sessionInterval = new AsyncLoop(() => this.getSession(), 1000 * 30);
  // private syncInterval = new AsyncLoop(() => this.sync(), 1000 * 5);

  private pendingYUpdate: Uint8Array | null = null;

  public constructor(private context: ChatManager) {
    super();

    if ((window as any).AUTH_PROVIDER) {
      backend.current = this;
    }
  }

  public receiveYUpdate(update: Uint8Array) {
    if (!this.pendingYUpdate) {
      this.pendingYUpdate = update;
    } else {
      this.pendingYUpdate = Y.mergeUpdates([this.pendingYUpdate, update]);
    }
  }

  async deleteChat(id: string) {
    return this.post(endpoint + "/delete", { id });
  }

  async get(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }

  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }
}
