import { Candidate, FileContent, MetricsConfig } from "../types/models";
import { DiffViewer } from "./DiffViewer";
import { ToolTraceView } from "./ToolTraceView";
import { AlertTriangle, FileText } from "lucide-react";

interface CandidatePanelProps {
  candidate: Candidate;
  metricsConfig: MetricsConfig;
  tests: FileContent[];
}

function analyzePatch(diff: string | undefined): {
  filesChanged: number;
  linesChanged: number;
  modifiesTests: boolean;
} {
  if (!diff) {
    return { filesChanged: 0, linesChanged: 0, modifiesTests: false };
  }
  
  const lines = diff.split("\n");
  const filesChanged = lines.filter(l => l.startsWith("---") || l.startsWith("+++")).length / 2;
  const linesChanged = lines.filter(l => l.startsWith("+") || l.startsWith("-")).length;
  const modifiesTests = lines.some(l => 
    (l.startsWith("---") || l.startsWith("+++")) && l.includes("test")
  );
  
  return { filesChanged, linesChanged, modifiesTests };
}

export function CandidatePanel({ candidate, metricsConfig, tests }: CandidatePanelProps) {
  const analysis = analyzePatch(candidate.patch_diff);
  
  const violatesFileLimit = analysis.filesChanged > metricsConfig.max_changed_files;
  const violatesLineLimit = analysis.linesChanged > metricsConfig.max_changed_lines;
  const violatesTestPolicy = analysis.modifiesTests && !metricsConfig.allow_test_edits;
  
  return (
    <div className="space-y-3">
      {/* Header with metadata */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono">{candidate.candidate_id}</h3>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {candidate.model_id}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.filesChanged} file{analysis.filesChanged !== 1 ? "s" : ""} changed, {" "}
            {analysis.linesChanged} line{analysis.linesChanged !== 1 ? "s" : ""}
          </div>
        </div>
        
        {/* Violation warnings */}
        <div className="flex flex-col gap-1 items-end">
          {violatesFileLimit && (
            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              <AlertTriangle className="size-3" />
              Exceeds max files ({metricsConfig.max_changed_files})
            </div>
          )}
          {violatesLineLimit && (
            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              <AlertTriangle className="size-3" />
              Exceeds max lines ({metricsConfig.max_changed_lines})
            </div>
          )}
          {violatesTestPolicy && (
            <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              <AlertTriangle className="size-3" />
              Modifies tests (policy violation)
            </div>
          )}
        </div>
      </div>
      
      {/* Diff view */}
      {candidate.patch_diff ? (
        <div>
          <div className="text-sm mb-2 flex items-center gap-2">
            <FileText className="size-4 text-gray-600" />
            <span>Patch Diff</span>
          </div>
          <DiffViewer diff={candidate.patch_diff} />
        </div>
      ) : candidate.answer ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="text-sm mb-2">Answer:</div>
          <div className="text-sm">{candidate.answer}</div>
        </div>
      ) : null}
      
      {/* Tool trace */}
      <ToolTraceView toolTrace={candidate.tool_trace} />
    </div>
  );
}
