import { Task } from '../types/models';

// In-memory task storage (replace with database in production)
export const TASKS: Record<string, Task> = {
  'demo-task': {
    id: 'demo-task',
    capability_bucket: 'minimal_patches',
    tags: ['bug-fix', 'python', 'async'],
    repo: {
      host: 'github.com',
      name: 'acme-corp/payment-service',
      commitSha: 'a7f3c9d2e1b4f8a6c5d9e2f1a8b7c6d5e4f3a2b1'
    },
    files: [
      {
        path: 'src/payment_processor.py',
        content: `import asyncio
from typing import Optional
from .models import Payment, PaymentStatus

class PaymentProcessor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.retry_count = 3
    
    async def process_payment(self, payment: Payment) -> PaymentStatus:
        """Process a payment with retry logic."""
        for attempt in range(self.retry_count):
            try:
                result = await self._send_to_gateway(payment)
                if result.success:
                    return PaymentStatus.COMPLETED
                await asyncio.sleep(2 ** attempt)  # exponential backoff
            except Exception as e:
                if attempt == self.retry_count - 1:
                    raise
                continue
        return PaymentStatus.FAILED
    
    async def _send_to_gateway(self, payment: Payment):
        # Bug: doesn't handle timeout properly
        response = await self._call_api(payment)
        return response
    
    async def _call_api(self, payment: Payment):
        # Simulated API call
        await asyncio.sleep(0.1)
        return {"success": True}
`
      }
    ],
    tests: [
      {
        path: 'tests/test_payment_processor.py',
        content: `import pytest
import asyncio
from src.payment_processor import PaymentProcessor
from src.models import Payment, PaymentStatus

@pytest.mark.asyncio
async def test_payment_timeout(processor, sample_payment):
    """Test that payment handles timeout correctly."""
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(
            processor.process_payment(sample_payment),
            timeout=0.05
        )
`
      }
    ],
    task_description: `Fix the timeout handling bug in PaymentProcessor._send_to_gateway(). 
Add a timeout of 5 seconds to the gateway call and ensure it's handled gracefully.`,
    candidates: [
      {
        candidate_id: 'candidate-a',
        model_id: 'gpt-4-turbo',
        patch_diff: `--- a/src/payment_processor.py
+++ b/src/payment_processor.py
@@ -20,7 +20,7 @@ class PaymentProcessor:
     async def _send_to_gateway(self, payment: Payment):
-        response = await self._call_api(payment)
+        response = await asyncio.wait_for(self._call_api(payment), timeout=5.0)
         return response
`
      }
    ],
    metrics_config: {
      run_tests: true,
      allow_test_edits: false,
      max_changed_files: 2,
      max_changed_lines: 10
    }
  }
};
