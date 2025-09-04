"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useSort(defaultSort = "newest") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSort = searchParams.get("sort") || defaultSort;
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    if (searchParams.get("sort") !== sort) {
      setSort(searchParams.get("sort") || defaultSort);
    }
  }, [searchParams, sort, defaultSort]);

  const updateSort = (newSort: string) => {
    setSort(newSort);

    const params = new URLSearchParams(window.location.search);
    params.set("sort", newSort);
    router.push(`/?${params.toString()}`);
  };

  return { sort, updateSort };
}
