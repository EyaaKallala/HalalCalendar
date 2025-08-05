"use client";

import { useSearchParams } from "next/navigation";

export function usePostId() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  return postId;
}
