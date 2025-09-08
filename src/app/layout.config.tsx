import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  githubUrl: 'https://github.com/LiteSVM/litesvm',
  nav: {
    title: 'LiteSVM',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/LiteSVM/litesvm',
    },
    {
      text: 'Crates.io',
      url: 'https://crates.io/crates/litesvm',
    },
  ],
};