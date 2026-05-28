"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Building2, User, LogOut } from "lucide-react";
import { useTheme } from "@/lib/context/theme-context";
import { useMockDb } from "@/lib/context/mock-db-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useMockDb();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Properties", href: "/properties" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const renderThemeIcon = () => {
    if (!mounted) return <div className="h-5 w-5" />; // placeholder to prevent hydration mismatch
    return theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/40 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white shadow-lg shadow-gold/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground group-hover:text-gold transition-colors">
            REOP
            <span className="text-gold font-light text-xs ml-1 bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20 uppercase tracking-widest">
              OS
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors hover:text-gold relative py-1 ${
                    isActive ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 border-l border-border/40 pl-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {renderThemeIcon()}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-gold transition-colors"
                >
                  <User className="h-4 w-4 text-gold" />
                  <span>{currentUser.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="h-9 px-3 gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="gold" size="sm" className="h-9 px-4 text-sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {renderThemeIcon()}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-b border-border/40 p-6 flex flex-col gap-5 shadow-xl animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-bold transition-colors ${
                  pathname === link.href ? "text-gold" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4 flex flex-col gap-4">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  <span className="font-bold text-sm">{currentUser.name} ({currentUser.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setIsOpen(false); }} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="gold" className="w-full text-sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
