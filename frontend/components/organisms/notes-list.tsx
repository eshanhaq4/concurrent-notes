'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { NoteCard } from "@/components/molecules/note-card";
import { EditPanel } from "@/components/organisms/edit-panel/edit-panel";
import { AsyncEditPanel } from "@/components/organisms/edit-panel/async-edit-panel";
import { EditPanelSkeleton } from "@/components/organisms/edit-panel/edit-panel-skeleton";
import { Note } from "@/types/note";
import { NotesSocket } from "@/components/organisms/notes-socket";

const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query {
          notes {
            id
            content
            color
            updatedAt
          }
        }
      `,
    }),
  });
  // db.getNotes() simulation
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  const result = await response.json();
  console.log("result:", result);
  return result.data.notes;
}

interface NotesListProps {
  selectedNoteId?: string;
}

export function NotesList({ selectedNoteId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);

  const [summaries, setSummaries] = useState<{ [key: string]: { status: string; timestamp: number; summary: string } }>({});
  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  useEffect(() => {
    fetchNotes().then(setNotes).catch((error) => {
      console.error("Failed to fetch notes:", error);
    });
  }, [selectedNoteId]);

  function handleSummaryUpdate(noteId: string, status: string, timestamp: number, summary: string) {
    console.log("Handling summary update:", {noteId, status, timestamp, summary});
    setSummaries((prev) => {
      if (prev[noteId] && prev[noteId].timestamp > timestamp) {
        console.warn(`Received out-of-order summary update for note ${noteId}. Ignoring.`);
        return prev;
      }
        return {
        ...prev,
        [noteId]: { status, timestamp, summary },
      };
    });
  }

  if (notes.length === 0) {
    return (
      <p className="text-center py-12 text-gray-600">
        No notes yet. Add your first note!
      </p>
    );
  }

  return (
    <div className="flex gap-6">
      <NotesSocket onSummaryUpdate={handleSummaryUpdate} />
      <ul className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-max list-none flex-1">
        {notes.map((note) => (
          <li key={note.id}>
            <Link href={`/?noteId=${note.id}`} scroll={false}>
              <NoteCard
                content={note.content}
                color={note.color}
                date={note.updatedAt}
                summary={summaries[note.id]?.summary}
                status={summaries[note.id]?.status}
              />
            </Link>
          </li>
        ))}
      </ul>

      {selectedNote && (
          <EditPanel initialNote={selectedNote} />
      )}
    </div>
  );
}
