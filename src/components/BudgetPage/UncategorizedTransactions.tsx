import { ScrollView, Flex, Button, Heading, Text } from "@aws-amplify/ui-react";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { TransactionEntity } from "../../lib/types";

function TransactionModal({ transaction, onClose }: { transaction: TransactionEntity; onClose: () => void }) {
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
        zIndex: 1000,
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
        <Text>Amount: ${(Math.abs(transaction.amount) / 100).toFixed(2)}</Text>
        <Text>Date: {transaction.date.toLocaleDateString()}</Text>
        <Text>Status: {transaction.pending ? "Pending" : "Posted"}</Text>
        <Button onClick={onClose} marginTop="20px">Close</Button>
      </div>
    </div>
  );
}

function TransactionBubble({ transaction }: { transaction: TransactionEntity }) {
  const [showModal, setShowModal] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TRANSACTION",
    item: { transaction },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const color = transaction.amount > 0 ? "#ffc107" : "#4caf50";

  return (
    <>
      <div
        ref={drag}
        onClick={() => setShowModal(true)}
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
        <div style={{ fontSize: "12px" }}>${(Math.abs(transaction.amount) / 100).toFixed(2)}</div>
      </div>
      {showModal && <TransactionModal transaction={transaction} onClose={() => setShowModal(false)} />}
    </>
  );
}

export default function UncategorizedTransactions({ transactions }: { transactions: TransactionEntity[] }) {
  const uncategorized = transactions.filter((t) => !t.budgetCategoryId && !t.deleted);

  if (!uncategorized.length) return null;

  return (
    <ScrollView position="fixed" bottom="0px" height="150px" width="100%" style={{ overflowX: "scroll", overflowY: "hidden" }}>
      <Flex direction="row" gap="20px" padding="20px" wrap="nowrap">
        {uncategorized.map((transaction) => (
          <TransactionBubble key={transaction.id} transaction={transaction} />
        ))}
      </Flex>
    </ScrollView>
  );
}
