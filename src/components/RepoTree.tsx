import { useState } from "react";
import { FileContent } from "../types/models";
import { ChevronRight, ChevronDown, File, FileCode } from "lucide-react";

interface RepoTreeProps {
  files: FileContent[];
  tests: FileContent[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  allowTestEdits: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  isTest: boolean;
  children: TreeNode[];
}

function buildTree(files: FileContent[], tests: FileContent[]): TreeNode {
  const root: TreeNode = { name: "root", path: "", isFile: false, isTest: false, children: [] };
  
  const allFiles = [
    ...files.map(f => ({ ...f, isTest: false })),
    ...tests.map(t => ({ ...t, isTest: true }))
  ];
  
  for (const file of allFiles) {
    const parts = file.path.split("/");
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      
      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path,
          isFile,
          isTest: file.isTest,
          children: []
        };
        current.children.push(child);
      }
      current = child;
    }
  }
  
  // Sort: directories first, then files
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(root.children);
  
  return root;
}

function TreeNodeComponent({
  node,
  level,
  selectedFile,
  onSelectFile,
  allowTestEdits
}: {
  node: TreeNode;
  level: number;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  allowTestEdits: boolean;
}) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  
  if (node.isFile) {
    const isSelected = selectedFile === node.path;
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-50 border-l-2 border-blue-500" : ""
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelectFile(node.path)}
      >
        {node.isTest ? (
          <FileCode className="size-4 text-purple-600" />
        ) : (
          <File className="size-4 text-gray-600" />
        )}
        <span className="text-sm">{node.name}</span>
        {node.isTest && (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            TEST
          </span>
        )}
        {node.isTest && !allowTestEdits && (
          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
            READ-ONLY
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-50"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="size-4 text-gray-500" />
        ) : (
          <ChevronRight className="size-4 text-gray-500" />
        )}
        <span className="text-sm">{node.name}</span>
      </div>
      {expanded && (
        <div>
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              allowTestEdits={allowTestEdits}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RepoTree({ files, tests, selectedFile, onSelectFile, allowTestEdits }: RepoTreeProps) {
  const tree = buildTree(files, tests);
  
  return (
    <div className="h-full overflow-y-auto border-r border-gray-200">
      {tree.children.map(node => (
        <TreeNodeComponent
          key={node.path}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          allowTestEdits={allowTestEdits}
        />
      ))}
    </div>
  );
}
