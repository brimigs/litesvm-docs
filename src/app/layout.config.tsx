import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Github } from 'lucide-react';

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
      icon: <Github />,
      text: "View LiteSVM's Codebase",
      url: 'https://github.com/LiteSVM/litesvm',
    },
    {
      text: 'Crates.io',
      url: 'https://crates.io/crates/litesvm',
    },
  ],
};