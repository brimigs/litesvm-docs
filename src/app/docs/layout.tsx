import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { Github } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      sidebar={{
        defaultOpenLevel: 0,
        collapsible: true,
        footer: (
          <div className="mt-auto border-t pt-4">
            <a
              href="https://github.com/LiteSVM/litesvm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>View LiteSVM's Codebase</span>
            </a>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
