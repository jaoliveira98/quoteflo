import type { Meta, StoryObj } from "@storybook/react";
import {
  Skeleton,
  SkeletonCard,
  SkeletonQuoteRow,
  SkeletonStats,
  SkeletonStatsWithChange,
} from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-12 w-full",
  },
};

export const Circle: Story = {
  args: {
    className: "h-12 w-12 rounded-full",
  },
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const QuoteRow: Story = {
  render: () => <SkeletonQuoteRow />,
};

export const Stats: Story = {
  render: () => <SkeletonStats />,
};

export const StatsWithChange: Story = {
  render: () => <SkeletonStatsWithChange />,
};
