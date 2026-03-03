package com.notes.app.worker;

import java.time.Duration;

import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import net.devh.boot.grpc.client.inject.GrpcClient;

import com.notes.app.grpc.NoteSummaryRequest;
import com.notes.app.grpc.NoteSummaryResponse;
import com.notes.app.grpc.NoteSummaryServiceGrpc;

import com.notes.app.data.EventLog;
import com.notes.app.data.EventLogRepository;
import com.notes.app.data.EventStatus;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import com.notes.app.grpc.NoteSummaryEvent;

@Component
public class NoteSummaryWorker {
  private final RedisTemplate<String, byte[]> redis;
  private final SimpMessagingTemplate socket;

  @GrpcClient("note-summary-service")
  private NoteSummaryServiceGrpc.NoteSummaryServiceBlockingStub mockSummaryService;
  private final EventLogRepository eventLogRepository;

  public NoteSummaryWorker(RedisTemplate<String, byte[]> redis, SimpMessagingTemplate socket, EventLogRepository eventLogRepository) {
    this.redis = redis;
    this.socket = socket;
    this.eventLogRepository = eventLogRepository;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void startWorker() {
    new Thread(() -> {
      System.out
          .println("NoteSummaryWorker.java: Summary Worker started. Listening for note_summary_event_queue events");
      while (true) {
        try {
          byte[] eventBytes = redis.opsForList().leftPop("note_summary_event_queue", Duration.ofSeconds(30));

          if (eventBytes != null) {
            System.out.println("NoteSummaryWorker.java: Received event from Redis queue");
            generateSummary(eventBytes);
          }
          // if null, just loop and wait again
        } catch (Exception e) {
          if (e.getMessage() != null && e.getMessage().contains("timed out")) {
            // ignore timeout, just loop again
            continue;
          }
          System.err.println("Error processing event: " + e.getMessage());
          e.printStackTrace();
        }
      }
    }).start();
  }

  private void generateSummary(byte[] eventBytes) {    
    try {
      NoteSummaryEvent event = NoteSummaryEvent.parseFrom(eventBytes);

      String noteId = event.getNoteId();
      String content = event.getContent();  
      String eventId = event.getEventId();
      long timestamp = event.getTimestamp();

      EventLog eLog = eventLogRepository.findByEventId(eventId)
      .orElseThrow(() -> new RuntimeException("EventLog not found for eventId: " + eventId));
      
      eLog.setStatus(EventStatus.PROCESSING);
      eventLogRepository.save(eLog);
      System.out.println("EventLog status now: " + eLog.getStatus());

      NoteSummaryResponse response = mockSummaryService.getNoteSummary
      (NoteSummaryRequest.newBuilder().setContent(content).setNoteId(noteId).build());

      eLog.setStatus(EventStatus.COMPLETED);
      eLog.setSummary(response.getSummary());
      eventLogRepository.save(eLog);
      System.out.println("EventLog status now: " + eLog.getStatus());
      
      String destination = "/topic/note-summaries";
      String payload = noteId + "::" + response.getSummary();
      
      socket.convertAndSend(destination, payload);
     
      System.out.println("NoteSummaryWorker.java: Sent to WebSocket " + destination + ": " + payload);

    } catch (Exception e) {
      System.err.println("Failed to parse NoteSummaryEvent: " + e.getMessage());
      e.printStackTrace();
    }
    /**
     * Paste into localhost:8000 dev console to test WebSocket connection:
     * const script = document.createElement('script');
     * script.src =
     * 'https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js';
     * script.onload = () => {
     * const client = new StompJs.Client({
     * brokerURL: 'ws://localhost:8000/ws',
     * debug: (str) => console.log(str),
     * onConnect: () => {
     * console.log('Connected!');
     * client.subscribe('/topic/note-summaries',
     * (msg) => {
     * console.log('Received:', msg.body);
     * });
     * }
     * });
     * client.activate();
     * window.stompClient = client;
     * };
     * document.head.appendChild(script)
     */
  }
}
