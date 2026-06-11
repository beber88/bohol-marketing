"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#properties", label: "Properties" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <nav
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-2 py-2 gap-1 transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-black/30" : ""
        }`}
      >
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full p-[2px] bg-gradient-to-r from-[#89AACC] to-[#4E85BF] shrink-0">
          <span className="w-full h-full rounded-full overflow-hidden bg-bg flex items-center justify-center">
            <Image src="/images/brand/logo.webp" alt="Blue Everest" width={40} height={40} className="object-cover w-full h-full" />
          </span>
        </Link>

        <ul className="hidden md:flex items-center list-none m-0 p-0 gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}
                className="text-text-primary/70 text-sm font-medium no-underline px-4 py-2 rounded-full hover:text-text-primary hover:bg-white/5 transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact"
          className="ml-1 text-sm font-medium no-underline px-5 py-2 rounded-full bg-white/10 text-text-primary hover:bg-gradient-to-r hover:from-[#89AACC] hover:to-[#4E85BF] hover:text-white transition-all duration-300">
          Get in Touch
        </a>
      </nav>
    </header>
  );
}
