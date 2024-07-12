import styled from "@emotion/styled";
import { Loader } from "@mantine/core";

import { useOption } from "../core/options/use-option";
import { Message } from "../core/chat/types";
import { useAppContext } from "../core/context";
import { useMemo, useState } from "react";
import { useAppSelector } from "../store";
import { selectSettingsTab } from "../store/settings-ui";
import { Markdown } from "./markdown";

// hide for everyone but screen readers
const SROnly = styled.span`
  position: fixed;
  left: -9999px;
  top: -9999px;
`;

const Container = styled.div`
  &.by-user {
    background: #22232b;
  }

  &.by-assistant {
    background: #292933;
  }

  &.by-assistant + &.by-assistant,
  &.by-user + &.by-user {
    border-top: 0.2rem dotted rgba(0, 0, 0, 0.1);
  }

  &.by-assistant {
    border-bottom: 0.2rem solid rgba(0, 0, 0, 0.1);
  }

  position: relative;
  padding: 1.618rem;

  @media (max-width: 40em) {
    padding: 1rem;
  }

  .inner {
    margin: auto;
  }

  .content {
    font-family: "Open Sans", sans-serif;
    margin-top: 0rem;
    max-width: 100%;

    * {
      color: white;
    }

    p,
    ol,
    ul,
    li,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    img,
    blockquote,
    & > pre {
      max-width: 50rem;
      margin-left: auto;
      margin-right: auto;
    }

    img {
      display: block;
      max-width: 50rem;

      @media (max-width: 50rem) {
        max-width: 100%;
      }
    }

    ol {
      counter-reset: list-item;

      li {
        counter-increment: list-item;
      }
    }

    em,
    i {
      font-style: italic;
    }

    code {
      &,
      * {
        font-family: "Fira Code", monospace !important;
      }
      vertical-align: bottom;
    }

    /* Tables */
    table {
      margin-top: 1.618rem;
      border-spacing: 0px;
      border-collapse: collapse;
      border: thin solid rgba(255, 255, 255, 0.1);
      width: 100%;
      max-width: 55rem;
      margin-left: auto;
      margin-right: auto;
    }
    td + td,
    th + th {
      border-left: thin solid rgba(255, 255, 255, 0.1);
    }
    tr {
      border-top: thin solid rgba(255, 255, 255, 0.1);
    }
    table td,
    table th {
      padding: 0.618rem 1rem;
    }
    th {
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .metadata {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-family: "Work Sans", sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    opacity: 0.6;
    max-width: 50rem;
    margin-bottom: 0rem;
    margin-right: -0.5rem;
    margin-left: auto;
    margin-right: auto;

    span + span {
      margin-left: 1em;
    }

    .fa {
      font-size: 85%;
    }

    .fa + span {
      margin-left: 0.2em;

      @media (max-width: 40em) {
        display: none;
      }
    }

    .mantine-Button-root {
      color: #ccc;
      font-size: 0.8rem;
      font-weight: 400;

      .mantine-Button-label {
        display: flex;
        align-items: center;
      }
    }
  }

  .fa {
    margin-right: 0.5em;
    font-size: 85%;
  }

  .buttons {
    text-align: right;
  }

  strong {
    font-weight: bold;
  }
`;

const EndOfChatMarker = styled.div`
  position: absolute;
  bottom: calc(-1.618rem - 0.5rem);
  left: 50%;
  width: 0.5rem;
  height: 0.5rem;
  margin-left: -0.25rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
`;

const Editor = styled.div`
  max-width: 50rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0.5rem;

  .mantine-Button-root {
    margin-top: 1rem;
  }
`;

function InlineLoader() {
  return (
    <Loader
      variant="dots"
      size="xs"
      style={{
        marginLeft: "1rem",
        position: "relative",
        top: "-0.2rem",
      }}
    />
  );
}

export default function MessageComponent(props: {
  message: Message;
  last: boolean;
  share?: boolean;
}) {
  const context = useAppContext();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");

  const [katex] = useOption<boolean>("markdown", "katex");

  const tab = useAppSelector(selectSettingsTab);

  const elem = useMemo(() => {
    if (props.message.role === "system") {
      return null;
    }

    return (
      <Container className={"message by-" + props.message.role}>
        <div className="inner">
          <div className="metadata">
            <span>
              {props.message.role === "assistant" &&
                props.last &&
                !props.message.done && <InlineLoader />}
            </span>
          </div>
        </div>
        {!editing && (
          <Markdown
            content={props.message.content}
            katex={katex}
            className={"content content-" + props.message.id}
          />
        )}
        {props.last && <EndOfChatMarker />}
      </Container>
    );
  }, [
    props.last,
    props.share,
    editing,
    content,
    context,
    props.message,
    props.message.content,
    tab,
  ]);

  return elem;
}
