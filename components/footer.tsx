"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="bg-gradient-to-r from-[#9ECAD6] via-[#FFEAEA] to-[#748DAE] rounded-lg shadow-sm p-6 text-white"
    >
      <div className="w-full max-w-screen-lg mx-auto p-3 md:py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <Image
              src="/nobg.png"
              alt="HalalCalendar Logo"
              width={128}   
              height={128}
              className="object-contain"
              priority 
            />
          </Link>
          <ul className="flex flex-wrap justify-center sm:justify-start items-center mb-6 text-sm font-medium text-black dark:text-gray-400 space-x-4">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <span className="block text-sm text-black text-center dark:text-gray-400">
          © {new Date().getFullYear()} HalalCalendar. All rights reserved.
        </span>
      </div>
    </motion.footer>
  );
}
