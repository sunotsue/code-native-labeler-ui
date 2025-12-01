# Quick Start Guide

Get the LLM Code Task Labeling system running in under 5 minutes.

## 🎯 What You'll See

A working demo with:
- Repository file browser (Python payment service)
- 3 candidate solutions to a timeout bug
- Side-by-side diff comparison
- Test execution simulation
- Rubric-based rating form

## 🚀 Option 1: Frontend Only (No Setup Required)

The app is already configured with mock data and will work immediately.

**Just open the app and:**

1. Explore the repository files in the left panel
2. Click through candidate tabs to compare solutions
3. Click "Run Tests" to simulate test execution
4. Fill out the rubric form and submit a label

**Features you can try:**
- Browse the file tree (`src/` and `tests/`)
- Compare diffs between candidates
- Expand tool traces to see LLM reasoning
- Notice the policy violation on candidate-c (modifies tests + exceeds line limit)
- Run tests and see pytest-style output
- Rate each candidate on the rubric (0-5 sliders)
- Select preferred candidate and submit

## 🔧 Option 2: Full Stack (Frontend + Backend)

To run with a real backend server:

### 1. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

You should see:
```
🚀 Code labeling backend running on http://localhost:3001
📝 Task endpoint: GET /api/task/:id
🧪 Test endpoint: POST /api/run-tests
📊 Label endpoint: POST /api/label
```

### 2. Update the frontend API client

Edit `/api/mockApi.ts` and replace the mock implementations with real API calls:

```typescript
const API_URL = 'http://localhost:3001';

export const api = {
  async getTask(id: string): Promise<Task> {
    const response = await fetch(`${API_URL}/api/task/${id}`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  async runTests(request: TestRunRequest): Promise<TestRunResult> {
    const response = await fetch(`${API_URL}/api/run-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to run tests');
    return response.json();
  },

  async submitLabel(label: PreferenceLabel): Promise<void> {
    const response = await fetch(`${API_URL}/api/label`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(label)
    });
    if (!response.ok) throw new Error('Failed to submit label');
  }
};
```

### 3. Test the API

```bash
# Get the demo task
curl http://localhost:3001/api/task/demo-task

# Run tests
curl -X POST http://localhost:3001/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{"taskId":"demo-task","candidateId":"candidate-a"}'

# Submit a label
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

## 📊 Understanding the Demo Task

**Task:** Fix a timeout bug in an async Python payment processor

**The Bug:** The `_send_to_gateway` method doesn't handle timeouts, causing the test to fail.

**Candidates:**

| Candidate | Approach | Files Changed | Lines Changed | Tests Pass | Violations |
|-----------|----------|---------------|---------------|------------|------------|
| A (GPT-4 Turbo) | Minimal: just add `asyncio.wait_for()` | 1 | 2 | ✅ Yes | None |
| B (Claude-3 Opus) | Comprehensive: timeout + explicit error handling | 1 | 8 | ✅ Yes | None |
| C (GPT-4) | Over-engineered: modifies both code AND tests | 2 | 18 | ❌ No | Modifies tests, exceeds line limit |

**Expected Rating:**
- **Candidate A** should score high on minimality and correctness
- **Candidate B** should score high on safety and correctness
- **Candidate C** violates policy (modifies tests when `allow_test_edits=false`)

## 🎮 Interactive Tutorial

### Step 1: Explore the Repository

1. Click on files in the left panel
2. Notice test files have a "TEST" badge
3. Look for the "READ-ONLY" badge on tests (policy enforcement)

### Step 2: Compare Candidates

1. Click the "candidate-a" tab
2. Review the diff (just 2 lines changed)
3. Expand "Tool Trace" to see the LLM's reasoning
4. Click "candidate-c" tab
5. Notice the red warnings about policy violations

### Step 3: Run Tests

1. Stay on candidate-a tab
2. Click "Run Tests"
3. Wait for the loader (simulates real test execution)
4. See pytest output with ✅ 3 passed

### Step 4: Rate and Submit

1. In the right panel, read the task description
2. Rate each candidate on the rubric (drag sliders 0-5)
3. Select your preferred candidate (radio button)
4. Add optional notes
5. Click "Submit Label"
6. Check browser console to see the submitted data

## 🔍 Key UI Elements to Notice

**Policy Enforcement:**
- Yellow banner at top when tests can't be edited
- "READ-ONLY" badges on test files
- Red violation warnings on candidate-c

**Diff Visualization:**
- Gray: file metadata (`---`/`+++`)
- Blue: chunk headers (`@@`)
- Green: additions (`+`)
- Red: removals (`-`)

**Constraint Display:**
- Right panel shows max files/lines limits
- Violations displayed as orange/red badges

**Tool Traces:**
- Collapsible sections showing tool name, arguments, output
- Demonstrates LLM's problem-solving approach

## 🐛 Troubleshooting

### Frontend issues

**Problem:** Page is blank
- Check browser console for errors
- Ensure all files are present

**Problem:** Task won't load
- Check `/api/mockData.ts` is properly formatted
- Verify imports in `App.tsx`

### Backend issues

**Problem:** Server won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem:** CORS errors
- Add `http://localhost:3000` to CORS_ORIGIN in `.env`
- Restart the server

**Problem:** TypeScript errors
```bash
cd backend
npm install --save-dev @types/express @types/node
```

## 📝 Next Steps

Once you're comfortable with the demo:

1. **Create a new task** - Edit `/api/mockData.ts` to add your own scenario
2. **Add more candidates** - Expand the candidates array with different solutions
3. **Customize rubrics** - Modify scoring dimensions in `/types/models.ts`
4. **Connect real git** - Implement `/backend/src/services/gitService.ts`
5. **Add database** - Replace in-memory storage with PostgreSQL

## 💡 Tips for Creating Good Tasks

- **Clear objective:** Describe exactly what needs to be fixed/implemented
- **Realistic constraints:** Set achievable max_changed_files and max_changed_lines
- **Diverse candidates:** Include both good and bad solutions for contrast
- **Test coverage:** Ensure tests actually verify the fix
- **Tool traces:** Show different problem-solving approaches

## 🎓 Learning Resources

- **React docs:** https://react.dev
- **TypeScript handbook:** https://www.typescriptlang.org/docs/
- **Express guide:** https://expressjs.com/en/guide/routing.html
- **Unified diff format:** https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html

## 🤝 Getting Help

If you run into issues:
1. Check the browser console for errors
2. Review `/PROJECT_OVERVIEW.md` for architecture details
3. Examine `/backend/README.md` for backend-specific info
4. Look at the demo task in `/api/mockData.ts` as a reference

---

Happy labeling! 🏷️
