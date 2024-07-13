import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { AppContextProvider } from "./core/context";
import store, { persistor } from "./store";

import ChatPage from "./components/pages/chat";
import LandingPage from "./components/pages/landing";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppContextProvider>
        <LandingPage landing={true} />
      </AppContextProvider>
    ),
  },
  {
    path: "/chat/:id",
    element: (
      <AppContextProvider>
        <ChatPage />
      </AppContextProvider>
    ),
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

async function bootstrapApplication() {
  root.render(
    <React.StrictMode>
      <MantineProvider theme={{ colorScheme: "light" }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ModalsProvider>
              <RouterProvider router={router} />
            </ModalsProvider>
          </PersistGate>
        </Provider>
      </MantineProvider>
    </React.StrictMode>,
  );
}

bootstrapApplication();
