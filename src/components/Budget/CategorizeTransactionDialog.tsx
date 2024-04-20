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
import { useState } from "react";

export interface SimpleDialogProps {
  open: boolean;
  onClose: (value?: BudgetCategoryEntity) => void;
  budgetCategories: BudgetCategoryEntity[];
}

export function CategorizeTransactionDialog(props: SimpleDialogProps) {
  const [categoryType, setCategoryType] = useState<
    "Income" | "Saving" | "Wants" | "Needs"
  >();

  const { onClose, open } = props;

  const handleListItemClick = (value: BudgetCategoryEntity) => {
    onClickClose(value);
  };

  const handleSetCategoryClick = (
    value: "Income" | "Saving" | "Wants" | "Needs",
  ) => {
    setCategoryType(value);
  };

  const onClickClose = (value?: BudgetCategoryEntity) => {
    setCategoryType(undefined);
    onClose(value);
  };

  const findIcon = (
    categoryType: "Income" | "Saving" | "Wants" | "Needs" | undefined,
  ) => {
    if (!categoryType) return;
    switch (categoryType) {
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

  return (
    <Dialog open={open}>
      <DialogTitle>Which category</DialogTitle>
      {categoryType ? (
        <List sx={{ pt: 0 }}>
          {props.budgetCategories
            ?.filter((category) => category.type === categoryType)
            .map((budgetCategory) => (
              <ListItem disableGutters key={budgetCategory.id}>
                <ListItemButton
                  onClick={() => handleListItemClick(budgetCategory)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                      {findIcon(budgetCategory.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={budgetCategory.name} />
                </ListItemButton>
              </ListItem>
            ))}
          <ListItem disableGutters>
            <ListItemButton autoFocus onClick={() => onClickClose()}>
              <ListItemAvatar>
                <Avatar>
                  <Cancel />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Close Dialog" />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        <List sx={{ pt: 0 }}>
          {(
            ["Income", "Saving", "Wants", "Needs"] as (
              | "Income"
              | "Saving"
              | "Wants"
              | "Needs"
            )[]
          ).map((budgetCategoryType) => (
            <ListItem disableGutters key={budgetCategoryType}>
              <ListItemButton
                onClick={() => handleSetCategoryClick(budgetCategoryType)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                    {findIcon(budgetCategoryType)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${budgetCategoryType} - ${budgetCategoryType}`}
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
      )}
    </Dialog>
  );
}
