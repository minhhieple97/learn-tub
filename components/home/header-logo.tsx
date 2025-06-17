import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { routes } from '@/routes';

export function HeaderLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
        <BookOpen className="text-white size-6" />
      </div>
      <Link
        href={routes.home}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
      >
        LearnTub
      </Link>
    </div>
  );
}
