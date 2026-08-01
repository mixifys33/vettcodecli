"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

interface StructureNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: StructureNode[];
  size?: number;
}

interface ProjectStructureTreeProps {
  structure: StructureNode;
}

export default function ProjectStructureTree({ structure }: ProjectStructureTreeProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 max-h-[600px] overflow-auto">
      <TreeNode node={structure} level={0} />
    </div>
  );
}

function TreeNode({ node, level }: { node: StructureNode; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;
  const isDirectory = node.type === "directory";

  return (
    <div>
      <motion.div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-800/50 cursor-pointer ${
          level === 0 ? "font-bold" : ""
        }`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        whileHover={{ x: 2 }}
      >
        {/* Expander icon */}
        <div className="w-4 h-4 flex items-center justify-center text-gray-500">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4"></span>
          )}
        </div>

        {/* Folder/File icon */}
        {isDirectory ? (
          <Folder
            className={`w-4 h-4 ${
              isExpanded ? "text-blue-400" : "text-blue-500"
            }`}
          />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}

        {/* Name */}
        <span className={`text-sm ${isDirectory ? "text-white" : "text-gray-300"}`}>
          {node.name}
        </span>

        {/* Size for files */}
        {!isDirectory && node.size && (
          <span className="text-xs text-gray-500 ml-auto">
            {formatBytes(node.size)}
          </span>
        )}

        {/* Child count for directories */}
        {isDirectory && hasChildren && (
          <span className="text-xs text-gray-500 ml-auto">
            {node.children!.length} items
          </span>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ paddingLeft: `${(level + 1) * 16}px` }}
          >
            {node.children!.map((child, idx) => (
              <TreeNode key={`${child.path}-${idx}`} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
}
