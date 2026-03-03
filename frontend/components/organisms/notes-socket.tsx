"use client";

import { use, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

export function NotesSocket() {
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/note-summaries", (message) => {
                    const [noteId, summary] = message.body.split("::");
                    console.log(`Received summary for note ${noteId}: ${summary}`);
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
    }, []);

    return null;
}