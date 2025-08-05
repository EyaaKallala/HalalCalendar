"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/markdown-renderer";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CldUploadWidget } from 'next-cloudinary';
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';
type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function CreatePostPage() {
  const router = useRouter();
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("published", String(published));
      formData.append("date", date?.toISOString() ?? "");
      formData.append("location", selectedLocation || location);
      formData.append("tags", tags.join(","));


      if (imageUrl) {
        formData.append("image", imageUrl);
      }
      if (date) {
        formData.append("date", date.toISOString());
      }

      const response = await fetch("/api/posts", {

        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to create post", await response.text());
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (location.length > 2) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
          .then((res) => res.json())
          .then((data) => setSuggestions(data));
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [location]);


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
            <h1 className="text-3xl font-bold text-left">Create New Post</h1>
           <button
  type="button"
  onClick={() => setPreview(!preview)}
  className="flex items-center text-[#748DAE] hover:text-white border border-[#748DAE] hover:bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200"
>
  <Eye className="h-4 w-4 mr-2" />
  {preview ? "Edit" : "Preview"}
</button>
          </div>

          <div className={`grid grid-cols-1 ${preview && "lg:grid-cols-2 gap-8"}`}>
            <Card>
              <CardHeader>
                <CardTitle>Write Post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter post title..."
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
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
                    <Label htmlFor="content">Description</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your post in markdown..."
                      rows={20}
                      required
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={selectedLocation || location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setSelectedLocation("");
                      }}
                      placeholder="Type a city or place"
                      autoComplete="off"
                    />

                    {suggestions.length > 0 && !selectedLocation && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                        {suggestions.map((s) => (
                          <li
                            key={s.place_id}
                            onClick={() => {
                              setSelectedLocation(s.display_name);
                              setSuggestions([]);
                            }}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                          >
                            {s.display_name}
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

                        if (info && typeof info !== "string" && info.secure_url) {
                          setImageUrl(info.secure_url);
                        }
                      }}

                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="text-white bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                        >
                          {imageUrl ? "Change Image" : "Upload an Image"}
                        </button>
                      )}
                    </CldUploadWidget>

                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="mt-2 max-h-40 object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="text-white bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <div key={i} className="flex items-center bg-gray-200 px-2 py-1 rounded-full">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-sm text-red-500"
                          >
                            ×
                          </button>
                        </div>
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
  className={`w-full text-white bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all ${
    loading ? "opacity-75 cursor-not-allowed" : ""
  }`}
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Creating...
    </span>
  ) : (
    "Create Post"
  )}
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
                  <h2 className="text-2xl font-bold">{title || "Post Title"}</h2>

                  <div className="mt-2 text-gray-600 text-sm">
                    {selectedLocation || location ? (
                      <p><strong>Location:</strong> {selectedLocation || location}</p>
                    ) : null}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
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
                    <MarkdownRenderer
                      content={content || "Your content will appear here..."}
                    />
                  </div>

                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="mt-4 max-h-60" />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
