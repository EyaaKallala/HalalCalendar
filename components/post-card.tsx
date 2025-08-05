"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MarkdownRenderer from "./markdown-renderer";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string;
  date?: string;
  author: {
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  location?: string | null;
  tags?: string[];
}

export default function PostCard({
  post,
  showFullContent = false,
}: {
  post: Post;
  showFullContent?: boolean;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likeLoading, setLikeLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!session?.user?.id) {
        setLikeLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/posts/${post.id}/like-status`);
        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
        }
      } catch (error) {
        console.error("Failed to fetch like status:", error);
      } finally {
        setLikeLoading(false);
      }
    };
    fetchLikeStatus();
  }, [post.id, session?.user?.id]);

  const handleLike = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(prev => (data.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const confirmDelete = () => setShowConfirm(true);
  const cancelDelete = () => setShowConfirm(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
      else console.error("Failed to delete post");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const content = showFullContent
    ? post.content
    : post.content.length > 200
      ? post.content.slice(0, 200) + '...'
      : post.content;

  const isAdmin = session?.user?.role?.toLowerCase().trim() === "admin";

  return (
    <>
      <Card className=" hover:bg-[#FFEAEA]">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.author.image || ""} />
              <AvatarFallback>{post.author.name?.[0] || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {post.image && (
  <img src={post.image} alt="Post image" className="w-full h-64 object-cover rounded-xl" />
)}



          <CardTitle className="text-xl text-center w-full">
            {showFullContent ? (
              post.title
            ) : (
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            )}
          </CardTitle>

          {post.date && (
            <p className="text-sm text-muted-foreground flex items-center space-x-1 mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-11a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </p>
          )}
          {post.location && (
            <p className="text-sm text-muted-foreground flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21c-4-4-6-8-6-11a6 6 0 1112 0c0 3-2 7-6 11z"
                />
              </svg>
              <span>{post.location}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={content} />
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
            onClick={handleLike}
            disabled={!session}
          >
            <Heart
              className={`h-4 w-4 ${likeLoading
                ? 'animate-pulse'
                : liked
                  ? 'fill-red-500 text-red-500'
                  : ''
                }`}
            />
            <span>{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post._count.comments}</span>
          </Button>

          {isAdmin && (
            <>
              <Link href={`/admin/edit?id=${post.id}`}>
                <Button variant="outline" size="sm" className="ml-auto">
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                className="flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { handleDelete(); cancelDelete(); }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
