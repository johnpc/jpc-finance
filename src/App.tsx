import "@aws-amplify/ui-react/styles.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import {
  Heading,
  Image,
  Link,
  View,
  useTheme,
  withAuthenticator,
} from "@aws-amplify/ui-react";
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
    Header() {
      const { tokens } = useTheme();
      return (
        <View textAlign="center" backgroundColor={'#7FFFD4'} padding={'15px'}>
        <Image
          alt="logo"
          borderRadius={tokens.radii.xl}
          width={"100px"}
          src="/maskable.png"
        />
        <Heading fontSize={tokens.fontSizes.xl} color={tokens.colors.primary[90]}>jpc.finance</Heading>
      </View>
      );
    },
    Footer: () => (
      <div
        style={{
          textAlign: "center",
        }}
      >
        {Capacitor.getPlatform() === "ios" ? null : (
          <Link
            href="https://testflight.apple.com/join/cViA1MLc"
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
