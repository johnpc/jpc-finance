import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import config from "../amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { ThemeProvider, Theme } from "@aws-amplify/ui-react";
Amplify.configure(config);

const theme: Theme = {
  name: "my-theme",
  primaryColor: "green",
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
