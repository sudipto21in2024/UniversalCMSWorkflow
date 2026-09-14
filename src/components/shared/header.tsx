import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Search, Heart, ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-border/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-24 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/figma-assets/icons/meubel-house_logos-05-117-355.svg"
            alt="Furniro Logo"
            width={40}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-bold text-2xl tracking-tight text-content-primary font-serif">
            Furniro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12 text-base font-medium text-content-primary">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-6 text-content-primary">
          <button aria-label="User Account" className="hover:text-primary transition-colors">
            <User className="h-6 w-6" />
          </button>
          <button aria-label="Search Catalog" className="hover:text-primary transition-colors">
            <Search className="h-6 w-6" />
          </button>
          <button aria-label="Wishlist" className="hover:text-primary transition-colors">
            <Heart className="h-6 w-6" />
          </button>
          <button aria-label="Shopping Cart" className="hover:text-primary transition-colors">
            <ShoppingCart className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
