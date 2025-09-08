import { getMDXComponents } from '@/mdx-components';
import HomePage from '../../../content/index.mdx';

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="container">
        <HomePage components={getMDXComponents()} />
      </div>
    </main>
  );
}