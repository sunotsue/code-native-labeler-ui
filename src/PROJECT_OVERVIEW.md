# LLM Code Task Labeling System

A full-stack web application for human raters to evaluate and label LLM-generated code solutions. This system is specifically designed for code tasks involving repositories, patches, tests, and tool usage.

## 🎯 Purpose

Enable human raters to:
- Browse repository snapshots at specific commits
- Compare multiple candidate solutions side-by-side
- View unified diffs and tool usage traces
- Run tests and see CI-style logs
- Rate solutions on multiple rubric dimensions
- Submit structured preference labels

## 📁 Project Structure

```
/
├── types/
│   └── models.ts              # Shared TypeScript type definitions
├── api/
│   ├── mockData.ts            # Demo task data
│   └── mockApi.ts             # Frontend API client (mocks backend)
├── components/
│   ├── RepoTree.tsx           # File tree browser
│   ├── FileViewer.tsx         # Code file viewer
│   ├── DiffViewer.tsx         # Unified diff display
│   ├── CandidatePanel.tsx     # Candidate solution display
│   ├── ToolTraceView.tsx      # Tool call trace viewer
│   ├── TestRunner.tsx         # Test execution UI
│   └── RubricForm.tsx         # Rating form
├── App.tsx                    # Main application
├── backend/                   # Node + Express backend (reference)
│   ├── src/
│   │   ├── server.ts          # Express server
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic stubs
│   │   └── types/             # Type definitions
│   ├── package.json
│   └── README.md
└── PROJECT_OVERVIEW.md        # This file
```

## 🏗️ Architecture

### Frontend (React + TypeScript)

**Three-panel layout:**

1. **Left Panel - Repository Browser**
   - File tree with collapsible directories
   - Visual distinction for test files
   - Read-only indicators when tests can't be modified
   
2. **Center Panel - Candidates & Files**
   - Tabbed interface: Files view + one tab per candidate
   - Unified diff viewer with syntax highlighting
   - Collapsible tool trace showing LLM's tool usage
   - One-click test execution with CI-style logs
   - Violation warnings (file limits, line limits, test modifications)
   
3. **Right Panel - Task & Rubric**
   - Task description and metadata
   - Constraint configuration display
   - Rubric scoring form (0-5 sliders)
   - Preferred candidate selector
   - Notes textarea
   - Submit button

### Backend (Node + Express + TypeScript)

**API Endpoints:**

- `GET /api/task/:id` - Fetch task with all metadata
- `POST /api/run-tests` - Execute tests for a candidate
- `POST /api/label` - Submit preference label
- `GET /api/labels/:taskId` - Retrieve labels for analysis

**Services (currently stubbed):**

- `gitService` - Clone repos, apply patches, read files
- `testRunner` - Execute tests in Docker containers
- `storage` - Persist labels to database

## 📊 Data Model

### Core Types

```typescript
type CapabilityBucket =
  | "repo_comprehension"
  | "test_localization"
  | "minimal_patches"
  | "bug_root_cause"
  | "api_usage"
  | "refactoring"
  | "tdd"
  | "code_review"
  | "multi_file_coordination"
  | "tool_use";

interface Task {
  id: string;
  capability_bucket: CapabilityBucket;
  tags: string[];
  repo: RepoInfo;                  // Repository metadata
  files: FileContent[];            // Source files
  tests: FileContent[];            // Test files
  task_description: string;
  candidates: Candidate[];         // LLM solutions
  metrics_config: MetricsConfig;   // Constraints
}

interface Candidate {
  candidate_id: string;
  model_id: string;
  patch_diff?: string;             // Unified diff
  answer?: string;                 // For non-patch tasks
  tool_trace?: ToolCall[];         // Tool usage history
}

interface MetricsConfig {
  run_tests: boolean;
  allow_test_edits: boolean;
  max_changed_files: number;
  max_changed_lines: number;
}

interface PreferenceLabel {
  rater_id: string;
  preferred_candidate_id: string | "tie";
  scoresByCandidate: Record<string, RubricScores>;
  notes?: string;
}

interface RubricScores {
  correctness: number;    // 0-5
  minimality: number;     // 0-5
  style: number;          // 0-5
  safety: number;         // 0-5
  tool_use?: number;      // 0-5 (only for tool_use bucket)
}
```

