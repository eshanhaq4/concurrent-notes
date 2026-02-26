[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/CJaR7DvQ)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22890643&assignment_repo_type=AssignmentRepo)
# Notes Application

A full-stack notes application built with Next.js (frontend) and Spring Boot (backend), featuring GraphQL, gRPC, Redis event queuing, and WebSocket real-time updates.

## Features

- Create, read, update, and delete notes
- Color-coded notes with customizable colors
- Master-detail view with inline editing
- Real-time note summaries via async worker pipeline

## Project Structure

```
w1_basic_notes/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # Atomic Design components
│   └── ...
└── backend_spring/    # Spring Boot backend (GraphQL + gRPC)
    ├── src/main/java/com/notes/app/
    ├── src/main/proto/
    └── pom.xml
```

## Prerequisites

- Node.js (v18 or higher)
- Java 17 or higher
- Maven
- Docker (for Redis)

## Running the Full Stack

### 1. Start Redis

**Option A: Using Docker (recommended)**

First, install Docker Desktop: https://docs.docker.com/get-docker/

Then run Redis:

```bash
docker run -d --name redis -p 6379:6379 redis
```

To stop/start later:

```bash
docker stop redis
docker start redis
```

**Option B: Using Homebrew (macOS)**

```bash
brew install redis
brew services start redis
```

### 2. Start the Spring Boot Backend

```bash
cd backend_spring
mvn clean install
mvn spring-boot:run
```

The backend will be available at:

- GraphQL endpoint: http://localhost:8000/graphql
- GraphiQL Playground: http://localhost:8000
- H2 Database Console: http://localhost:8000/h2-console

#### GraphiQL Playground

Open http://localhost:8000 in your browser to get an interactive GraphQL IDE where you can write and test queries/mutations against the API.

#### H2 Database Console

Open http://localhost:8000/h2-console to inspect the database directly. Use these connection settings:

| Setting     | Value                      |
|-------------|----------------------------|
| JDBC URL    | `jdbc:h2:file:./data/notesdb` |
| User Name   | `sa`                       |
| Password    | *(leave blank)*            |

Once connected, you can run SQL queries to view tables and data (e.g., `SELECT * FROM NOTES`).

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## Building gRPC/Protobuf

The Spring Boot backend uses gRPC for service communication. Proto files are located in `backend_spring/src/main/proto/`.

To compile protos and generate Java stubs:

```bash
cd backend_spring
mvn clean compile
```

This generates Java classes in `target/generated-sources/protobuf/`. If your IDE doesn't recognize the imports, reload the Maven project.

## GraphQL API

Endpoint: `POST /graphql`

**Queries:**

```graphql
query {
  notes {
    id
    content
    color
    updatedAt
  }
  note(noteId: "123") {
    id
    content
    color
    updatedAt
  }
}
```

**Mutations:**

```graphql
mutation {
  createNote(input: { content: "Hello", color: "#FCA5A5" }) {
    id
  }
}
```

## Testing WebSocket

The Spring Boot backend sends real-time note summary updates via WebSocket. To test:

1. **Start Redis and the Spring Boot server** (see above)

2. **Open http://localhost:8000/graphiql in your browser**

3. **Open the browser dev console (F12) and paste:**

   ```javascript
   const script = document.createElement("script");
   script.src =
     "https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js";
   script.onload = () => {
     const client = new StompJs.Client({
       brokerURL: "ws://localhost:8000/ws",
       debug: (str) => console.log(str),
       onConnect: () => {
         console.log("Connected!");
         client.subscribe("/topic/note-summaries", (msg) => {
           console.log("Received:", msg.body);
         });
       },
     });
     client.activate();
     window.stompClient = client;
   };
   document.head.appendChild(script);
   ```

4. **Create a note via GraphQL:**

   ```graphql
   mutation {
     createNote(input: { content: "Hello world!", color: "#FCA5A5" }) {
       id
     }
   }
   ```

5. **Watch the console** - you'll see the summary appear.

## Technology Stack

**Frontend:**

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

**Backend (Spring Boot):**

- Spring Boot 3.2
- Spring for GraphQL
- Spring Data JPA
- H2 Database
- Redis (for job queuing)
- WebSocket/STOMP (for real-time updates)
- gRPC (for service communication)
- Java 17+

## UI Design Citation

From https://dribbble.com/shots/14037848-Docket-note-Side-menu
