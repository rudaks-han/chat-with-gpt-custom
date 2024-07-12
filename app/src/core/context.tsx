import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Backend, User } from "./backend";
import { ChatManager } from "./";
import { useAppDispatch } from "../store";
import { Message, Parameters } from "./chat/types";
import { useChat, UseChatResult } from "./chat/use-chat";
import { useLocation, useParams } from "react-router-dom";

export interface Context {
  chat: ChatManager;
  user: User | null;
  id: string | undefined | null;
  currentChat: UseChatResult;
  isHome: boolean;
  isShare: boolean;
  generating: boolean;
  onNewMessage: (message?: string) => Promise<string | false>;
  regenerateMessage: (message: Message) => Promise<boolean>;
  editMessage: (message: Message, content: string) => Promise<boolean>;
}

const AppContext = React.createContext<Context>({} as any);

const chatManager = new ChatManager();
const backend = new Backend(chatManager);

export function useCreateAppContext(): Context {
  const { id: _id } = useParams();
  const [nextID, setNextID] = useState(uuidv4());
  const id = _id ?? nextID;

  const dispatch = useAppDispatch();

  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isShare = pathname.startsWith("/s/");

  const currentChat = useChat(chatManager, id, isShare);

  useEffect(() => {
    chatManager.on("y-update", (update) => backend?.receiveYUpdate(update));
  }, []);

  const updateAuth = useCallback((authenticated: boolean) => {
    if (authenticated && backend.user) {
      chatManager.login(backend.user.email || backend.user.id);
    }
    if (authenticated) {
      localStorage.setItem("registered", "true");
    }
  }, []);

  useEffect(() => {
    backend?.on("authenticated", updateAuth);
    return () => {
      backend?.off("authenticated", updateAuth);
    };
  }, [updateAuth]);

  const onNewMessage = useCallback(
    async (message?: string) => {
      if (!message?.trim().length) {
        return false;
      }

      const parameters: Parameters = {
        model: chatManager.options.getOption<string>("parameters", "model", id),
      };

      if (id === nextID) {
        setNextID(uuidv4());
      }

      chatManager.sendMessage({
        chatID: id,
        content: message.trim(),
        requestedParameters: {
          ...parameters,
        },
        parentID: currentChat.leaf?.id,
      });
      // }

      return id;
    },
    [dispatch, id, currentChat.leaf, isShare],
  );

  const regenerateMessage = useCallback(
    async (message: Message) => {
      if (isShare) {
        return false;
      }

      const parameters: Parameters = {
        model: chatManager.options.getOption<string>("parameters", "model", id),
      };

      await chatManager.regenerate(message, {
        ...parameters,
      });

      return true;
    },
    [dispatch, isShare],
  );

  const editMessage = useCallback(
    async (message: Message, content: string) => {
      if (isShare) {
        return false;
      }

      if (!content?.trim().length) {
        return false;
      }

      const parameters: Parameters = {
        model: chatManager.options.getOption<string>("parameters", "model", id),
      };

      if (id && chatManager.has(id)) {
        await chatManager.sendMessage({
          chatID: id,
          content: content.trim(),
          requestedParameters: {
            ...parameters,
          },
          parentID: message.parentID,
        });
      } else {
        const id = await chatManager.createChat();
        await chatManager.sendMessage({
          chatID: id,
          content: content.trim(),
          requestedParameters: {
            ...parameters,
          },
          parentID: message.parentID,
        });
      }

      return true;
    },
    [dispatch, id, isShare],
  );

  const generating =
    currentChat?.messagesToDisplay?.length > 0
      ? !currentChat.messagesToDisplay[currentChat.messagesToDisplay.length - 1]
          .done
      : false;

  const context = useMemo<Context>(
    () => ({
      id,
      user: backend.user,
      chat: chatManager,
      currentChat,
      isHome,
      isShare,
      generating,
      onNewMessage,
      regenerateMessage,
      editMessage,
    }),
    [
      generating,
      onNewMessage,
      regenerateMessage,
      editMessage,
      currentChat,
      id,
      isHome,
      isShare,
    ],
  );

  return context;
}

export function useAppContext() {
  return React.useContext(AppContext);
}

export function AppContextProvider(props: { children: React.ReactNode }) {
  const context = useCreateAppContext();
  return (
    <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
  );
}