## 🚀 Getting Started

### Frontend Only (Current Setup)

The frontend is a fully self-contained React app with mock data:

```bash
# No installation needed - runs in browser
# Open in your development environment
```

The app loads a demo task showcasing:
- 3 candidates solving a Python async timeout bug
- Different patch strategies (minimal vs. comprehensive)
- One candidate that modifies tests (policy violation)
- Tool traces showing LLM reasoning
- Test execution simulation

### Full Stack (Production Setup)

1. **Start the backend:**

```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:3001
```

2. **Update frontend to use real backend:**

In `/api/mockApi.ts`, replace mock implementations with real fetch calls:

```typescript
export const api = {
  async getTask(id: string): Promise<Task> {
    const response = await fetch(`http://localhost:3001/api/task/${id}`);
    return response.json();
  },
  
  async runTests(request: TestRunRequest): Promise<TestRunResult> {
    const response = await fetch('http://localhost:3001/api/run-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  },
  
  async submitLabel(label: PreferenceLabel): Promise<void> {
    await fetch('http://localhost:3001/api/label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(label)
    });
  }
};
```

## 🔌 Connecting Real Infrastructure

### Git Integration

Replace `/backend/src/services/gitService.ts` with real implementation:

```typescript
import simpleGit from 'simple-git';
import fs from 'fs-extra';

export class GitService {
  async cloneAtCommit(repoUrl: string, commitSha: string): Promise<string> {
    const repoPath = `/tmp/repos/${commitSha}`;
    
    if (!await fs.pathExists(repoPath)) {
      const git = simpleGit();
      await git.clone(repoUrl, repoPath);
      await simpleGit(repoPath).checkout(commitSha);
    }
    
    return repoPath;
  }
  
  async applyPatch(repoPath: string, patchDiff: string): Promise<void> {
    const git = simpleGit(repoPath);
    const patchFile = `${repoPath}/.patch`;
    await fs.writeFile(patchFile, patchDiff);
    await git.raw(['apply', patchFile]);
    await fs.remove(patchFile);
  }
}
```

### Test Execution with Docker

Replace `/backend/src/services/testRunner.ts`:

```typescript
import Docker from 'dockerode';

const docker = new Docker();

