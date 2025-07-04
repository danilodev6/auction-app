"use client";

import { useState } from "react";
import Link from "next/link";

interface NavigationWrapperProps {
  userIsAdmin: boolean;
}

export function NavigationWrapper({ userIsAdmin }: NavigationWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Hamburger Button - show below 1278px (xl breakpoint) */}
      <button
        onClick={toggleMenu}
        className="xl:hidden flex flex-col justify-center items-center px-4 h-14 bg-primary text-white rounded-md shadow"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-1" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${
            isOpen ? "-rotate-45 -translate-y-1" : ""
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 z-[998] xl:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-64 max-w-[80vw] sm:max-w-[60vw] bg-primary text-white z-[999] transform transition-transform duration-300 xl:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={closeMenu}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ×
          </button>

          <nav className="mt-12 space-y-4">
            <Link
              href="/"
              className="block hover:text-accent px-3 py-2 text-lg"
              onClick={closeMenu}
            >
              Home
            </Link>

            <Link
              href="/live"
              className="block hover:text-accent px-3 py-2 text-lg"
              onClick={closeMenu}
            >
              Live
            </Link>

            {userIsAdmin && (
              <>
                <Link
                  href="/items/create"
                  className="block hover:text-accent px-3 py-2 text-lg"
                  onClick={closeMenu}
                >
                  Crear
                </Link>
                <Link
                  href="/items/manage"
                  className="block hover:text-accent px-3 py-2 text-lg"
                  onClick={closeMenu}
                >
                  Items
                </Link>
                <Link
                  href="/admin/users"
                  className="block hover:text-accent px-3 py-2 text-lg"
                  onClick={closeMenu}
                >
                  Users
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
