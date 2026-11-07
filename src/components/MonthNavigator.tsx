import { Button, Flex, Heading } from "@aws-amplify/ui-react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useMonthNavigation } from "../hooks/useMonthNavigation";

export default function MonthNavigator() {
  const { label, previous, next, today, isCurrentMonth } = useMonthNavigation();

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      gap="0.5rem"
      marginBottom="1rem"
    >
      <Button variation="link" onClick={previous} aria-label="Previous month">
        <ChevronLeft />
      </Button>
      <Heading level={5} minWidth="10rem" textAlign="center" aria-live="polite">
        {label}
      </Heading>
      <Button variation="link" onClick={next} aria-label="Next month">
        <ChevronRight />
      </Button>
      {!isCurrentMonth && (
        <Button size="small" onClick={today}>
          Today
        </Button>
      )}
    </Flex>
  );
}
