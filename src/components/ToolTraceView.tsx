import { useState } from "react";
import { ToolCall } from "../types/models";
import { ChevronDown, ChevronRight, Wrench } from "lucide-react";

interface ToolTraceViewProps {
  toolTrace?: ToolCall[];
}

export function ToolTraceView({ toolTrace }: ToolTraceViewProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!toolTrace || toolTrace.length === 0) {
    return null;
  }
  
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
        <Wrench className="size-4 text-gray-600" />
        <span className="text-sm">Tool Trace ({toolTrace.length} calls)</span>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-200">
          {toolTrace.map((call, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 py-2 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                    {call.tool_name}
                  </span>
                  <span className="text-xs text-gray-500">Step {idx + 1}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="text-gray-500">Arguments:</span>{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{call.arguments}</code>
                </div>
                <div className="text-xs text-gray-700">
                  <span className="text-gray-500">Output:</span> {call.output_summary}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
