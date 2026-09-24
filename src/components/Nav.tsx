"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Shared navigation */
const TABS = [
  { href: "/", label: "HOME" },
  { href: "/adventures", label: "ADVENTURES" },
  { href: "/creations", label: "CREATIONS" },
  { href: "/spells", label: "SPELLS" },
  { href: "/summons", label: "SUMMON" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="site-nav-wrap" style={{ display: "flex", justifyContent: "center", padding: "18px 16px 0", position: "sticky", top: 0, zIndex: 50 }}>
      <nav className="pill-nav" aria-label="Main navigation">
        <Link href="/" aria-label="Home" className="pill-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-star.webp" alt="" />
        </Link>
        <div className="pill-tabs" role="tablist">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pill-tab${pathname === tab.href ? " act" : ""}`}
              role="tab"
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="pill-icons">
          <a href="/Sarayu_Marri_Resume.pdf" target="_blank" rel="noopener" aria-label="Resume">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon-resume.webp" alt="" />
          </a>
          <a href="https://www.linkedin.com/in/sarayumarri/" target="_blank" rel="noopener" aria-label="LinkedIn">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon-linkedin.webp" alt="" />
          </a>
          <a href="https://github.com/sarayumarri" target="_blank" rel="noopener" aria-label="GitHub">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon-github.webp" alt="" />
          </a>
        </div>
      </nav>
    </div>
  );
}