export async function runTestsForCandidate(
  taskId: string,
  candidateId: string
): Promise<TestRunResult> {
  // 1. Clone repo and apply patch
  const task = await getTask(taskId);
  const candidate = task.candidates.find(c => c.candidate_id === candidateId);
  const repoPath = await gitService.cloneAtCommit(task.repo.url, task.repo.commitSha);
  await gitService.applyPatch(repoPath, candidate.patch_diff);
  
  // 2. Run tests in Docker
  const container = await docker.createContainer({
    Image: 'python:3.11',
    Cmd: ['pytest', '--verbose'],
    HostConfig: { Binds: [`${repoPath}:/workspace`] },
    WorkingDir: '/workspace'
  });
  
  await container.start();
  const stream = await container.logs({ stdout: true, stderr: true, follow: true });
  
  let log = '';
  stream.on('data', chunk => { log += chunk.toString(); });
  
  await container.wait();
  await container.remove();
  
  // 3. Parse results
  const passed = (log.match(/PASSED/g) || []).length;
  const failed = (log.match(/FAILED/g) || []).length;
  
  return {
    status: failed > 0 ? 'failed' : 'passed',
    passed,
    failed,
    log
  };
}
```

### Database Storage

Replace `/backend/src/services/storage.ts` with PostgreSQL:

```typescript
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function saveLabel(label: PreferenceLabel): Promise<string> {
  const result = await pool.query(
    `INSERT INTO labels (rater_id, preferred_candidate_id, scores, notes, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id`,
    [
      label.rater_id,
      label.preferred_candidate_id,
      JSON.stringify(label.scoresByCandidate),
      label.notes
    ]
  );
  
  return result.rows[0].id;
}
```

## 🛡️ "No Cheating" Features

The system enforces constraints to ensure fair evaluation:

1. **Test Modification Detection**
   - Diffs are analyzed to detect changes in test files
   - Red warning displayed when `allow_test_edits=false`
   - UI marks test files as "READ-ONLY"

2. **Minimality Constraints**
   - Tracks files changed and lines changed per candidate
   - Warnings when exceeding `max_changed_files` or `max_changed_lines`
   - Visual badges on violating candidates

3. **Policy Banner**
   - Top-level warning when test edits are disallowed
   - Persistent reminder throughout labeling session

## 📋 Demo Task

The included demo task (`demo-task`) demonstrates:

**Scenario:** Python async timeout bug fix

**Candidates:**
- **Candidate A (GPT-4 Turbo):** Minimal fix, adds only timeout wrapper (PASSES)
- **Candidate B (Claude-3 Opus):** Comprehensive fix with explicit timeout error handling (PASSES)
- **Candidate C (GPT-4):** Over-engineered fix that modifies tests (FAILS + POLICY VIOLATION)

**Features Showcased:**
- Diff viewing with line-by-line comparison
- Tool traces (search_repo, read_file, run_tests)
- Test execution with pytest output
- Constraint violations (candidate C exceeds line limit and modifies tests)

## 🎨 UI Features

- **Syntax-highlighted diffs** - Color-coded additions/removals
- **Collapsible file tree** - Navigate large repos efficiently
- **CI-style test logs** - Terminal-like output with pass/fail summary
- **Real-time test execution** - Loader animation while tests run
- **Responsive scoring** - Live feedback on slider values
- **Validation** - Cannot submit without selecting preferred candidate

## 🔍 Key Implementation Details

### Diff Parsing

The `DiffViewer` component parses unified diffs:
- Lines starting with `+++`/`---` → file metadata (gray)
- Lines starting with `@@` → chunk headers (blue)
- Lines starting with `+` → additions (green)
- Lines starting with `-` → removals (red)
- Other lines → context (default)

### Patch Analysis

The `CandidatePanel` analyzes patches for violations:
```typescript
function analyzePatch(diff: string): {
  filesChanged: number;
  linesChanged: number;
  modifiesTests: boolean;
}
```

### Test Runner State Machine

```
[Idle] → [Running] → [Success/Failure]
         ↓
    Show loader
         ↓
    Display results
```

## 📝 Next Steps

To productionize this system:

1. **Authentication** - Add rater login and session management
2. **Task Queue** - Implement task assignment and progress tracking
3. **Analytics Dashboard** - Aggregate labels and compute metrics
4. **Real Git/Docker** - Replace stubs with actual infrastructure
5. **Database** - Set up PostgreSQL schema and migrations
6. **Monitoring** - Add logging, error tracking, metrics
7. **Scaling** - Containerize services, add load balancing

## 📚 Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript
- **Future:** Docker (test execution), PostgreSQL (storage), simple-git (repos)

## 💡 Design Decisions

1. **Three-panel layout** - Optimizes screen space for complex comparisons
2. **Tabbed candidates** - Easy switching without losing context
3. **Inline test execution** - No context switching to external tools
4. **Violation badges** - Immediate visual feedback on policy breaks
5. **Rubric-based scoring** - Structured feedback for model training
6. **Tool traces** - Transparency into LLM reasoning process

## 🤝 Contributing

When extending this system:
- Keep types in sync between frontend and backend
- Add validation at API boundaries
- Use stubs during development, swap for real implementations in production
- Test with diverse task types (not just bug fixes)
- Ensure responsive design for different screen sizes

---

Built for evaluating LLM coding capabilities across multiple dimensions: correctness, minimality, style, safety, and tool use.
