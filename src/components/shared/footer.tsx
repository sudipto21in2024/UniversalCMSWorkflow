import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand & Address */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-content-primary font-serif">Furniro.</h2>
          <address className="not-italic text-content-muted leading-relaxed text-sm">
            400 University Drive Suite 200 Coral Gables, <br />
            FL 33134 USA
          </address>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-content-muted">Links</h3>
          <ul className="flex flex-col gap-3 text-sm font-medium text-content-primary">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-content-muted">Help</h3>
          <ul className="flex flex-col gap-3 text-sm font-medium text-content-primary">
            <li>
              <Link href="/payment-options" className="hover:text-primary transition-colors">Payment Options</Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-primary transition-colors">Returns</Link>
            </li>
            <li>
              <Link href="/privacy-policies" className="hover:text-primary transition-colors">Privacy Policies</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Form */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-content-muted">Newsletter</h3>
          <form className="flex flex-col sm:flex-row gap-2" action="#">
            <input
              type="email"
              placeholder="Enter Your Email Address"
              className="text-sm border-b border-content-primary bg-transparent py-1 px-0 focus:outline-none focus:border-primary flex-1 min-w-0 placeholder:text-content-muted"
            />
            <button
              type="submit"
              className="text-sm font-bold uppercase tracking-wider border-b border-content-primary py-1 hover:text-primary hover:border-primary transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 border-t border-border/60 text-sm text-content-primary">
        <p>2026 Furniro. All rights reserved</p>
      </div>
    </footer>
  );
}
