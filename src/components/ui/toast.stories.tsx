import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./toast";
import { Button } from "./button";

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          addToast({
            type: "success",
            title: "Success",
            description: "Your changes have been saved.",
          })
        }
      >
        Success Toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          addToast({
            type: "error",
            title: "Error",
            description: "Something went wrong.",
          })
        }
      >
        Error Toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          addToast({
            type: "warning",
            title: "Warning",
            description: "Please review your input.",
          })
        }
      >
        Warning Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          addToast({
            type: "info",
            title: "Info",
            description: "New features are available.",
          })
        }
      >
        Info Toast
      </Button>
    </div>
  );
}

const meta: Meta<typeof ToastProvider> = {
  title: "UI/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
