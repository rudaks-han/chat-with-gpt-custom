import styled from "@emotion/styled";
import Helmet from "react-helmet";
import { useSpotlight } from "@mantine/spotlight";
import { Button, ButtonProps } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../core/context";
import { backend } from "../core/backend";
import { MenuItem, secondaryMenu } from "../menus";
import { useAppDispatch, useAppSelector } from "../store";
import { setTab } from "../store/settings-ui";
import { selectSidebarOpen, toggleSidebar } from "../store/sidebar";
import { openLoginModal, openSignupModal } from "../store/ui";
import { useOption } from "../core/options/use-option";
import { useHotkeys } from "@mantine/hooks";

const Banner = styled.div`
  background: rgba(224, 49, 49, 0.2);
  color: white;
  text-align: center;
  font-family: "Work Sans", sans-serif;
  font-size: 80%;
  padding: 0.5rem;
  cursor: pointer;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 2.618rem;
  background: rgba(0, 0, 0, 0);
  font-family: "Work Sans", sans-serif;

  &.shaded {
    background: rgba(0, 0, 0, 0.2);
  }

  h1 {
    @media (max-width: 40em) {
      width: 100%;
      order: -1;
    }

    font-family: "Work Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.3;

    animation: fadein 0.5s;
    animation-fill-mode: forwards;

    strong {
      font-weight: bold;
      white-space: nowrap;
    }

    span {
      display: block;
      font-size: 70%;
      white-space: nowrap;
    }

    @keyframes fadein {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  h2 {
    margin: 0 0.5rem;
    font-size: 1rem;
    white-space: nowrap;
  }

  .spacer {
    flex-grow: 1;
  }

  i {
    font-size: 90%;
  }

  i + span,
  .mantine-Button-root span.hide-on-mobile {
    @media (max-width: 40em) {
      position: absolute;
      left: -9999px;
      top: -9999px;
    }
  }

  .mantine-Button-root {
    @media (max-width: 40em) {
      padding: 0.5rem;
    }
  }
`;

const SubHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-family: "Work Sans", sans-serif;
  line-height: 1.7;
  opacity: 0.7;
  margin: 0.5rem 0.5rem 0 0.5rem;

  .spacer {
    flex-grow: 1;
  }

  a {
    color: white;
  }

  .fa + span {
    position: absolute;
    left: -9999px;
    top: -9999px;
  }
`;

function HeaderButton(
  props: ButtonProps & { icon?: string; onClick?: any; children?: any },
) {
  return (
    <Button
      size="xs"
      variant={props.variant || "subtle"}
      onClick={props.onClick}
    >
      {props.icon && <i className={"fa fa-" + props.icon} />}
      {props.children && <span>{props.children}</span>}
    </Button>
  );
}

export interface HeaderProps {
  title?: any;
}

export default function Header(props: HeaderProps) {
  const context = useAppContext();
  const navigate = useNavigate();
  const spotlight = useSpotlight();
  const [loading, setLoading] = useState(false);
  const [openAIApiKey] = useOption<string>("openai", "apiKey");
  const dispatch = useAppDispatch();

  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const onBurgerClick = useCallback(
    () => dispatch(toggleSidebar()),
    [dispatch],
  );

  const onNewChat = useCallback(async () => {
    setLoading(true);
    navigate(`/`);
    setLoading(false);
    setTimeout(
      () =>
        document.querySelector<HTMLTextAreaElement>("#message-input")?.focus(),
      100,
    );
  }, [navigate]);

  useHotkeys([["c", onNewChat]]);

  const header = useMemo(
    () => (
      <>
        <HeaderContainer className={context.isHome ? "shaded" : ""}>
          <Helmet>
            <title>
              {props.title ? `${props.title} - ` : ""}
              Chat with GPT
            </title>
          </Helmet>

          {context.isHome && <h2>Chat with GPT</h2>}
          <div className="spacer" />

          <HeaderButton
            icon="plus"
            onClick={onNewChat}
            loading={loading}
            variant="light"
          >
            New Chat
          </HeaderButton>
        </HeaderContainer>
      </>
    ),
    [
      sidebarOpen,
      onBurgerClick,
      props.title,
      onNewChat,
      loading,
      context.isHome,
      spotlight.openSpotlight,
    ],
  );

  return header;
}

function SubHeaderMenuItem(props: { item: MenuItem }) {
  return (
    <Button
      variant="subtle"
      size="sm"
      compact
      component={Link}
      to={props.item.link}
      target="_blank"
      key={props.item.link}
    >
      {props.item.icon && <i className={"fa fa-" + props.item.icon} />}
      <span>{props.item.label}</span>
    </Button>
  );
}

export function SubHeader(props: any) {
  const elem = useMemo(
    () => (
      <SubHeaderContainer>
        <div className="spacer" />
        {secondaryMenu.map((item) => (
          <SubHeaderMenuItem item={item} key={item.link} />
        ))}
      </SubHeaderContainer>
    ),
    [],
  );

  return elem;
}
