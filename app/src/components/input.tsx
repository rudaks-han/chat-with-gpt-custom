import styled from "@emotion/styled";
import { ActionIcon, Button, Loader, Textarea } from "@mantine/core";
import { getHotkeyHandler, useHotkeys, useMediaQuery } from "@mantine/hooks";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../core/context";
import { useAppDispatch, useAppSelector } from "../store";
import { selectMessage, setMessage } from "../store/message";
import { selectSettingsTab } from "../store/settings-ui";
import QuickSettings from "./quick-settings";
import { useOption } from "../core/options/use-option";

const Container = styled.div`
  background: #292933;
  border-top: thin solid #393933;
  padding: 1rem 1rem 0 1rem;

  .inner {
    max-width: 50rem;
    margin: auto;
    text-align: right;
    margin-bottom: 15px;
  }

  .settings-button {
    margin: 0.5rem -0.4rem 0.5rem 1rem;
    font-size: 0.7rem;
    color: #999;
  }
`;

export declare type OnSubmit = (name?: string) => Promise<boolean>;

export interface MessageInputProps {
  disabled?: boolean;
}

export default function MessageInput(props: MessageInputProps) {
  const message = useAppSelector(selectMessage);
  const hasVerticalSpace = useMediaQuery("(min-height: 1000px)");

  const navigate = useNavigate();
  const context = useAppContext();
  const dispatch = useAppDispatch();

  const tab = useAppSelector(selectSettingsTab);

  const [submitOnEnter] = useOption<boolean>("input", "submit-on-enter");

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(setMessage(e.target.value));
    },
    [dispatch],
  );

  const pathname = useLocation().pathname;

  const onSubmit = useCallback(async () => {
    const id = await context.onNewMessage(message);

    console.log("id", id);
    if (id) {
      if (!window.location.pathname.includes(id)) {
        navigate("/chat/" + id);
      }
      dispatch(setMessage(""));
    }
  }, [context, message, dispatch, navigate]);

  useHotkeys([
    [
      "n",
      () =>
        document.querySelector<HTMLTextAreaElement>("#message-input")?.focus(),
    ],
  ]);

  const blur = useCallback(() => {
    document.querySelector<HTMLTextAreaElement>("#message-input")?.blur();
  }, []);

  const rightSection = useMemo(() => {
    return (
      <div
        style={{
          opacity: "0.8",
          paddingRight: "0.5rem",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        }}
      >
        {context.generating && (
          <>
            <Button
              variant="subtle"
              size="xs"
              compact
              onClick={() => {
                context.chat.cancelReply(
                  context.currentChat.chat?.id,
                  context.currentChat.leaf!.id,
                );
              }}
            >
              Cancel
            </Button>
            <Loader size="xs" style={{ padding: "0 0.8rem 0 0.5rem" }} />
          </>
        )}
        {!context.generating && (
          <>
            <ActionIcon size="xl" onClick={onSubmit}>
              <i className="fa fa-paper-plane" style={{ fontSize: "90%" }} />
            </ActionIcon>
          </>
        )}
      </div>
    );
  }, [onSubmit, props.disabled, context.generating]);

  const disabled = context.generating;

  const isLandingPage = pathname === "/";
  if (context.isShare || (!isLandingPage && !context.id)) {
    return null;
  }

  const hotkeyHandler = useMemo(() => {
    const keys = [
      ["Escape", blur, { preventDefault: true }],
      ["ctrl+Enter", onSubmit, { preventDefault: true }],
    ];
    if (submitOnEnter) {
      keys.unshift(["Enter", onSubmit, { preventDefault: true }]);
    }
    const handler = getHotkeyHandler(keys as any);
    return handler;
  }, [onSubmit, blur, submitOnEnter]);

  return (
    <Container>
      <div className="inner">
        <Textarea
          disabled={props.disabled || disabled}
          id="message-input"
          autosize
          minRows={hasVerticalSpace || context.isHome ? 3 : 2}
          maxRows={12}
          placeholder="Enter a message here..."
          value={message}
          onChange={onChange}
          rightSection={rightSection}
          rightSectionWidth={context.generating ? 100 : 55}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) {
              return;
            }
            hotkeyHandler(e as any);
          }}
        />
      </div>
    </Container>
  );
}
