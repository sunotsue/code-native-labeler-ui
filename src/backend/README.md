# Backend Server (Node + Express + TypeScript)

This directory contains the backend API server implementation.

## Structure

```
backend/
├── src/
│   ├── server.ts          # Express server setup
│   ├── routes/
│   │   ├── tasks.ts       # GET /api/task/:id
│   │   ├── tests.ts       # POST /api/run-tests
│   │   └── labels.ts      # POST /api/label
│   ├── services/
│   │   ├── gitService.ts  # Git operations (stub for now)
│   │   ├── testRunner.ts  # Test execution (stub for now)
│   │   └── storage.ts     # Label storage (stub for now)
│   ├── data/
│   │   └── mockTasks.ts   # In-memory task data
│   └── types/
│       └── models.ts      # Shared types (copy from frontend)
├── package.json
└── tsconfig.json
```

## Setup (for production deployment)

```bash
cd backend
npm install
npm run dev
```

## Running

The server will start on `http://localhost:3001` by default.

## Endpoints

### GET /api/task/:id
Returns a task by ID.

**Response:**
```json
{
  "id": "demo-task",
  "capability_bucket": "minimal_patches",
  "tags": ["bug-fix"],
  "repo": { ... },
  "files": [ ... ],
  "tests": [ ... ],
  "candidates": [ ... ],
  "metrics_config": { ... }
}
```

### POST /api/run-tests
Runs tests for a specific candidate.

**Request:**
```json
{
  "taskId": "demo-task",
  "candidateId": "candidate-a"
}
```

**Response:**
```json
{
  "status": "passed",
  "passed": 23,
  "failed": 0,
  "log": "pytest output..."
}
```

### POST /api/label
Submits a preference label.

**Request:**
```json
{
  "rater_id": "rater-123",
  "preferred_candidate_id": "candidate-a",
  "scoresByCandidate": {
    "candidate-a": {
      "correctness": 5,
      "minimality": 4,
      "style": 5,
      "safety": 5
    }
  },
  "notes": "Optional notes"
}
```

**Response:** `200 OK`

## Plugging in Real Infrastructure

### Git Integration
Replace `gitService.ts` stub with real git operations:
- Use `nodegit` or `simple-git` npm packages
- Clone repos at specific commits
- Apply patches and read file contents

### Test Execution
Replace `testRunner.ts` stub with Docker-based execution:
- Use `dockerode` npm package
- Spin up containers with repo + candidate patch
- Run pytest/jest/etc. and capture output
- Parse test results and logs

### Storage
Replace `storage.ts` stub with database integration:
- PostgreSQL for labels and tasks
- S3/GCS for storing patches and logs
- Redis for caching test results

## Environment Variables

Create a `.env` file:
```
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GIT_CACHE_DIR=/tmp/git-cache
DOCKER_ENABLED=true
```
