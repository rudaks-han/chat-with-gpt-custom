import React, { Suspense, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { Loader } from "@mantine/core";

import { useAppContext } from "../../core/context";
import { Page } from "../page";
import { useOption } from "../../core/options/use-option";

const Message = React.lazy(
  () => import(/* webpackPreload: true */ "../message"),
);

const Messages = styled.div`
  @media (min-height: 30em) {
    max-height: 100%;
    flex-grow: 1;
    overflow-y: scroll;
  }
  display: flex;
  flex-direction: column;
`;

const EmptyMessage = styled.div`
  flex-grow: 1;
  padding-bottom: 5vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Work Sans", sans-serif;
  line-height: 1.7;
  gap: 1rem;
  min-height: 10rem;
`;

export default function ChatPage(props: any) {
  const { id } = useParams();
  const context = useAppContext();

  const [autoScrollWhenOpeningChat] = useOption(
    "auto-scroll",
    "auto-scroll-when-opening-chat",
  );
  const [autoScrollWhileGenerating] = useOption(
    "auto-scroll",
    "auto-scroll-while-generating",
  );

  useEffect(() => {
    const shouldScroll =
      autoScrollWhenOpeningChat ||
      Date.now() - context.currentChat.chatLoadedAt > 5000;

    if (!shouldScroll) {
      return;
    }

    const container = document.querySelector("#messages") as HTMLElement;
    const messages = document.querySelectorAll("#messages .message");

    if (messages.length) {
      const latest = messages[messages.length - 1] as HTMLElement;
      const offset = Math.max(0, latest.offsetTop - 100);
      setTimeout(() => {
        container?.scrollTo({ top: offset, behavior: "smooth" });
      }, 100);
    }
  }, [
    context.currentChat?.chatLoadedAt,
    context.currentChat?.messagesToDisplay.length,
    autoScrollWhenOpeningChat,
  ]);

  const autoScroll = useCallback(() => {
    if (context.generating && autoScrollWhileGenerating) {
      const container = document.querySelector("#messages") as HTMLElement;
      container?.scrollTo({ top: 999999, behavior: "smooth" });
      container?.parentElement?.scrollTo({ top: 999999, behavior: "smooth" });
    }
  }, [context.generating, autoScrollWhileGenerating]);
  useEffect(() => {
    const timer = setInterval(() => autoScroll(), 1000);
    return () => {
      clearInterval(timer);
    };
  }, [autoScroll]);

  const messagesToDisplay = context.currentChat.messagesToDisplay;

  const shouldShowChat =
    id && context.currentChat.chat && !!messagesToDisplay.length;

  return (
    <Page id={id || "landing"}>
      <Suspense
        fallback={
          <Messages id="messages">
            <EmptyMessage>
              <Loader variant="dots" />
            </EmptyMessage>
          </Messages>
        }
      >
        <Messages id="messages">
          {shouldShowChat && (
            <div style={{ paddingBottom: "4.5rem" }}>
              {messagesToDisplay.map((message) => (
                <Message
                  key={id + ":" + message.id}
                  message={message}
                  last={context.currentChat.chat!.messages.leafs.some(
                    (n) => n.id === message.id,
                  )}
                />
              ))}
            </div>
          )}
          {!shouldShowChat && (
            <EmptyMessage>
              <Loader variant="dots" />
            </EmptyMessage>
          )}
        </Messages>
      </Suspense>
    </Page>
  );
}
