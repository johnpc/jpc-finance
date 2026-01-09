import { Header } from "./Header";
import { Footer } from "./Footer";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { Preview } from "react-dnd-preview";
import TabsView from "./TabsView";
import { multiBackendOptions, generatePreview } from "../lib/dndConfig";

export function App() {
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
