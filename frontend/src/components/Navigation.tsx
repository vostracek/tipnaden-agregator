'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Home, Calendar, Info } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo s gradientem */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold transition-colors group"
          >
            <Home size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 group-hover:from-blue-300 group-hover:to-purple-400 transition-all">
              TipNaDen.cz
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive('/') 
                  ? 'text-white bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Home size={18} />
              <span className="font-medium">Domů</span>
            </Link>
            
            <Link 
              href="/events" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive('/events') 
                  ? 'text-white bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar size={18} />
              <span className="font-medium">Události</span>
            </Link>

            <Link 
              href="/about" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive('/about') 
                  ? 'text-white bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Info size={18} />
              <span className="font-medium">O nás</span>
            </Link>

            {/* Auth - Desktop */}
            <div className="ml-4 flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-700 hover:border-slate-600">
                    Přihlásit se
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full border-2 border-slate-600 hover:border-slate-500 transition-colors"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-all border border-slate-700">
                  Přihlásit
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-full border-2 border-slate-600 hover:border-slate-500 transition-colors"
                  }
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Links */}
        <div className="md:hidden pb-4 flex items-center gap-4 overflow-x-auto">
          <Link 
            href="/" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive('/') 
                ? 'text-white bg-slate-800' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home size={16} />
            <span className="text-sm font-medium">Domů</span>
          </Link>
          
          <Link 
            href="/events" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive('/events') 
                ? 'text-white bg-slate-800' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar size={16} />
            <span className="text-sm font-medium">Události</span>
          </Link>

          <Link 
            href="/about" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive('/about') 
                ? 'text-white bg-slate-800' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Info size={16} />
            <span className="text-sm font-medium">O nás</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}