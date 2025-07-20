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
        className="xl:hidden flex flex-col justify-center items-center px-4 h-14 bg-primary text-white rounded-md shadow z-50"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-75 max-w-[100vw] bg-primary text-white z-50 transform transition-transform duration-300 xl:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <button
            onClick={closeMenu}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>

          <nav className="mt-12 space-y-4">
            <Link
              href="/"
              className="block hover:text-accent px-3 py-2 text-lg transition-colors"
              onClick={closeMenu}
            >
              Home
            </Link>

            <Link
              href="/live"
              className="block hover:text-accent px-3 py-2 text-lg transition-colors"
              onClick={closeMenu}
            >
              Vivo
            </Link>

            {userIsAdmin && (
              <>
                <Link
                  href="/items/create"
                  className="block hover:text-accent px-3 py-2 text-lg transition-colors"
                  onClick={closeMenu}
                >
                  Crear
                </Link>
                <Link
                  href="/items/manage"
                  className="block hover:text-accent px-3 py-2 text-lg transition-colors"
                  onClick={closeMenu}
                >
                  Items
                </Link>
                <Link
                  href="/admin/users"
                  className="block hover:text-accent px-3 py-2 text-lg transition-colors"
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
