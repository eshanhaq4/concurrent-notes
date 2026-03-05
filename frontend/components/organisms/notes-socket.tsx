"use client";

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

interface NoteSummary {
    onSummaryUpdate: (noteId: string, status: string, timestamp: number, summary: string) => void;
}

export function NotesSocket({onSummaryUpdate}: NoteSummary) {
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8000/ws",
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/note-summaries", (message) => {
                    console.log("RAW SOCKET MESSAGE:", message.body);
                    const parts = message.body.split("::");
                    const [noteId, status, timestamp, summary] = parts;
                    console.log("Received message:", {noteId, status, timestamp, summary});
                    onSummaryUpdate(noteId, status, Number(timestamp), summary);
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