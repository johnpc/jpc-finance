import { ReactNode, useEffect } from "react";
import { Flex, Heading, useTheme } from "@aws-amplify/ui-react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Centered dialog over a dimmed backdrop; Escape or a backdrop click closes it. */
export function Modal({ title, onClose, children }: Props) {
  const { tokens } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      justifyContent="center"
      alignItems="center"
      style={{ zIndex: 1000 }}
      onClick={onClose}
    >
      <Flex
        role="dialog"
        aria-modal="true"
        aria-label={title}
        direction="column"
        gap="1rem"
        backgroundColor={tokens.colors.background.primary}
        padding="1.5rem"
        borderRadius={tokens.radii.medium}
        width="min(440px, calc(100vw - 32px))"
        maxHeight="calc(100vh - 32px)"
        style={{ overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Heading level={4}>{title}</Heading>
        {children}
      </Flex>
    </Flex>
  );
}
