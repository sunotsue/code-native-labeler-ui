// Core data model types for the LLM code labeling system
// This file should be identical to /types/models.ts in the frontend

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
  host: string;
  name: string;
  commitSha: string;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface ToolCall {
  tool_name: string;
  arguments: string;
  output_summary: string;
}

export interface Candidate {
  candidate_id: string;
  model_id: string;
  patch_diff?: string;
  answer?: string;
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
  files: FileContent[];
  tests: FileContent[];
  ci_logs?: string;
  task_description: string;
  candidates: Candidate[];
  metrics_config: MetricsConfig;
}

export interface RubricScores {
  correctness: number;
  minimality: number;
  style: number;
  safety: number;
  tool_use?: number;
}

export interface PreferenceLabel {
  rater_id: string;
  preferred_candidate_id: string | "tie";
  scoresByCandidate: Record<string, RubricScores>;
  notes?: string;
}

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
