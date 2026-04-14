# Multiplayer Tic-Tac-Toe with Nakama

Production-grade multiplayer Tic-Tac-Toe built using **Nakama authoritative matches**, **React frontend**, and **CockroachDB persistence**.

This project uses a **server-authoritative architecture**, where all gameplay decisions are enforced by Nakama backend logic.

---

# Architecture Overview

## Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- Zustand
- Nakama JS Client

## Backend

- Nakama authoritative runtime
- Go 1.22
- Authoritative match handler
- RPC endpoints

## Database

- CockroachDB

## Deployment

- Docker
- Docker Compose
- NGINX reverse proxy

---

# Core System Design

## Server Authoritative Model

All gameplay rules live on the server.

The client never decides:

- move validity
- turn ownership
- winner detection
- timeout enforcement

The backend validates every move before state mutation.

---

# Gameplay Features

## Core Gameplay

- 3x3 board
- turn-based moves
- winner detection
- draw detection

## Timer Mode

Each turn has a 30-second deadline.

If deadline expires:

- active player forfeits
- opponent wins automatically

Timeout is enforced entirely server-side.

---

# Matchmaking Modes

## Automatic Matchmaking

Uses Nakama matchmaker:

```ts
socket.addMatchmaker('*', 2, 2)
````

## Custom Rooms

Players can:

* create room
* receive match ID
* join existing room

---

# Leaderboard System

## Ranking Source

Nakama leaderboard:

```text
global_wins
```

Tracks:

* total wins

## Player Stats Storage

Nakama storage objects:

```text
player_stats / stats
```

Tracks:

* wins
* losses
* streak

---

# Project Structure

```text
tic-tac-toe-nakama/
├── frontend/
├── nakama/
└── deploy/
```

---

# Frontend Structure

```text
frontend/src/
├── components/
├── features/
├── hooks/
├── services/
├── store/
└── types/
```

---

# Backend Structure

```text
nakama/modules/
├── core/
├── match/
└── rpc/
```

---

# Match Lifecycle

## MatchInit

Creates isolated authoritative match state.

## MatchJoinAttempt

Rejects third player.

## MatchJoin

Assigns:

* Player X
* Player O

## MatchLoop

Processes:

* move validation
* timeout check
* winner detection
* broadcast authoritative state

## MatchTerminate

Graceful shutdown.

---

# Realtime Protocol

## Opcode

```text
1 = move
```

## Client Payload

```json
{
  "index": 4
}
```

## Server Broadcast

```json
{
  "board": ["X","","O",...],
  "current_turn": "X",
  "winner": "",
  "match_id": "..."
}
```

---

# Local Development

## Start Full Stack

```bash
docker compose -f deploy/docker-compose.yml up --build
```

---

# Frontend

```text
http://localhost:5173
```

---

# Nakama

```text
http://localhost:7350
```

---

# CockroachDB Admin

```text
http://localhost:8080
```

---

# Frontend Local Dev (optional standalone)

```bash
cd frontend
pnpm install
pnpm dev
```

---

# Backend Local Tests

```bash
cd nakama
go test ./...
```

---

# Docker Services

## Local Compose

* frontend
* nakama
* cockroachdb

## Production Compose

Adds:

* nginx reverse proxy

---

# Production Deployment

## Cloud Compatible

Works on:

* AWS ECS
* GCP Cloud Run
* Azure Container Apps
* Kubernetes

---

# Scaling Notes

## Concurrent Matches

Each Nakama match owns isolated state.

No shared memory exists across matches.

## Horizontal Scaling

Nakama instances can scale independently behind load balancer.

---

# Security Notes

## Cheat Prevention

All moves validated server-side.

## Stats Integrity

Client cannot mutate leaderboard or storage records.

---

# Future Extensions

## Easy Additions

* spectator mode
* ranked matchmaking
* rematch flow
* tournaments
* websocket compression

---

# Engineering Notes

This project intentionally keeps frontend thin.

Reason:

Authoritative multiplayer systems must push gameplay logic entirely to backend.

---

# Submission Notes

Includes:

* full source code
* tests
* Docker deployment
* production architecture

```