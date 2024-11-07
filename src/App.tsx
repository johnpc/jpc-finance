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
import { HTML5Backend, HTML5BackendOptions } from "react-dnd-html5-backend";
import { DndProvider, DragPreviewImage } from "react-dnd";
import { TouchBackend, TouchBackendOptions } from "react-dnd-touch-backend";
import {
  MultiBackend,
  TouchTransition,
  MouseTransition,
  MultiBackendOptions,
} from "react-dnd-multi-backend";
import { Preview, PreviewGenerator } from "react-dnd-preview";
import { knightImage } from "./components/Budget/knightImage";

const generatePreview: PreviewGenerator = ({ itemType, item, style }) => {
  console.log({ item, itemType });
  return <img className="item-list__item" style={style} src={knightImage} />;
  // return <div className="item-list__item" style={style}><>{itemType}</></div>
};

const html5BackendOptions: HTML5BackendOptions = {
  rootElement: document.body,
};
console.log({
  html5BackendOptions,
  HTML5Backend,
  DragPreviewImage,
  MouseTransition,
});

const touchBackendOptions: TouchBackendOptions = {
  delay: 0,
  delayTouchStart: 0, // in milliseconds
  enableTouchEvents: true,
  enableKeyboardEvents: true,
  enableMouseEvents: true,
  ignoreContextMenu: true,
  enableHoverOutsideTarget: true,
  delayMouseStart: 0,
  touchSlop: 10,
  rootElement: document.body,
};
const multiBackendOptions: MultiBackendOptions = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
      options: html5BackendOptions,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: touchBackendOptions,
      preview: true,
      transition: TouchTransition,
    },
  ],
};

function App() {
  return (
    <>
      <Header />
      <DndProvider backend={MultiBackend} options={multiBackendOptions}>
        <TabsView />
        <Preview generator={generatePreview} />
      </DndProvider>
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
        <View textAlign="center" backgroundColor={"#7FFFD4"} padding={"15px"}>
          <Image
            alt="logo"
            borderRadius={tokens.radii.xl}
            width={"100px"}
            src="/maskable.png"
          />
          <Heading
            fontSize={tokens.fontSizes.xl}
            color={tokens.colors.primary[90]}
          >
            jpc.finance
          </Heading>
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
            href="https://apps.apple.com/us/app/jpc-finance/id6499078837"
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
