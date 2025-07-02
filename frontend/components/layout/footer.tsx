'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  HeartIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  TwitterIcon,
  FacebookIcon,
  LinkedInIcon,
  GitHubIcon,
  InstagramIcon,
} from '@/components/ui/social-icons';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  categories: [
    { name: 'Technology', href: '/category/technology' },
    { name: 'Business', href: '/category/business' },
    { name: 'Health', href: '/category/health' },
    { name: 'Entertainment', href: '/category/entertainment' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Science', href: '/category/science' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Trending', href: '/trending' },
    { name: 'Search', href: '/search' },
    { name: 'RSS Feed', href: '/rss.xml' },
    { name: 'Sitemap', href: '/sitemap.xml' },
    { name: 'API Docs', href: '/api/docs' },
  ],
  social: [
    {
      name: 'Twitter',
      href: 'https://twitter.com/trendwise',
      icon: TwitterIcon,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/trendwise',
      icon: FacebookIcon,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/trendwise',
      icon: LinkedInIcon,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/trendwise',
      icon: InstagramIcon,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/trendwise',
      icon: GitHubIcon,
    },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company info and newsletter */}
          <div className="space-y-8">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TW</span>
                </div>
                <span className="text-xl font-bold gradient-text">TrendWise</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Discover trending topics and AI-generated articles on technology, business, health, and more. 
                Stay ahead of the curve with TrendWise's intelligent content platform.
              </p>
            </div>
            
            {/* Newsletter signup */}
            <div>
              <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                Subscribe to our newsletter
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Get the latest trending articles delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-6 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:w-64 sm:text-sm sm:leading-6 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600 dark:placeholder:text-neutral-500 dark:focus:ring-brand-500"
                  placeholder="Enter your email"
                  disabled={isSubscribing || subscribed}
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                  <button
                    type="submit"
                    disabled={isSubscribing || subscribed}
                    className="flex w-full items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="spinner mr-2" />
                        Subscribing...
                      </>
                    ) : subscribed ? (
                      'Subscribed!'
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              </form>
              {subscribed && (
                <p className="mt-2 text-sm text-success-600 dark:text-success-400">
                  Thank you for subscribing! Check your email for confirmation.
                </p>
              )}
            </div>
            
            {/* Social links */}
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                  Categories
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.categories.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                  Resources
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                  Contact
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-4 w-4 text-neutral-400" />
                    <a
                      href="mailto:hello@trendwise.com"
                      className="text-sm leading-6 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      hello@trendwise.com
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <PhoneIcon className="h-4 w-4 text-neutral-400" />
                    <a
                      href="tel:+1-555-123-4567"
                      className="text-sm leading-6 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      +1 (555) 123-4567
                    </a>
                  </li>
                  <li className="flex items-start space-x-3">
                    <MapPinIcon className="h-4 w-4 text-neutral-400 mt-0.5" />
                    <span className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                      123 Innovation Drive<br />
                      San Francisco, CA 94105
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-16 border-t border-neutral-900/10 pt-8 sm:mt-20 lg:mt-24 dark:border-neutral-100/10">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} TrendWise. All rights reserved.
            </p>
            <div className="mt-4 flex items-center space-x-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400 sm:mt-0">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>by the TrendWise team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

