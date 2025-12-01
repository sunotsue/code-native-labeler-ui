// Mock API client - simulates backend calls
// In production, replace these with real fetch() calls to your Express backend

import { Task, TestRunResult, TestRunRequest, PreferenceLabel } from "../types/models";
import { DEMO_TASK } from "./mockData";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getTask(id: string): Promise<Task> {
    await delay(300);
    
    if (id === "demo-task") {
      return DEMO_TASK;
    }
    
    throw new Error(`Task ${id} not found`);
  },

  async runTests(request: TestRunRequest): Promise<TestRunResult> {
    await delay(1500); // Simulate test execution time
    
    const { candidateId } = request;
    
    // Simulate different test outcomes for different candidates
    if (candidateId === "candidate-a") {
      return {
        status: "passed",
        passed: 3,
        failed: 0,
        log: `============================= test session starts ==============================
platform linux -- Python 3.11.0, pytest-7.4.0
collected 3 items

tests/test_payment_processor.py::test_successful_payment PASSED        [ 33%]
tests/test_payment_processor.py::test_payment_timeout PASSED           [ 66%]
tests/test_payment_processor.py::test_retry_logic PASSED               [100%]

============================== 3 passed in 0.45s ===============================`
      };
    }
    
    if (candidateId === "candidate-b") {
      return {
        status: "passed",
        passed: 3,
        failed: 0,
        log: `============================= test session starts ==============================
platform linux -- Python 3.11.0, pytest-7.4.0
collected 3 items

tests/test_payment_processor.py::test_successful_payment PASSED        [ 33%]
tests/test_payment_processor.py::test_payment_timeout PASSED           [ 66%]
tests/test_payment_processor.py::test_retry_logic PASSED               [100%]

============================== 3 passed in 0.48s ===============================`
      };
    }
    
    if (candidateId === "candidate-c") {
      return {
        status: "failed",
        passed: 2,
        failed: 1,
        log: `============================= test session starts ==============================
platform linux -- Python 3.11.0, pytest-7.4.0
collected 3 items

tests/test_payment_processor.py::test_successful_payment PASSED        [ 33%]
tests/test_payment_processor.py::test_payment_timeout FAILED           [ 66%]
tests/test_payment_processor.py::test_retry_logic PASSED               [100%]

=================================== FAILURES ===================================
________________________________ test_payment_timeout ___________________________

processor = <src.payment_processor.PaymentProcessor object at 0x7f8b9c>
sample_payment = Payment(amount=100.0, currency='USD', customer_id='cust_123')

    @pytest.mark.asyncio
    async def test_payment_timeout(processor, sample_payment):
        """Test that payment handles timeout correctly and retries."""
        # Updated: timeout is now handled gracefully
        status = await processor.process_payment(sample_payment)
>       assert status == PaymentStatus.FAILED
E       AssertionError: assert <PaymentStatus.COMPLETED: 'completed'> == <PaymentStatus.FAILED: 'failed'>

tests/test_payment_processor.py:30: AssertionError
=========================== short test summary info ============================
FAILED tests/test_payment_processor.py::test_payment_timeout - AssertionError
========================= 1 failed, 2 passed in 0.52s ==========================`
      };
    }
    
    return {
      status: "passed",
      passed: 3,
      failed: 0,
      log: "All tests passed"
    };
  },

  async submitLabel(label: PreferenceLabel): Promise<void> {
    await delay(500);
    
    // Validation
    if (!label.preferred_candidate_id) {
      throw new Error("Preferred candidate must be selected");
    }
    
    // Validate scores
    for (const [candidateId, scores] of Object.entries(label.scoresByCandidate)) {
      const scoreValues = Object.values(scores).filter(v => v !== undefined) as number[];
      for (const score of scoreValues) {
        if (score < 0 || score > 5) {
          throw new Error(`Invalid score ${score} for candidate ${candidateId}. Must be 0-5.`);
        }
      }
    }
    
    console.log("Label submitted:", label);
    // In production, this would POST to /api/label
  }
};
