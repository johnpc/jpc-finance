import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { BudgetCategoryEntity } from "../../data/entity";
import {
  AccountBalance,
  Cancel,
  Paid,
  Shop,
  ShoppingCart,
} from "@mui/icons-material";

export interface SimpleDialogProps {
  open: boolean;
  onClose: (value?: BudgetCategoryEntity) => void;
  budgetCategories: BudgetCategoryEntity[];
}

export function CategorizeTransactionDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;

  const handleListItemClick = (value: BudgetCategoryEntity) => {
    onClose(value);
  };

  const findIcon = (category: BudgetCategoryEntity) => {
    switch (category.type) {
      case "Income":
        return <Paid />;
      case "Saving":
        return <AccountBalance />;
      case "Wants":
        return <Shop />;
      case "Needs":
        return <ShoppingCart />;
    }
  };

  const compareBudgetCategories = (
    a: BudgetCategoryEntity,
    b: BudgetCategoryEntity,
  ) => {
    if (a.type === "Income") return -1;

    if (b.type === "Income") return 1;

    if (a.type === "Saving") return -1;

    if (b.type === "Saving") return 1;
    if (a.type === "Needs") return -1;

    if (b.type === "Needs") return 1;

    if (a.type === "Wants") return -1;

    return 1;
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Which category</DialogTitle>
      <List sx={{ pt: 0 }}>
        {props.budgetCategories
          ?.sort(compareBudgetCategories)
          .map((budgetCategory) => (
            <ListItem disableGutters key={budgetCategory.id}>
              <ListItemButton
                onClick={() => handleListItemClick(budgetCategory)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                    {findIcon(budgetCategory)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${budgetCategory.type} - ${budgetCategory.name}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        <ListItem disableGutters>
          <ListItemButton autoFocus onClick={() => onClose()}>
            <ListItemAvatar>
              <Avatar>
                <Cancel />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Close Dialog" />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  );
}
