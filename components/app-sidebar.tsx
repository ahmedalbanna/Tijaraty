'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, ShoppingCart, Package, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const links = [
    { href: '/', label: 'رئيسي (لوحة القيادة)', icon: BarChart3 },
    { href: '/pos', label: 'نقاط البيع (POS)', icon: ShoppingCart },
    { href: '/inventory', label: 'المخزون والمنتجات', icon: Package },
    { href: '/customers', label: 'العملاء والديون', icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l flex flex-col hidden md:flex">
        <div className="p-6 border-b flex items-center justify-center">
          <Store className="w-8 h-8 text-primary ml-2" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-primary to-blue-600">
            تجارتي
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5 ml-3" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5 ml-3" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6 md:hidden">
            <Store className="w-6 h-6 text-primary ml-2" />
            <span className="font-bold">تجارتي</span>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
