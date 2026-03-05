"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { NoteForm } from "@/components/organisms/note-form";
import { Button } from "@/components/atoms/button";
import { IconButton } from "@/components/atoms/icon-button";
import { Note } from "@/types/note";

interface EditPanelProps {
  initialNote: Note;
}

const API_URL = "http://127.0.0.1:8000/graphql";

export function EditPanel({ initialNote }: EditPanelProps) {
  const router = useRouter();

  const handleUpdate = async (updatedNote: {
    content: string;
    color: string;
  }) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation UpdateNote($noteId: ID!, $input: NoteInput!) {
            updateNote(noteId: $noteId, input: $input) {
              id
              content
              color
              updatedAt
            }
          }
        `,
        variables: {
          noteId: initialNote.id,
          input: {
            content: updatedNote.content,
            color: updatedNote.color,
          }
        },
      }),
    });

    if (response.ok) {
      router.push("/");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation DeleteNote($noteId: ID!) {
            deleteNote(noteId: $noteId)
          }
        `,
        variables: { noteId: initialNote.id },
      }),
    });


    if (response.ok) {
      router.refresh();
      router.push("/");
    }
  };

  return (
    <aside className="w-96 sticky top-0 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Edit Note</h2>
        <Link href="/" scroll={false}>
          <IconButton ariaLabel="Close editor">✕</IconButton>
        </Link>
      </div>
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <NoteForm
          onSubmit={handleUpdate}
          initialContent={initialNote.content}
          initialColor={initialNote.color}
        />

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button onClick={handleDelete} variant="danger">
            Delete Note
          </Button>
        </div>
      </section>
    </aside>
  );
}
