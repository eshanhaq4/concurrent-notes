package com.notes.app.graphql;

import com.notes.app.data.Note;
import com.notes.app.service.NoteService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @QueryMapping
    public List<Note> notes() {
        return noteService.getAllNotes();
    }

    @QueryMapping
    public Note note(@Argument Long noteId) {
        return noteService.getNoteById(noteId).orElse(null);
    }

    @MutationMapping
    public Note createNote(@Argument NoteInput input) {
        return noteService.createNote(input.getContent(), input.getColor() != null ? input.getColor() : "#FCA5A5");
    }
    @MutationMapping
    public Note updateNote(@Argument Long noteId, @Argument NoteInput input) {
        return noteService.updateNote(noteId, input.getContent(), input.getColor());
    }
    @MutationMapping
    public Boolean deleteNote(@Argument Long noteId) {
        return noteService.deleteNote(noteId);
    }
}
