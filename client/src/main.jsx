import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/app.scss";
import { BrowserRouter } from "react-router-dom";
import Context from "./context/Context.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { WhatsAppConfigProvider } from "./context/WhatsAppConfigContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Context>
      <ChatProvider>
        <WhatsAppConfigProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WhatsAppConfigProvider>
      </ChatProvider>
    </Context>
  </React.StrictMode>
);
