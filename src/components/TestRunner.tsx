import { useState } from "react";
import { Play, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { TestRunResult } from "../types/models";

interface TestRunnerProps {
  candidateId: string;
  onRunTests: (candidateId: string) => Promise<TestRunResult>;
  disabled?: boolean;
}

export function TestRunner({ candidateId, onRunTests, disabled }: TestRunnerProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestRunResult | null>(null);
  
  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const testResult = await onRunTests(candidateId);
      setResult(testResult);
    } catch (error) {
      console.error("Test run failed:", error);
    } finally {
      setRunning(false);
    }
  };
  
  return (
    <div className="space-y-3">
      <button
        onClick={handleRun}
        disabled={disabled || running}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {running ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Play className="size-4" />
        )}
        {running ? "Running tests..." : "Run Tests"}
      </button>
      
      {result && (
        <div className="border border-gray-200 rounded overflow-hidden">
          {/* Test summary */}
          <div className={`px-4 py-3 flex items-center gap-3 ${
            result.status === "passed" ? "bg-green-50 border-b border-green-200" : "bg-red-50 border-b border-red-200"
          }`}>
            {result.status === "passed" ? (
              <CheckCircle className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-red-600" />
            )}
            <div>
              <div className={result.status === "passed" ? "text-green-800" : "text-red-800"}>
                {result.status === "passed" ? "All tests passed" : "Some tests failed"}
              </div>
              <div className="text-sm text-gray-600">
                ✅ {result.passed} passed, ❌ {result.failed} failed
              </div>
            </div>
          </div>
          
          {/* Test logs */}
          <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre">{result.log}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
