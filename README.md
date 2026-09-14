# Concurrent Notes

A full-stack notes application designed around asynchronous processing and real-time updates. Users can create, edit, and delete notes while background summary jobs are queued and processed independently.

## Features

- Create, edit, delete, and view notes
- Customize note colors
- Process note summaries asynchronously through a Redis-backed queue
- Track background jobs through `QUEUED`, `PROCESSING`, `COMPLETED`, and `FAILED` states
- Communicate between the worker and summary service using gRPC and Protocol Buffers
- Push processing updates to the frontend in real time with WebSockets and STOMP
- Prevent stale summary results from overwriting newer edits using timestamp-based ordering
- Persist notes and event state with Spring Data JPA and H2

## Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS  
**Backend:** Java, Spring Boot, GraphQL  
**Async & Real-Time:** Redis, gRPC, Protocol Buffers, WebSockets, STOMP  
**Database:** H2

## Architecture

The application separates interactive note operations from background summary processing.

The Next.js frontend communicates with the Spring Boot backend through GraphQL for note queries and mutations. When a note is created or edited, the backend creates an event record and places a serialized summary job onto a Redis queue.

A background worker consumes those events, updates their processing state, and calls a gRPC summary service. Processing and completion events are then published to the frontend through WebSockets so that users can see updates without refreshing the page.

Because multiple edits to the same note can finish out of order, the frontend compares event timestamps and ignores stale updates rather than allowing an older result to replace a newer one.

Additional design decisions and concurrency considerations are documented in [`rfc.md`](rfc.md).

## Running Locally

### Prerequisites

- Node.js
- Java 17+
- Maven
- Redis

### Start Redis

Using Docker:

```bash
docker run -d --name redis -p 6379:6379 redis
```

### Backend

```bash
cd backend_spring
mvn clean install
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8000
```

GraphQL is available at:

```text
http://localhost:8000/graphql
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```
