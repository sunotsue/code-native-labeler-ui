import { FileContent } from "../types/models";

interface FileViewerProps {
  file: FileContent | null;
  isTest: boolean;
}

export function FileViewer({ file, isTest }: FileViewerProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its content
      </div>
    );
  }
  
  const lines = file.content.split("\n");
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="font-mono text-sm">{file.path}</span>
        {isTest && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            TEST FILE
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-gray-50">
        <table className="w-full font-mono text-sm">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="px-2 py-0.5 text-gray-400 text-right select-none border-r border-gray-200 bg-gray-100" style={{ width: '50px' }}>
                  {idx + 1}
                </td>
                <td className="px-4 py-0.5 whitespace-pre">{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
