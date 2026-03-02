package com.notes.app.data;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {
    List<EventLog> findByNoteIdOrderByCreatedAtAsc(String noteId);
}