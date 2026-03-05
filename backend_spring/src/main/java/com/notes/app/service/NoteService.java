package com.notes.app.service;

import com.notes.app.data.Note;
import com.notes.app.data.NoteRepository;
import com.notes.app.data.EventLog;
import com.notes.app.data.EventLogRepository;
import com.notes.app.data.EventStatus;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.notes.app.grpc.NoteSummaryEvent;

@Service
public class NoteService {
  private static final String NOTE_SUMMARY_EVENT_QUEUE = "note_summary_event_queue";

  private final NoteRepository noteRepository;
  private final RedisTemplate<String, byte[]> redis;
  private final EventLogRepository eventLogRepository;

  public NoteService(NoteRepository noteRepository, RedisTemplate<String, byte[]> redis, EventLogRepository eventLogRepository) {
    this.noteRepository = noteRepository;
    this.redis = redis;
    this.eventLogRepository = eventLogRepository;
  }

  public List<Note> getAllNotes() {
    return noteRepository.findAllByOrderByCreatedAtDesc();
  }

  public Optional<Note> getNoteById(Long noteId) {
    return noteRepository.findById(noteId);
  }

  public Note createNote(String content, String color) {
    // validate content and color
    Note note = noteRepository.save(new Note(content, color));

    String eventID = UUID.randomUUID().toString();
    String noteId = note.getId().toString();

    EventLog eLog = new EventLog(eventID, noteId, EventStatus.QUEUED);
    eventLogRepository.save(eLog);

    NoteSummaryEvent event = NoteSummaryEvent.newBuilder()
        .setEventId(eventID)
        .setNoteId(noteId)
        .setContent(content)
        .setTimestamp(System.currentTimeMillis())
        .build();

    redis.opsForList().rightPush(NOTE_SUMMARY_EVENT_QUEUE, event.toByteArray());
    System.out.println("NoteService.java: Queued summary job for note: " + note.getId());

    return note;
  }
  public Note updateNote(Long noteId, String content, String color) {
    Note note = noteRepository.findById(noteId).orElseThrow(() -> new RuntimeException("Note not found"));

    note.setContent(content);
    note.setColor(color);
    
    return noteRepository.save(note);
  }

  public Boolean deleteNote(Long noteId) {
    if (!noteRepository.existsById(noteId)) {
      return false;
    }
    noteRepository.deleteById(noteId);

    return true;
  }
}