import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { useState } from "react";

interface EditModalProps {
  title: string;
  label: string;
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  validate?: (value: string) => string | null;
  type?: "text" | "number";
}

export function EditModal({
  title,
  label,
  initialValue,
  onSave,
  onCancel,
  validate,
  type = "text",
}: EditModalProps) {
  const { tokens } = useTheme();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const validationError = validate?.(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(value);
  };

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
      onClick={onCancel}
    >
      <Flex
        direction="column"
        backgroundColor={tokens.colors.background.primary}
        padding="2rem"
        borderRadius={tokens.radii.medium}
        gap="1rem"
        minWidth="300px"
        onClick={(e) => e.stopPropagation()}
      >
        <Heading level={4}>{title}</Heading>
        <Flex direction="column" gap="0.5rem">
          <Text>{label}</Text>
          <Input
            type={type}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            hasError={!!error}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancel();
            }}
          />
          {error && <Text color={tokens.colors.red[60]}>{error}</Text>}
        </Flex>
        <Flex gap="0.5rem" justifyContent="flex-end">
          <Button onClick={onCancel} variation="link">
            Cancel
          </Button>
          <Button onClick={handleSave} variation="primary">
            Save
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
