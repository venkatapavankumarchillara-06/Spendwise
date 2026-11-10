import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenSidebar, onOpenAddTransaction, title = 'Dashboard' }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Add Button */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Currency badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Currency:</span>
          <span className="text-emerald-500">{user?.currency || 'INR'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

