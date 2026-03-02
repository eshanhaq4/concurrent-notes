package com.notes.app.data;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "event_log")
public class EventLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String eventId;
    private String noteId;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @Column(length = 1000)
    private String summary;
    private Instant createdAt;
    private Instant updatedAt;

    public EventLog() {}

    public EventLog(String eventId, String noteId, EventStatus status) {
        this.eventId = eventId;
        this.noteId = noteId;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getEventId() {
        return eventId;
    }

    public String getNoteId() {
        return noteId;
    }

    public EventStatus getStatus() {
        return status;
    }

    public String getSummary() {
        return summary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}