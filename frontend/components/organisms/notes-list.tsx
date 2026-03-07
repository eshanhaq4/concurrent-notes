'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { NoteCard } from "@/components/molecules/note-card";
import { EditPanel } from "@/components/organisms/edit-panel/edit-panel";
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

  const [summaries, setSummaries] = useState<Record<string, { status: "PROCESSING" | "COMPLETED" | "FAILED"; timestamp: number; summary?: string }>>({});
  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  useEffect(() => {
    fetchNotes().then(setNotes).catch((error) => {
      console.error("Failed to fetch notes:", error);
    });
  }, []);

  const handleSummaryUpdate = useCallback((noteId: string, status: "PROCESSING" | "COMPLETED" | "FAILED", timestamp: number, summary?: string) => {
    const normalizedNoteId = String(noteId);

    console.log("Handling summary update:", { noteId: normalizedNoteId, status, timestamp, summary });

    const noteExists = notes.some((note) => String(note.id) === normalizedNoteId);
    if (!noteExists) {
      fetchNotes().then((fetchedNotes) => {
        setNotes(fetchedNotes);
      }).catch((error) => {
        console.error("Failed to refetch notes:", error);
      });
    }

    setSummaries((prev) => {
      if (prev[normalizedNoteId] && prev[normalizedNoteId].timestamp > timestamp) {
        console.warn(`Received out-of-order summary update for note ${normalizedNoteId}. Ignoring.`);
        return prev;
      }

      if (status === "PROCESSING" && prev[normalizedNoteId]?.status === "COMPLETED") {
        console.warn(`Received PROCESSING status for note ${normalizedNoteId} which is already COMPLETED. Ignoring.`);
        return prev;
      }

      return {
        ...prev,
        [normalizedNoteId]: { status, timestamp, summary },
      };
    });
  }, []);

  if (notes.length === 0) {
    return (
      <>
        <NotesSocket onSummaryUpdate={handleSummaryUpdate} />
        <p className="text-center py-12 text-gray-600">
          No notes yet. Add your first note!
        </p>
      </>
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
                summary={summaries[String(note.id)]?.summary}
                status={summaries[String(note.id)]?.status}
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
