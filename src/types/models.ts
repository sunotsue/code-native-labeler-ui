// Core data model types for the LLM code labeling system

export type CapabilityBucket =
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

export interface RepoInfo {
  host: string;          // e.g. "github.com"
  name: string;          // e.g. "org/repo"
  commitSha: string;     // snapshot identifier
}

export interface FileContent {
  path: string;
  content: string;
}

export interface ToolCall {
  tool_name: string;     // e.g. "run_tests" | "search_repo"
  arguments: string;     // JSON string
  output_summary: string;
}

export interface Candidate {
  candidate_id: string;
  model_id: string;
  patch_diff?: string;   // unified diff
  answer?: string;       // for non-patch tasks
  tool_trace?: ToolCall[];
}

export interface MetricsConfig {
  run_tests: boolean;
  allow_test_edits: boolean;
  max_changed_files: number;
  max_changed_lines: number;
}

export interface Task {
  id: string;
  capability_bucket: CapabilityBucket;
  tags: string[];
  repo: RepoInfo;
  files: FileContent[];   // initial state snapshot
  tests: FileContent[];   // test files
  ci_logs?: string;       // optional CI log snippet
  task_description: string;
  candidates: Candidate[];
  metrics_config: MetricsConfig;
}

export interface RubricScores {
  correctness: number;   // 0–5
  minimality: number;    // 0–5
  style: number;         // 0–5
  safety: number;        // 0–5
  tool_use?: number;     // 0–5, for tool_use bucket
}

export interface PreferenceLabel {
  rater_id: string;
  preferred_candidate_id: string | "tie";
  scoresByCandidate: Record<string, RubricScores>;
  notes?: string;
}

// API response types
export interface TestRunResult {
  status: "passed" | "failed";
  passed: number;
  failed: number;
  log: string;
}

export interface TestRunRequest {
  taskId: string;
  candidateId: string;
}
