import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Wallet, Compass, Utensils, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/finance', icon: Wallet, label: 'Finance' },
    { to: '/lifestyle', icon: Compass, label: 'Lifestyle' },
    { to: '/recipes', icon: Utensils, label: 'Recipes' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-md mx-auto px-4 pt-6">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-xl border-t border-white/10 z-40">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
