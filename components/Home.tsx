"use client";

import AuthButton from "@/components/auth-button";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { useSort } from "./useSort";


interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

const Home: React.FC = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { sort, updateSort } = useSort("newest");

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = `/api/posts?page=${page}&search=${encodeURIComponent(
          searchTerm
        )}&sort=${sort}`;
        const response = await fetch(url);
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchTerm, sort]);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm rounded-b-2xl">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <Image
            width={70}
            height={70}
            src="/nobg.png"
            alt="Logo"
            className="mx-auto md:mx-0"
          />

          <nav className="flex flex-row flex-wrap items-center space-x-4 text-sm font-medium text-[#748DAE] md:space-x-9 md:text-lg">
            <Link href="/" className="no-underline hover:underline">
              Home
            </Link>
            <Link href="/about" className="no-underline hover:underline">
              About
            </Link>
            <Link href="/#posts" className="no-underline hover:underline">
              Posts
            </Link>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-3">
            {isAdmin && (
              <Button
                asChild
                className="w-full md:w-auto bg-[#748DAE] text-white hover:bg-[#748DAE]"
              >
                <Link
                  href="/admin/create"
                  className="flex items-center justify-center"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <section className="relative h-[38rem] md:h-[42rem] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-gradient-to-l from-[#E8A5A5] via-[#D48A8A] to-[#C67171] animate-pulse [animation-duration:8s] [animation-timing-function:ease-in-out] z-0 rounded-b-4xl"></div>
        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between w-full h-full px-6 md:px-16 lg:px-24">
          <div className="text-center md:text-left md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              HalalCalendar
            </h1>
            <p className="text-white text-base md:text-lg">
              Discover Muslim events in NYC – prayers, markets, lectures &
              festivals – all in one place.
            </p>
            <div className="relative max-w-lg mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#B87D7D] to-[#8A4F4F] rounded-lg opacity-20 blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full py-3 pl-10 pr-4 text-gray-700 bg-transparent focus:outline-none rounded-lg"
                    placeholder="Search posts by title or tags (e.g., 'event', 'prayer')"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 w-full flex justify-center md:justify-end">
            <Image
              src="/event.png"
              alt="Event"
              className="h-72 md:h-[30rem] object-contain z-10"
              style={{
                animation: "moveHorizontally 5s ease-in-out infinite",
              }}
              width={400}
              height={300}
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8" id="posts">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-center text-4xl font-display md:font-serif">
            Our posts
          </h1>
          <div>
            <div className="mb-4 text-right">
              <label
                htmlFor="sort"
                className="mr-2 text-sm font-medium"
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => updateSort(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="eventSoon">Soonest Events</option>
                <option value="eventLate">Latest Events</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No posts yet. {isAdmin && "Create your first post!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
};

export default Home;
