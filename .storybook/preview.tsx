import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import '../src/app/globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
