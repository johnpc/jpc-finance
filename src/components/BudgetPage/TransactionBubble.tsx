import { useDrag } from "react-dnd";
import { useTheme } from "@aws-amplify/ui-react";
import { formatMoney } from "../../lib/currency";
import {
  TRANSACTION_DRAG_TYPE,
  TransactionDragItem,
} from "../../lib/dndConfig";
import { displayedName } from "../../lib/transactionName";
import { TransactionEntity } from "../../lib/types";

type Props = { transaction: TransactionEntity; onClick: () => void };

/** A draggable chip for one uncategorized transaction. */
export default function TransactionBubble({ transaction, onClick }: Props) {
  const { tokens } = useTheme();
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: TRANSACTION_DRAG_TYPE,
      item: { id: transaction.id } satisfies TransactionDragItem,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [transaction.id],
  );
  const isIncome = transaction.amount < 0;

  return (
    <button
      ref={dragRef}
      onClick={onClick}
      title={displayedName(transaction)}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        flexShrink: 0,
        width: 96,
        height: 76,
        border: "none",
        borderRadius: 12,
        padding: 8,
        color: "white",
        font: "inherit",
        fontSize: 12,
        background: isIncome
          ? tokens.colors.green[80].value
          : tokens.colors.teal[80].value,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        touchAction: "none",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.2,
        }}
      >
        {displayedName(transaction)}
      </span>
      <strong>
        {isIncome ? "+" : ""}
        {formatMoney(transaction.amount)}
      </strong>
    </button>
  );
}
