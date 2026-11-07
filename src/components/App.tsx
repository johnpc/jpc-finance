import { View } from "@aws-amplify/ui-react";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { Preview } from "react-dnd-preview";
import { Header } from "./Header";
import { Footer } from "./Footer";
import TabsView from "./TabsView";
import { PlaidLinkProvider } from "../providers/PlaidLinkProvider";
import { multiBackendOptions, generatePreview } from "../lib/dndConfig";

export function App() {
  return (
    <PlaidLinkProvider>
      <Header />
      <View maxWidth="760px" margin="0 auto" padding="0 1rem">
        <DndProvider backend={MultiBackend} options={multiBackendOptions}>
          <TabsView />
          <Preview generator={generatePreview} />
        </DndProvider>
      </View>
      <Footer />
    </PlaidLinkProvider>
  );
}
