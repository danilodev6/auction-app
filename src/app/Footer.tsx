"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.3, ease: "easeOut", delay: 0.8 }}
      className="fixed flex place-items-center bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 sm:px-6 lg:px-9 h-auto min-h-[3.5rem] py-3 rounded-md shadow-lg z-40 max-w-[calc(100vw-2rem)]"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-6">
        <p className="text-sm sm:text-base whitespace-nowrap">
          tbsubastas@gmail.com
        </p>
        <p className="text-sm sm:text-base whitespace-nowrap">+3446 66 33 76</p>
        <div className="text-sm sm:text-base">
          <Link href="/terms" className="hover-nav-link whitespace-nowrap">
            Términos y condiciones
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}
