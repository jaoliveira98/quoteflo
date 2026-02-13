import type { StorybookConfig } from '@storybook/nextjs-vite';

function stripUseClientPlugin() {
  return {
    name: 'strip-use-client',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.includes('node_modules')) return null;
      const directive = /^["']use client["']\s*;?\s*\n?/;
      if (directive.test(code)) {
        return { code: code.replace(directive, ''), map: null };
      }
      return null;
    },
  };
}

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), stripUseClientPlugin()];
    config.build = config.build ?? {};
    config.build.sourcemap = false;
    config.build.rollupOptions = config.build.rollupOptions ?? {};
    const rollupOptions = config.build.rollupOptions as { onwarn?: (warning: unknown, warn: (w: unknown) => void) => void };
    const originalOnwarn = rollupOptions.onwarn;
    rollupOptions.onwarn = (warning, warn) => {
      if (warning && typeof warning === 'object' && 'code' in warning && warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      originalOnwarn?.(warning, warn) ?? warn(warning);
    };
    return config;
  },
};
export default config;