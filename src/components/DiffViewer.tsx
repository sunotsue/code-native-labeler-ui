interface DiffViewerProps {
  diff: string;
}

interface DiffLine {
  type: "header" | "add" | "remove" | "context" | "meta";
  content: string;
}

function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split("\n");
  return lines.map(line => {
    if (line.startsWith("+++") || line.startsWith("---")) {
      return { type: "meta", content: line };
    }
    if (line.startsWith("@@")) {
      return { type: "header", content: line };
    }
    if (line.startsWith("+")) {
      return { type: "add", content: line };
    }
    if (line.startsWith("-")) {
      return { type: "remove", content: line };
    }
    return { type: "context", content: line };
  });
}

export function DiffViewer({ diff }: DiffViewerProps) {
  const diffLines = parseDiff(diff);
  
  return (
    <div className="font-mono text-sm overflow-auto bg-gray-50 border border-gray-200 rounded">
      {diffLines.map((line, idx) => {
        let bgColor = "";
        let textColor = "text-gray-800";
        
        if (line.type === "meta") {
          bgColor = "bg-gray-200";
          textColor = "text-gray-600";
        } else if (line.type === "header") {
          bgColor = "bg-blue-50";
          textColor = "text-blue-700";
        } else if (line.type === "add") {
          bgColor = "bg-green-50";
          textColor = "text-green-800";
        } else if (line.type === "remove") {
          bgColor = "bg-red-50";
          textColor = "text-red-800";
        }
        
        return (
          <div
            key={idx}
            className={`px-4 py-0.5 ${bgColor} ${textColor} whitespace-pre`}
          >
            {line.content || " "}
          </div>
        );
      })}
    </div>
  );
}
