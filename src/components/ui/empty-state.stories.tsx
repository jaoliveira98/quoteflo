import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./empty-state";
import { Button } from "./button";
import { FileText } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: FileText,
    title: "No quotes yet",
    description: "Get started by creating your first quote.",
  },
};

export const WithAction: Story = {
  args: {
    icon: FileText,
    title: "No quotes yet",
    description: "Get started by creating your first quote.",
    children: <Button>Create Quote</Button>,
  },
};
