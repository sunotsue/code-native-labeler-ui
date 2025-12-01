import { Router } from 'express';
import { TestRunRequest, TestRunResult } from '../types/models';
import { runTestsForCandidate } from '../services/testRunner';

export const testRoutes = Router();

/**
 * POST /api/run-tests
 * 
 * Executes tests for a specific candidate. In production, this would:
 * 1. Clone repo at specified commit
 * 2. Apply candidate's patch
 * 3. Spin up Docker container with appropriate test environment
 * 4. Run tests (pytest, jest, etc.)
 * 5. Capture logs and results
 * 6. Return test outcomes
 * 
 * Request body:
 * {
 *   "taskId": "task-123",
 *   "candidateId": "candidate-a"
 * }
 * 
 * Response:
 * {
 *   "status": "passed" | "failed",
 *   "passed": 23,
 *   "failed": 2,
 *   "log": "test execution logs..."
 * }
 */
testRoutes.post('/run-tests', async (req, res) => {
  try {
    const request: TestRunRequest = req.body;
    
    // Validation
    if (!request.taskId || !request.candidateId) {
      return res.status(400).json({
        error: 'Missing required fields: taskId, candidateId'
      });
    }
    
    console.log(`Running tests for task ${request.taskId}, candidate ${request.candidateId}`);
    
    // Run tests (currently stubbed)
    const result: TestRunResult = await runTestsForCandidate(
      request.taskId,
      request.candidateId
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Test execution failed' });
  }
});
