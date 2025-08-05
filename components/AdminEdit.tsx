
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import MarkdownRenderer from "@/components/markdown-renderer";
import Link from "next/link";
import { ArrowLeft, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePostId } from "@/app/admin/edit/usePostId";

const AdminEdit: React.FC = () => {
  const postId = usePostId();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState(location);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const isAdmin = session?.user?.role?.toLowerCase().trim() === "admin";

  useEffect(() => {
    if (!postId) return;
    (async () => {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setPublished(data.published);
        setImageUrl(data.image || null);
        setDate(data.date ? new Date(data.date) : undefined);
        setLocation(data.location || "");
        setLocationQuery(data.location);
        setTags(data.tags || []);
      }
      setPostLoading(false);
    })();
  }, [postId]);

  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3) {
      setLocationResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`,
        {
          signal: controller.signal,
        }
      )
        .then((res) => res.json())
        .then((data) => setLocationResults(data))
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locationQuery]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!postId || !isAdmin) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("published", String(published));
      formData.append("date", date?.toISOString() ?? "");
      formData.append("location", location);
      formData.append("tags", JSON.stringify(tags));
      if (imageUrl) formData.append("image", imageUrl);

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        router.push("/");
      } else {
        console.error("Update failed:", await res.text());
      }
    } catch (err) {
      console.error("Error updating post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || postLoading) {
    return <div className="min-h-screen bg-background">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <p className="text-red-600">Admins only.</p>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <Image
                width={120}
                height={120}
                src="/nobg.png"
                alt="Logo"
                className="mx-auto md:mx-0 mt-4"
              />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 text-[#748DAE]">
        <div className="max-w-4xl mx-auto">
          <div className=" justify-between mb-8 text-right">
            <h1 className="text-3xl font-bold text-left">Edit Post</h1>
            <button
  type="button"
  onClick={() => setPreview(!preview)}
  className="text-[#748DAE] hover:text-white border border-[#748DAE] hover:bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200"
>
  {preview ? "Edit" : "Preview"}
</button>
          </div>

          <div className={`grid grid-cols-1 ${preview ? "lg:grid-cols-2 gap-8" : ""}`}>
            <Card>
              <CardHeader>
                <CardTitle>Update Post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-picker">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          className="w-32 justify-between font-normal"
                        >
                          {date ? date.toLocaleDateString() : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          onSelect={(d) => {
                            setDate(d);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={20}
                      required
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                      }}
                      placeholder="e.g. Paris, France"
                      autoComplete="off"
                    />

                    {locationResults.length > 0 && (
                      <ul className="absolute z-10 bg-white border rounded w-full shadow">
                        {locationResults
                          .filter(
                            (place, index, self) =>
                              index ===
                              self.findIndex(
                                (p) => p.display_name === place.display_name
                              )
                          )
                          .map((place) => (
                            <li
                              key={place.place_id}
                              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                              onMouseDown={() => {
                                setLocation(place.display_name);
                                setLocationQuery(place.display_name);
                                setLocationResults([]);
                              }}
                            >
                              {place.display_name}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Image</Label>
                    <CldUploadWidget
                      uploadPreset="stage-projet"
                      onSuccess={(result: CloudinaryUploadWidgetResults) => {
                        const info = result.info;
                        if (typeof info === "object" && info?.secure_url) {
                          setImageUrl(info.secure_url);
                        }
                      }}
                    >
                      {({ open }) => (
                        <button
  type="button"
  onClick={() => open()}
  className="text-white bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-200"
>
  {imageUrl ? "Change Image" : "Upload Image"}
</button>
                      )}
                    </CldUploadWidget>

                    {imageUrl && (
                      <div className="mt-2 w-full h-40 relative">
                        <Image
                          src={imageUrl}
                          alt="Current image"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Enter tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tagInput.trim()) {
                            e.preventDefault();
                            if (!tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                            }
                            setTagInput("");
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setTags(tags.filter((t) => t !== tag))
                            }
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={published}
                      onCheckedChange={setPublished}
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>

                  <button
  type="submit"
  disabled={loading}
  className="w-full text-white bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
>
  {loading ? "Updating..." : "Update Post"}
</button>
                </form>
              </CardContent>
            </Card>

            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-2xl font-bold">{title}</h2>

                  {location && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Location:</strong> {location}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-sm px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <MarkdownRenderer content={content} />
                  </div>

                  {imageUrl && (
                    <div className="mt-4 w-full h-60 relative">
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEdit;
