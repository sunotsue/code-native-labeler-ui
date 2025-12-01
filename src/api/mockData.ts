import { Task } from "../types/models";

// Mock task data demonstrating a "minimal_patches" scenario
export const DEMO_TASK: Task = {
  id: "demo-task",
  capability_bucket: "minimal_patches",
  tags: ["bug-fix", "python", "async"],
  repo: {
    host: "github.com",
    name: "acme-corp/payment-service",
    commitSha: "a7f3c9d2e1b4f8a6c5d9e2f1a8b7c6d5e4f3a2b1"
  },
  files: [
    {
      path: "src/payment_processor.py",
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
    },
    {
      path: "src/models.py",
      content: `from enum import Enum
from dataclasses import dataclass

class PaymentStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Payment:
    amount: float
    currency: str
    customer_id: str
`
    }
  ],
  tests: [
    {
      path: "tests/test_payment_processor.py",
      content: `import pytest
import asyncio
from src.payment_processor import PaymentProcessor
from src.models import Payment, PaymentStatus

@pytest.fixture
def processor():
    return PaymentProcessor(api_key="test_key_123")

@pytest.fixture
def sample_payment():
    return Payment(amount=100.0, currency="USD", customer_id="cust_123")

@pytest.mark.asyncio
async def test_successful_payment(processor, sample_payment):
    """Test that a successful payment returns COMPLETED status."""
    status = await processor.process_payment(sample_payment)
    assert status == PaymentStatus.COMPLETED

@pytest.mark.asyncio
async def test_payment_timeout(processor, sample_payment):
    """Test that payment handles timeout correctly."""
    # This test currently fails because timeout isn't handled
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(
            processor.process_payment(sample_payment),
            timeout=0.05
        )

@pytest.mark.asyncio
async def test_retry_logic(processor, sample_payment):
    """Test that retry logic works correctly."""
    status = await processor.process_payment(sample_payment)
    assert status in [PaymentStatus.COMPLETED, PaymentStatus.FAILED]
`
    }
  ],
  task_description: `Fix the timeout handling bug in PaymentProcessor._send_to_gateway(). 
The payment processor should properly handle asyncio.TimeoutError when calling the payment gateway API. 
Add a timeout of 5 seconds to the gateway call and ensure it's handled gracefully with the retry logic.

Requirements:
- Add proper timeout handling to _send_to_gateway
- Don't modify the test files
- Keep changes minimal (ideally 1-3 lines)`,
  candidates: [
    {
      candidate_id: "candidate-a",
      model_id: "gpt-4-turbo",
      patch_diff: `--- a/src/payment_processor.py
+++ b/src/payment_processor.py
@@ -20,7 +20,7 @@ class PaymentProcessor:
     
     async def _send_to_gateway(self, payment: Payment):
-        # Bug: doesn't handle timeout properly
-        response = await self._call_api(payment)
+        # Fixed: add timeout handling
+        response = await asyncio.wait_for(self._call_api(payment), timeout=5.0)
         return response
`,
      tool_trace: [
        {
          tool_name: "search_repo",
          arguments: JSON.stringify({ query: "async.*gateway", file_pattern: "*.py" }),
          output_summary: "Found 1 match in src/payment_processor.py:22"
        },
        {
          tool_name: "read_file",
          arguments: JSON.stringify({ path: "tests/test_payment_processor.py" }),
          output_summary: "Read test file to understand timeout requirement"
        }
      ]
    },
    {
      candidate_id: "candidate-b",
      model_id: "claude-3-opus",
      patch_diff: `--- a/src/payment_processor.py
+++ b/src/payment_processor.py
@@ -13,6 +13,8 @@ class PaymentProcessor:
             try:
                 result = await self._send_to_gateway(payment)
                 if result.success:
                     return PaymentStatus.COMPLETED
+            except asyncio.TimeoutError:
+                if attempt == self.retry_count - 1:
+                    raise
                 await asyncio.sleep(2 ** attempt)  # exponential backoff
             except Exception as e:
@@ -20,7 +22,7 @@ class PaymentProcessor:
     
     async def _send_to_gateway(self, payment: Payment):
-        # Bug: doesn't handle timeout properly
-        response = await self._call_api(payment)
+        # Fixed: add timeout handling
+        response = await asyncio.wait_for(self._call_api(payment), timeout=5.0)
         return response
`,
      tool_trace: [
        {
          tool_name: "search_repo",
          arguments: JSON.stringify({ query: "TimeoutError" }),
          output_summary: "Found references in tests/test_payment_processor.py"
        },
        {
          tool_name: "read_file",
          arguments: JSON.stringify({ path: "src/payment_processor.py" }),
          output_summary: "Analyzed retry logic structure"
        }
      ]
    },
    {
      candidate_id: "candidate-c",
      model_id: "gpt-4",
      patch_diff: `--- a/src/payment_processor.py
+++ b/src/payment_processor.py
@@ -1,5 +1,5 @@
 import asyncio
-from typing import Optional
+from typing import Optional, Any
 from .models import Payment, PaymentStatus
 
@@ -20,8 +20,15 @@ class PaymentProcessor:
     
     async def _send_to_gateway(self, payment: Payment):
-        # Bug: doesn't handle timeout properly
-        response = await self._call_api(payment)
+        # Fixed: add timeout and error handling
+        try:
+            response = await asyncio.wait_for(self._call_api(payment), timeout=5.0)
+        except asyncio.TimeoutError:
+            return {"success": False, "error": "Gateway timeout"}
+        except Exception as e:
+            return {"success": False, "error": str(e)}
         return response
     
-    async def _call_api(self, payment: Payment):
+    async def _call_api(self, payment: Payment) -> dict[str, Any]:
         # Simulated API call
         await asyncio.sleep(0.1)
--- a/tests/test_payment_processor.py
+++ b/tests/test_payment_processor.py
@@ -25,7 +25,7 @@ async def test_successful_payment(processor, sample_payment):
 @pytest.mark.asyncio
 async def test_payment_timeout(processor, sample_payment):
-    """Test that payment handles timeout correctly."""
-    # This test currently fails because timeout isn't handled
-    with pytest.raises(asyncio.TimeoutError):
+    """Test that payment handles timeout correctly and retries."""
+    # Updated: timeout is now handled gracefully
+    status = await processor.process_payment(sample_payment)
-        await asyncio.wait_for(
-            processor.process_payment(sample_payment),
-            timeout=0.05
-        )
+    assert status == PaymentStatus.FAILED
`,
      tool_trace: [
        {
          tool_name: "run_tests",
          arguments: JSON.stringify({ test_path: "tests/test_payment_processor.py" }),
          output_summary: "1 test failed: test_payment_timeout"
        },
        {
          tool_name: "search_repo",
          arguments: JSON.stringify({ query: "async" }),
          output_summary: "Found async patterns in payment_processor.py"
        }
      ]
    }
  ],
  metrics_config: {
    run_tests: true,
    allow_test_edits: false,
    max_changed_files: 2,
    max_changed_lines: 10
  }
};
