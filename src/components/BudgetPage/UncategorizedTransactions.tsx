import { ScrollView, Flex, Button, Heading, Text } from "@aws-amplify/ui-react";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { TransactionEntity } from "../../lib/types";
import { toDollars } from "../../lib/currency";
import { useDate } from "../../hooks/useDateHook";
import { useTransactions } from "../../hooks/useTransactions";

function TransactionModal({
  transaction,
  onClose,
}: {
  transaction: TransactionEntity;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "400px",
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Heading level={4}>{transaction.name}</Heading>
        <Text>
          Amount: ${Math.abs(toDollars(transaction.amount)).toFixed(2)}
        </Text>
        <Text>Date: {transaction.date.toLocaleDateString()}</Text>
        <Text>Status: {transaction.pending ? "Pending" : "Posted"}</Text>
        <Button onClick={onClose} marginTop="20px">
          Close
        </Button>
      </div>
    </div>
  );
}

function TransactionBubble({
  transaction,
  onShowModal,
}: {
  transaction: TransactionEntity;
  onShowModal: () => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TRANSACTION",
    item: { transaction },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const color = transaction.amount > 0 ? "#ffc107" : "#4caf50";

  return (
    <div
      ref={drag}
      onClick={onShowModal}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        textAlign: "center",
        fontSize: "11px",
        fontWeight: "bold",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          width: "80px",
          lineHeight: "1.2",
          marginBottom: "4px",
        }}
      >
        {transaction.name}
      </div>
      <div style={{ fontSize: "12px" }}>
        ${Math.abs(toDollars(transaction.amount)).toFixed(2)}
      </div>
    </div>
  );
}

export default function UncategorizedTransactions() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionEntity | null>(null);
  const { date } = useDate();
  const { data: transactions = [] } = useTransactions(date);
  const uncategorized = transactions.filter(
    (t) => !t.budgetCategoryId && !t.deleted,
  );

  if (!uncategorized.length) return null;

  return (
    <>
      <ScrollView
        position="fixed"
        bottom="0px"
        height="150px"
        width="100%"
        style={{ overflowX: "scroll", overflowY: "hidden", zIndex: 100 }}
      >
        <Flex direction="row" gap="20px" padding="20px" wrap="nowrap">
          {uncategorized.map((transaction) => (
            <TransactionBubble
              key={transaction.id}
              transaction={transaction}
              onShowModal={() => setSelectedTransaction(transaction)}
            />
          ))}
        </Flex>
      </ScrollView>
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}
