'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Technology', href: '/category/technology' },
  { name: 'Business', href: '/category/business' },
  { name: 'Health', href: '/category/health' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Trending', href: '/trending' },
];

const categories = [
  'technology',
  'business',
  'health',
  'entertainment',
  'sports',
  'politics',
  'science',
  'lifestyle',
  'travel',
  'food',
  'fashion',
  'education',
  'finance',
  'environment',
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">TrendWise</span>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TW</span>
              </div>
              <span className="text-xl font-bold gradient-text">TrendWise</span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-neutral-700 dark:text-neutral-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400',
                isActive(item.href)
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search and user menu */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-lg border border-neutral-300 bg-white pl-10 pr-4 py-2 text-sm placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
              />
            </div>
          </form>

          {/* Theme toggle */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              <span className="sr-only">Toggle theme</span>
              {theme === 'light' && <SunIcon className="h-5 w-5" />}
              {theme === 'dark' && <MoonIcon className="h-5 w-5" />}
              {theme === 'system' && <ComputerDesktopIcon className="h-5 w-5" />}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'flex w-full items-center px-4 py-2 text-sm',
                        active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                        theme === 'light' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      <SunIcon className="mr-3 h-4 w-4" />
                      Light
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'flex w-full items-center px-4 py-2 text-sm',
                        active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                        theme === 'dark' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      <MoonIcon className="mr-3 h-4 w-4" />
                      Dark
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setTheme('system')}
                      className={cn(
                        'flex w-full items-center px-4 py-2 text-sm',
                        active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                        theme === 'system' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      <ComputerDesktopIcon className="mr-3 h-4 w-4" />
                      System
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User menu */}
          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
          ) : session ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                {session.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-neutral-400" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700">
                  <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {session.user?.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {session.user?.email}
                    </p>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={cn(
                          'flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300',
                          active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                        )}
                      >
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                  {session.user?.role === 'admin' && (
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/admin"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300',
                            active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                          )}
                        >
                          <Cog6ToothIcon className="mr-3 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          'flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300',
                          active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="btn-primary"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <div className="lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-50 bg-black/25" onClick={() => setMobileMenuOpen(false)} />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-neutral-900/10 dark:bg-neutral-900 dark:ring-neutral-100/10">
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">TrendWise</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TW</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">TrendWise</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-neutral-700 dark:text-neutral-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-neutral-500/10 dark:divide-neutral-500/25">
                  {/* Search */}
                  <div className="py-6">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="search"
                          placeholder="Search articles..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-4 py-2 text-sm placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                        />
                      </div>
                    </form>
                  </div>
                  
                  {/* Navigation */}
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                          isActive(item.href)
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  {/* User section */}
                  <div className="py-6">
                    {session ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3">
                          {session.user?.image ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={session.user.image}
                              alt={session.user.name || 'User avatar'}
                            />
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-neutral-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {session.user?.name}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {session.user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-base font-semibold leading-7 text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          signIn('google');
                          setMobileMenuOpen(false);
                        }}
                        className="btn-primary w-full"
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </header>
  );
}

