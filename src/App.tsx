import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { App } from "./components/App";
import { AuthHeader } from "./components/AuthHeader";
import { AuthFooter } from "./components/AuthFooter";

const AuthenticatedApp = withAuthenticator(App, {
  components: {
    Header: AuthHeader,
    Footer: AuthFooter,
  },
});

export default AuthenticatedApp;
