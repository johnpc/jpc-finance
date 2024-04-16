import "@aws-amplify/ui-react/styles.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Link, withAuthenticator } from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";
import TabsView from "./components/TabsView";
function App() {
  return (
    <>
      <Header />
      <TabsView />
      <Footer />
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default withAuthenticator(App, {
  components: {
    Footer: () => (
      <div
        style={{
          textAlign: "center",
        }}
      >
        {Capacitor.getPlatform() === "ios" ? null : (
          <Link
            href="https://apps.apple.com/us/app/jpc-fit/id6482482386"
            style={{
              color: "white",
            }}
          >
            Download the app for iOS devices
          </Link>
        )}
      </div>
    ),
  },
});
