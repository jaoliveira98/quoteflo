import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "./button";
import { useState } from "react";

function ConfirmDialogDemo({
  variant,
  isLoading,
}: {
  variant?: "danger" | "warning";
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Confirm Dialog
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Delete quote?"
        description="This action cannot be undone. This will permanently delete the quote and remove it from our servers."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant={variant}
        isLoading={isLoading}
      />
    </>
  );
}

const meta: Meta<typeof ConfirmDialog> = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  render: () => <ConfirmDialogDemo variant="danger" />,
};

export const Warning: Story = {
  render: () => <ConfirmDialogDemo variant="warning" />,
};

export const Loading: Story = {
  render: () => <ConfirmDialogDemo variant="danger" isLoading />,
};
