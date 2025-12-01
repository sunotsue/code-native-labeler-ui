import { useState, useEffect } from "react";
import { Task, FileContent, RubricScores, PreferenceLabel } from "./types/models";
import { api } from "./api/mockApi";
import { RepoTree } from "./components/RepoTree";
import { FileViewer } from "./components/FileViewer";
import { CandidatePanel } from "./components/CandidatePanel";
import { TestRunner } from "./components/TestRunner";
import { RubricForm } from "./components/RubricForm";
import { GitBranch, AlertCircle, Loader2 } from "lucide-react";

export default function App() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);
  
  // Load task on mount
  useEffect(() => {
    loadTask();
  }, []);
  
  const loadTask = async () => {
    try {
      const taskData = await api.getTask("demo-task");
      setTask(taskData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load task:", error);
      setLoading(false);
    }
  };
  
  const handleRunTests = async (candidateId: string) => {
    if (!task) return { status: "failed" as const, passed: 0, failed: 0, log: "" };
    return await api.runTests({ taskId: task.id, candidateId });
  };
  
  const handleSubmitLabel = async (
    preferred: string,
    scores: Record<string, RubricScores>,
    notes: string
  ) => {
    if (!task) return;
    
    const label: PreferenceLabel = {
      rater_id: "demo-rater",
      preferred_candidate_id: preferred,
      scoresByCandidate: scores,
      notes
    };
    
    await api.submitLabel(label);
  };
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading task...</span>
        </div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load task</div>
      </div>
    );
  }
  
  const selectedFileContent = (() => {
    if (!selectedFile) return null;
    const file = [...task.files, ...task.tests].find(f => f.path === selectedFile);
    return file || null;
  })();
  
  const isSelectedFileTest = task.tests.some(t => t.path === selectedFile);
  const selectedCandidate = task.candidates[selectedCandidateIdx];
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl mb-1">Code Task Labeling</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <GitBranch className="size-4" />
                <span className="font-mono">{task.repo.host}/{task.repo.name}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="font-mono text-xs">{task.repo.commitSha.slice(0, 8)}</span>
              <span className="text-gray-400">•</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                {task.capability_bucket}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {task.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Policy warnings */}
      {!task.metrics_config.allow_test_edits && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center gap-2">
          <AlertCircle className="size-4 text-yellow-700" />
          <span className="text-sm text-yellow-800">
            Tests cannot be modified - only source files should change
          </span>
        </div>
      )}
      
      {/* Main three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Repo tree */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm">Repository Files</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <RepoTree
              files={task.files}
              tests={task.tests}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              allowTestEdits={task.metrics_config.allow_test_edits}
            />
          </div>
        </div>
        
        {/* Center panel: File viewer or Candidates */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedCandidateIdx(-1)}
              className={`px-4 py-3 text-sm border-b-2 ${
                selectedCandidateIdx === -1
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`}
            >
              Files
            </button>
            {task.candidates.map((candidate, idx) => (
              <button
                key={candidate.candidate_id}
                onClick={() => setSelectedCandidateIdx(idx)}
                className={`px-4 py-3 text-sm border-b-2 font-mono ${
                  selectedCandidateIdx === idx
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {candidate.candidate_id}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {selectedCandidateIdx === -1 ? (
              <FileViewer file={selectedFileContent} isTest={isSelectedFileTest} />
            ) : (
              <div className="space-y-4">
                <CandidatePanel
                  candidate={selectedCandidate}
                  metricsConfig={task.metrics_config}
                  tests={task.tests}
                />
                
                {task.metrics_config.run_tests && (
                  <TestRunner
                    candidateId={selectedCandidate.candidate_id}
                    onRunTests={handleRunTests}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel: Task description and Rubric */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm">Task & Evaluation</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Task description */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm mb-2">Task Description</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {task.task_description}
              </div>
            </div>
            
            {/* Metrics config */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1">
              <div className="text-gray-600">Constraints:</div>
              <div>Max files: {task.metrics_config.max_changed_files}</div>
              <div>Max lines: {task.metrics_config.max_changed_lines}</div>
              <div>Tests editable: {task.metrics_config.allow_test_edits ? "Yes" : "No"}</div>
            </div>
            
            {/* Rubric form */}
            <RubricForm
              candidates={task.candidates}
              capabilityBucket={task.capability_bucket}
              onSubmit={handleSubmitLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
