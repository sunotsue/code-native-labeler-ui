import { useState } from "react";
import { RubricScores, Candidate, CapabilityBucket } from "../types/models";
import { Send } from "lucide-react";

interface RubricFormProps {
  candidates: Candidate[];
  capabilityBucket: CapabilityBucket;
  onSubmit: (preferred: string, scores: Record<string, RubricScores>, notes: string) => void;
}

const RUBRIC_LABELS: Record<keyof RubricScores, string> = {
  correctness: "Correctness",
  minimality: "Minimality",
  style: "Code Style",
  safety: "Safety",
  tool_use: "Tool Use"
};

const SCORE_DESCRIPTIONS: Record<number, string> = {
  0: "Very Poor",
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent"
};

export function RubricForm({ candidates, capabilityBucket, onSubmit }: RubricFormProps) {
  const [preferred, setPreferred] = useState<string>("");
  const [scores, setScores] = useState<Record<string, RubricScores>>(() => {
    const initial: Record<string, RubricScores> = {};
    candidates.forEach(c => {
      initial[c.candidate_id] = {
        correctness: 3,
        minimality: 3,
        style: 3,
        safety: 3,
        ...(capabilityBucket === "tool_use" ? { tool_use: 3 } : {})
      };
    });
    return initial;
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const updateScore = (candidateId: string, metric: keyof RubricScores, value: number) => {
    setScores(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [metric]: value
      }
    }));
  };
  
  const handleSubmit = async () => {
    if (!preferred) {
      alert("Please select a preferred candidate");
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(preferred, scores, notes);
      alert("Label submitted successfully!");
    } catch (error) {
      alert(`Submission failed: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const showToolUse = capabilityBucket === "tool_use";
  const metrics: (keyof RubricScores)[] = [
    "correctness",
    "minimality",
    "style",
    "safety",
    ...(showToolUse ? ["tool_use" as const] : [])
  ];
  
  return (
    <div className="space-y-4">
      {/* Preferred candidate selector */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="text-sm mb-2">Preferred Candidate</div>
        <div className="space-y-2">
          {candidates.map(c => (
            <label key={c.candidate_id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="preferred"
                value={c.candidate_id}
                checked={preferred === c.candidate_id}
                onChange={(e) => setPreferred(e.target.value)}
                className="size-4"
              />
              <span className="text-sm font-mono">{c.candidate_id}</span>
              <span className="text-xs text-gray-500">({c.model_id})</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="preferred"
              value="tie"
              checked={preferred === "tie"}
              onChange={(e) => setPreferred(e.target.value)}
              className="size-4"
            />
            <span className="text-sm">Tie (no clear winner)</span>
          </label>
        </div>
      </div>
      
      {/* Rubric scores */}
      <div className="space-y-4">
        <div className="text-sm">Rate each candidate (0-5):</div>
        
        {candidates.map(candidate => (
          <div key={candidate.candidate_id} className="border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 font-mono text-sm">
              {candidate.candidate_id}
            </div>
            <div className="p-3 space-y-3">
              {metrics.map(metric => (
                <div key={metric}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm">{RUBRIC_LABELS[metric]}</label>
                    <span className="text-xs text-gray-500">
                      {scores[candidate.candidate_id][metric]} - {SCORE_DESCRIPTIONS[scores[candidate.candidate_id][metric] || 0]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={scores[candidate.candidate_id][metric] || 3}
                    onChange={(e) => updateScore(candidate.candidate_id, metric, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Notes */}
      <div>
        <label className="text-sm block mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional observations or reasoning..."
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
          rows={4}
        />
      </div>
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !preferred}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Send className="size-4" />
        {submitting ? "Submitting..." : "Submit Label"}
      </button>
    </div>
  );
}
