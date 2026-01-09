import { HTML5Backend, HTML5BackendOptions } from "react-dnd-html5-backend";
import { TouchBackend, TouchBackendOptions } from "react-dnd-touch-backend";
import {
  MultiBackendOptions,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";
import { PreviewGenerator } from "react-dnd-preview";
import { knightImage } from "../components/BudgetPage/knightImage";

export const generatePreview: PreviewGenerator = ({ style }) => (
  <img style={style} src={knightImage} alt="dragging" />
);

export const multiBackendOptions: MultiBackendOptions = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
      options: { rootElement: document.body } as HTML5BackendOptions,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: {
        delay: 0,
        delayTouchStart: 0,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
        enableMouseEvents: true,
        ignoreContextMenu: true,
        enableHoverOutsideTarget: true,
        delayMouseStart: 0,
        touchSlop: 10,
        rootElement: document.body,
      } as TouchBackendOptions,
      preview: true,
      transition: TouchTransition,
    },
  ],
};
