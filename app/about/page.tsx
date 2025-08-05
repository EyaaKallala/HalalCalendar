"use client";

import Image from "next/image";
import Link from "next/link";
import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN"; 

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm rounded-b-2xl">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <Image width={70} height={70} src="/nobg.png" alt="Logo" className="mx-auto md:mx-0" />

          <nav className="flex flex-row flex-wrap items-center space-x-4 text-sm font-medium text-[#748DAE] md:space-x-9 md:text-lg">
            <Link href="/" className="no-underline hover:underline">Home</Link>
            <Link href="/about" className="no-underline hover:underline   ">About</Link>
            <Link href="/#posts" className="no-underline hover:underline">Posts</Link>
          </nav>


<div className="flex flex-row items-center gap-3 bg-[]">
            {isAdmin && (
              <Button asChild className="w-full md:w-auto bg-[#748DAE] text-white hover:bg-[#748DAE]">
                <Link href="/admin/create" className="flex items-center justify-center">
                  New Post
                </Link>
              </Button>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <section
        className="relative min-h-screen pt-28 sm:pt-32 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/ny2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 flex items-center justify-center py-10 sm:py-20">
          <div className="text-center w-full max-w-2xl mx-auto bg-black/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>

            <div className="text-base sm:text-lg md:text-xl font-medium text-white/90 space-y-4 sm:space-y-6 px-0 sm:px-4">
              <p className="leading-relaxed">
                Welcome to our platform! We are dedicated to delivering high-quality content and an exceptional user experience.
              </p>
              <p className="leading-relaxed">
                Whether you're here to explore, learn, or connect, we're glad you've joined us on this journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
