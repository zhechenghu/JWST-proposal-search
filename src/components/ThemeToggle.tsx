import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch { }
    }, [theme]);

    const disableTransitionsTemporarily = () => {
        const root = document.documentElement;
        root.classList.add('no-theme-transition');
        // Force reflow to ensure the class takes effect
        void root.offsetWidth;
        // Remove the class on the next frame after styles have applied
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove('no-theme-transition');
            });
        });
    };

    const toggle = () => {
        disableTransitionsTemporarily();
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            onClick={toggle}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
            <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
    );
}


