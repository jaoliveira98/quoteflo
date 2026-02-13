import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import '../src/app/globals.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
