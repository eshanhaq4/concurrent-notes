package com.notes.app.grpc;

import com.notes.app.grpc.NoteSummaryRequest;
import com.notes.app.grpc.NoteSummaryResponse;
import com.notes.app.grpc.NoteSummaryServiceGrpc;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Note: This is a mock implementation of an AI summary service.
 * We're just using this to demonstrate using gRPC.
 * 
 * In a real application, you'd replace the logic in the summarize
 * method with actual calls to an AI model (OpenAI, Gemini, etc)
 * to generate summaries based on the content of the note.
 */

// @GrpcService automatically exposes this class on port 9090 (default)
@GrpcService
public class MockNoteSummaryService extends NoteSummaryServiceGrpc.NoteSummaryServiceImplBase {

  @Override
  public void getNoteSummary(NoteSummaryRequest request, StreamObserver<NoteSummaryResponse> responseObserver) {
    System.out.println(
        "MockNoteSummaryService.java: Received getNoteSummary request for note content: " + request.getContent());

    // simulate heavy work load time
    try {
      Thread.sleep(ThreadLocalRandom.current().nextInt(2000, 5001)); // sleep for 2-5 seconds
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }

    // creating mock summary
    String mockSummary = "This note is about " + request.getContent().length()
        + " characters.";

    NoteSummaryResponse response = NoteSummaryResponse.newBuilder()
        .setSummary(mockSummary)
        .build();

    // send response back to the worker
    responseObserver.onNext(response);
    responseObserver.onCompleted();
  }
}