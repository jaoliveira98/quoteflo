import type { Meta, StoryObj } from "@storybook/react";
import { DashboardShell } from "./dashboard-shell";

const meta: Meta<typeof DashboardShell> = {
  title: "Components/DashboardShell",
  component: DashboardShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DashboardShell
      user={{
        email: "user@example.com",
        company_name: "Acme Inc",
      }}
    >
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-600 mt-1">
          Main content area. The shell provides the sidebar navigation and header.
          </p>
        </div>
      </div>
    </DashboardShell>
  ),
};
