/* [token-codemod] Auto-fixed arbitrary values to official tokens on 2026-09-13 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import navItems from "@/config/navigation.json";
import { 
  LayoutGrid, 
  FileText, 
  UploadCloud, 
  Briefcase, 
  History, 
  Users, 
  Lightbulb, 
  MessageSquare, 
  UserCog,
  Lock,
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  CreditCard,
  Settings
} from "lucide-react";

// Icon mapping dictionary
const iconMap: Record<string, React.ElementType> = {
  LayoutGrid,
  FileText,
  UploadCloud,
  Briefcase,
  History,
  Users,
  Lightbulb,
  MessageSquare,
  UserCog,
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  CreditCard,
  Settings,
};

interface UniversalSidebarProps {
  showSecurityCard?: boolean;
}

export const UniversalSidebar: React.FC<UniversalSidebarProps> = ({
  showSecurityCard = false,
}) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Ghost spacer to prevent layout shift on smaller screens when sidebar expands on hover */}
      <div className="w-20 lg:w-64 shrink-0 transition-all duration-300 pointer-events-none" />

      {/* Main Sidebar (Icon-rail on mobile, expands to full width on hover or on desktop) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 bottom-0 bg-white border-r border-border flex flex-col justify-between py-6 px-3 lg:px-4 z-40 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
          isHovered
            ? "w-64 shadow-2xl"
            : "w-20 lg:w-64 shadow-sm"
        }`}
      >
        <div>
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 px-2.5 mb-8 block group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-feedback-success/25 shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 rounded-full border-2 border-white" />
            </div>
            <span
              className={`text-xl font-black tracking-wider text-content-primary transition-all duration-200 overflow-hidden whitespace-nowrap ${
                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto"
              }`}
            >
              ZARVIS
            </span>
          </Link>

          <div className="h-px bg-border mb-6 mx-1" />

          {/* Navigation Links from JSON */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutGrid;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  className={`w-full flex items-center rounded-xl text-[14px] font-semibold transition-all group ${
                    isHovered ? "px-3.5 py-3 justify-between" : "px-0 py-3 justify-center lg:px-3.5 lg:justify-between"
                  } ${
                    isActive
                      ? "text-emerald-500 bg-emerald-500/10 font-bold"
                      : "text-content-secondary hover:text-content-primary hover:bg-[#F8F9FA]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 shrink-0">
                    <Icon
                      size={20}
                      className={isActive ? "text-emerald-500" : "text-[#8E94A0]"}
                    />
                    <span
                      className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${
                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`w-2 h-2 rounded-full bg-emerald-500 shrink-0 transition-opacity ${
                        isHovered ? "opacity-100" : "opacity-0 lg:opacity-100"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Green Security Card (Visible in expanded state / desktop) */}
        {showSecurityCard && (
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isHovered ? "opacity-100 max-h-96 mt-6" : "opacity-0 max-h-0 lg:opacity-100 lg:max-h-96 lg:mt-6"
            }`}
          >
            <div className="relative p-5 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white overflow-hidden shadow-lg shadow-feedback-success/30 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/90 text-emerald-500 flex items-center justify-center mb-3 shadow-inner">
                <Lock size={20} className="fill-feedback-success/30" />
              </div>
              <h4 className="font-extrabold text-base tracking-tight mb-1 text-white">
                Keep you safe!
              </h4>
              <p className="text-xs text-white/90 leading-tight mb-4 px-1">
                Update your security password, keep your account safe!
              </p>
              <button className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors backdrop-blur-sm">
                Update Privacy
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
