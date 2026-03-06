"use client";

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

interface Summary {
  noteId: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  timestamp: number;
  summary?: string;
}

interface NoteSummary {
    onSummaryUpdate: (noteId: string, status: "PROCESSING" | "COMPLETED" | "FAILED", timestamp: number, summary?: string) => void;
}

export function NotesSocket({onSummaryUpdate}: NoteSummary) {
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8000/ws",
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/note-summaries", (message) => {
                    console.log("RAW SOCKET MESSAGE:", message.body);
                    try {
                    const data: Summary = JSON.parse(message.body);
                    const { noteId, status, timestamp, summary } = data;

                        console.log("Received message:", { noteId, status, timestamp, summary });
                        onSummaryUpdate(noteId, status, timestamp, summary);
                    } catch (error) {
                        console.error("Error parsing message:", error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [onSummaryUpdate]);

    return null;
}