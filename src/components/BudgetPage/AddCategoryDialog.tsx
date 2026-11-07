import { Button, Flex, TextField } from "@aws-amplify/ui-react";
import { Modal } from "../common/Modal";
import { useCategoryForm } from "../../hooks/useCategoryForm";
import { useCategoryMutations } from "../../hooks/useCategoryMutations";
import { CategoryType } from "../../lib/types";

type Props = { type: CategoryType; onClose: () => void };

export default function AddCategoryDialog({ type, onClose }: Props) {
  const { create } = useCategoryMutations();
  const form = useCategoryForm({ name: "", plannedAmount: 0 }, (values) => {
    create.mutate({ ...values, type });
    onClose();
  });

  return (
    <Modal title={`New ${type} category`} onClose={onClose}>
      <form onSubmit={form.submit}>
        <Flex direction="column" gap="1rem">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            hasError={!!form.nameError}
            errorMessage={form.nameError}
            autoFocus
          />
          <TextField
            label="Monthly target ($)"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => form.setAmount(e.target.value)}
            hasError={!!form.amountError}
            errorMessage={form.amountError}
          />
          <Flex justifyContent="flex-end">
            <Button variation="link" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variation="primary">
              Add category
            </Button>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
}
