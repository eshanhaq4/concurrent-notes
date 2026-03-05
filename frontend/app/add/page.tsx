"use client";

import { useRouter } from "next/navigation";
import { NoteForm } from "@/components/organisms/note-form";
import { Header } from "@/components/organisms/header";
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/graphql";

type Status = "idle" | "submitting" | "success" | "error";

export default function AddNotePage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = async (note: { content: string; color: string }) => {
    console.log("status:", status);
    if (status === "submitting" || status === "success") return;

    setStatus("submitting");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateNote($content: String!, $color: String) {
              createNote(input: {content: $content, color: $color}) {
                id
                content
                color
                updatedAt
              }
            }
          `,
          variables: {
            content: note.content,
            color: note.color,
          },
        }),
      });

      if (response.ok) {
        setStatus("success");
        setError(null);

        router.push("/");
      }
    } catch (error) {
      setStatus("error");
      setError("Error: Failed to add note.");
    }
  };

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto bg-gray-50">
      <Header
        title="Add New Note"
        subtitle="Create a new note with your thoughts and ideas"
        showBackButton
        backHref="/"
      />

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <NoteForm onSubmit={handleAddNote} />
      </section>
    </main>
  );
}
