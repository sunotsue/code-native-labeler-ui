# 🏷️ LLM Code Task Labeling System

A professional-grade web application for human evaluation of LLM-generated code solutions. Purpose-built for code repositories, patches, tests, and tool usage analysis.

![Status](https://img.shields.io/badge/status-ready-green)
![Frontend](https://img.shields.io/badge/frontend-React%2BTS-blue)
![Backend](https://img.shields.io/badge/backend-Node%2BExpress-green)

## ✨ Features

### 🔍 Repository Browser
- **File tree navigation** with collapsible directories
- **Visual distinction** for test files vs source files
- **Read-only indicators** when test modification is disallowed
- **One-click file viewing** with syntax highlighting

### 📊 Candidate Comparison
- **Side-by-side diff viewer** with unified diff format
- **Syntax-highlighted** additions (green) and removals (red)
- **Tool trace display** showing LLM reasoning steps
- **Violation warnings** for constraint breaches
- **Tabbed interface** for easy candidate switching

### 🧪 Test Execution
- **One-click test runs** with simulated Docker execution
- **CI-style logs** matching pytest/jest output
- **Pass/fail summary** with detailed stack traces
- **Real-time execution** with loading states

### 📝 Rubric-Based Rating
- **Multi-dimensional scoring** (correctness, minimality, style, safety, tool use)
- **0-5 slider scales** with descriptive labels
- **Preferred candidate selection** with tie option
- **Free-text notes** for qualitative feedback
- **Validation** ensuring complete submissions

### 🛡️ Policy Enforcement
- **No cheating detection** - flags test modifications when disallowed
- **Minimality constraints** - warns when file/line limits exceeded
- **Visual badges** for policy violations
- **Top-level banners** for important constraints

## 🎯 Quick Start

```bash
# Clone the repository (or open in your environment)

# Frontend is ready to use immediately!
# Open the app to see the demo task

# To run the backend (optional):
cd backend
npm install
npm run dev
```

See **[QUICKSTART.md](./QUICKSTART.md)** for detailed instructions.

## 📁 Project Structure

```
├── App.tsx                    # Main React application
├── components/                # React components
│   ├── RepoTree.tsx          # File browser
│   ├── FileViewer.tsx        # Code viewer
│   ├── DiffViewer.tsx        # Unified diff display
│   ├── CandidatePanel.tsx    # Solution comparison
│   ├── ToolTraceView.tsx     # Tool usage display
│   ├── TestRunner.tsx        # Test execution UI
│   └── RubricForm.tsx        # Rating interface
├── types/
│   └── models.ts             # TypeScript definitions
├── api/
│   ├── mockData.ts           # Demo task data
│   └── mockApi.ts            # API client (with mocks)
├── backend/                   # Node + Express server
│   ├── src/
│   │   ├── server.ts         # Express app
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── types/            # Shared types
│   └── package.json
├── PROJECT_OVERVIEW.md        # Architecture documentation
├── QUICKSTART.md              # Getting started guide
└── README.md                  # This file
```

## 🎮 Demo Task

The included demo showcases a **Python async timeout bug fix** with 3 candidates:

| Candidate | Approach | Result | Notes |
|-----------|----------|--------|-------|
| **A** (GPT-4 Turbo) | Minimal 2-line fix | ✅ Passes | Adds only `asyncio.wait_for()` |
| **B** (Claude-3 Opus) | Comprehensive solution | ✅ Passes | Adds timeout + error handling |
| **C** (GPT-4) | Over-engineered | ❌ Fails | Modifies tests ❌, exceeds line limit ⚠️ |

**Try it yourself:**
1. Compare the diffs across candidates
2. Examine tool traces to see LLM reasoning
3. Run tests and observe different outcomes
4. Notice policy violations on candidate C
5. Rate and submit your preference

## 🏗️ Architecture

### Data Flow

```
User Request
    ↓
Frontend (React)
    ↓
API Client (mockApi.ts)
    ↓
Backend (Express) ←→ Services
    ↓                     ↓
Database            Git + Docker
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS for styling
- Lucide icons

**Backend:**
- Node.js + Express + TypeScript
- Stubbed services (git, docker, database)

**Future Integration:**
- PostgreSQL for label storage
- Docker for test execution
- simple-git for repository operations
- Redis for caching

## 📊 Data Model

### Core Types

```typescript
interface Task {
  id: string;
  capability_bucket: CapabilityBucket;  // Type of coding task
  repo: RepoInfo;                       // Repository metadata
  files: FileContent[];                 // Source files
  tests: FileContent[];                 // Test files
  candidates: Candidate[];              // LLM solutions
  metrics_config: MetricsConfig;        // Constraints
}

interface Candidate {
  candidate_id: string;
  model_id: string;                     // e.g., "gpt-4-turbo"
  patch_diff?: string;                  // Unified diff
  tool_trace?: ToolCall[];              // Tool usage history
}

interface PreferenceLabel {
  rater_id: string;
  preferred_candidate_id: string | "tie";
  scoresByCandidate: Record<string, RubricScores>;
  notes?: string;
}
```

See **[types/models.ts](./types/models.ts)** for complete definitions.

## 🚀 Production Deployment

### Step 1: Set Up Database

```sql
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE labels (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) REFERENCES tasks(id),
  rater_id VARCHAR(255) NOT NULL,
  preferred_candidate_id VARCHAR(255) NOT NULL,
  scores JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_labels_task_id ON labels(task_id);
CREATE INDEX idx_labels_rater_id ON labels(rater_id);
```

### Step 2: Configure Services

```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit .env with your configuration:
# - DATABASE_URL
# - REDIS_URL
# - DOCKER settings
# - GitHub tokens (if needed)
```

### Step 3: Implement Real Services

Replace stubs in `/backend/src/services/`:

- **gitService.ts** - Use `simple-git` for repo operations
- **testRunner.ts** - Use `dockerode` for test execution
- **storage.ts** - Use `pg` for PostgreSQL integration

See **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** for implementation examples.

### Step 4: Deploy

```bash
# Build backend
cd backend
npm run build

# Start production server
NODE_ENV=production npm start

# Or use Docker
docker build -t code-labeling-backend .
docker run -p 3001:3001 --env-file .env code-labeling-backend
```

## 🔌 API Endpoints

### `GET /api/task/:id`
Fetch a task with all metadata, files, and candidates.

### `POST /api/run-tests`
Execute tests for a candidate in a Docker container.

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

### `POST /api/label`
Submit a preference label.

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
  "notes": "Minimal and correct"
}
```

## 🧪 Testing

```bash
# Frontend (manual testing)
# - Browse files
# - Compare diffs
# - Run tests
# - Submit labels

# Backend (curl tests)
cd backend

# Health check
curl http://localhost:3001/health

# Get task
curl http://localhost:3001/api/task/demo-task

# Run tests
curl -X POST http://localhost:3001/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{"taskId":"demo-task","candidateId":"candidate-a"}'

# Submit label
curl -X POST http://localhost:3001/api/label \
  -H "Content-Type: application/json" \
  -d '{
    "rater_id": "test-rater",
    "preferred_candidate_id": "candidate-a",
    "scoresByCandidate": {
      "candidate-a": {"correctness":5,"minimality":5,"style":4,"safety":5}
    }
  }'
```

## 📈 Capability Buckets

The system supports 10 capability dimensions:

- **repo_comprehension** - Understanding large codebases
- **test_localization** - Finding relevant tests
- **minimal_patches** - Making focused changes
- **bug_root_cause** - Identifying underlying issues
- **api_usage** - Correct library/API usage
- **refactoring** - Code quality improvements
- **tdd** - Test-driven development
- **code_review** - Reviewing others' code
- **multi_file_coordination** - Changes across files
- **tool_use** - Effective use of search/edit/run tools

## 🎯 Use Cases

This system is ideal for:

- **Model evaluation** - Compare LLM coding abilities
- **Training data collection** - Gather preference labels for RLHF
- **Capability analysis** - Measure performance on specific skills
- **Tool usage studies** - Understand LLM problem-solving strategies
- **Quality assurance** - Validate code generation quality

## 🤝 Contributing

To extend this system:

1. **Add new capability buckets** - Edit `CapabilityBucket` type
2. **Create custom rubrics** - Modify `RubricScores` interface
3. **Implement real services** - Replace stubs in `/backend/src/services/`
4. **Add task templates** - Create reusable task patterns
5. **Build analytics** - Aggregate labels for insights

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete architecture and design
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[backend/README.md](./backend/README.md)** - Backend setup and API docs

## 🔒 Security Considerations

**Important:** This system is designed for internal use with trusted raters.

Before production deployment:
- Add authentication (JWT, OAuth, etc.)
- Validate all user inputs
- Sanitize diffs and code content
- Use sandboxed Docker containers for test execution
- Implement rate limiting on API endpoints
- Encrypt sensitive data in database
- Add audit logging for all label submissions

## 💡 Design Philosophy

**Why these choices?**

- **Three-panel layout** - Maximize information density
- **Tabbed candidates** - Easy comparison without scrolling
- **Inline test execution** - Keep context during evaluation
- **Rubric-based scoring** - Structured, comparable feedback
- **Visual violations** - Immediate policy enforcement feedback
- **Tool traces** - Transparency into LLM reasoning

## 📊 Example Analytics Queries

```sql
-- Most preferred candidate
SELECT preferred_candidate_id, COUNT(*) as votes
FROM labels
WHERE task_id = 'demo-task'
GROUP BY preferred_candidate_id
ORDER BY votes DESC;

-- Average scores by candidate
SELECT
  candidate_id,
  AVG((scores->>'correctness')::int) as avg_correctness,
  AVG((scores->>'minimality')::int) as avg_minimality
FROM labels, jsonb_each(scores) as candidate_scores
GROUP BY candidate_id;

-- Inter-rater agreement
SELECT
  COUNT(DISTINCT rater_id) as rater_count,
  MODE() WITHIN GROUP (ORDER BY preferred_candidate_id) as consensus
FROM labels
WHERE task_id = 'demo-task';
```

## 🎓 Learning Outcomes

By exploring this codebase, you'll learn:

- **React component architecture** for complex UIs
- **TypeScript type safety** across frontend/backend
- **API design** for data-heavy applications
- **Diff parsing** and visualization
- **State management** without heavy libraries
- **Mock-first development** with clean abstractions
- **Service layer patterns** for easy swapping

## 🙏 Acknowledgments

Built for evaluating LLM coding capabilities with focus on:
- Correctness
- Minimality
- Code style
- Safety
- Tool usage efficiency

---

**Status:** ✅ Ready for development and testing

**License:** MIT (or your preferred license)

**Maintainers:** Your team

**Questions?** Check [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) or [QUICKSTART.md](./QUICKSTART.md)
