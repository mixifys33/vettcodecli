"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  type: string;
  path: string;
}

interface Edge {
  from: string;
  to: string;
  type: string;
}

interface DependencyGraphVizProps {
  nodes: Node[];
  edges: Edge[];
}

export default function DependencyGraphViz({ nodes, edges }: DependencyGraphVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Simple force-directed graph without external library
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create node positions
    const nodePositions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    
    // Initialize nodes in circle
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      nodePositions.set(node.id, {
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    // Animation loop
    let animationFrame: number;
    let iterations = 0;
    const maxIterations = 300;

    const animate = () => {
      if (iterations++ > maxIterations) return;

      ctx.clearRect(0, 0, width, height);

      // Apply forces
      if (iterations < maxIterations) {
        // Repulsion between all nodes
        nodes.forEach((node1, i) => {
          nodes.forEach((node2, j) => {
            if (i === j) return;
            const pos1 = nodePositions.get(node1.id)!;
            const pos2 = nodePositions.get(node2.id)!;
            
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 500 / (dist * dist);
            
            pos1.vx += (dx / dist) * force;
            pos1.vy += (dy / dist) * force;
          });
        });

        // Attraction along edges
        edges.forEach((edge) => {
          const pos1 = nodePositions.get(edge.from);
          const pos2 = nodePositions.get(edge.to);
          if (!pos1 || !pos2) return;

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = dist * 0.01;

          pos1.vx += (dx / dist) * force;
          pos1.vy += (dy / dist) * force;
          pos2.vx -= (dx / dist) * force;
          pos2.vy -= (dy / dist) * force;
        });

        // Update positions with damping
        nodePositions.forEach((pos) => {
          pos.x += pos.vx;
          pos.y += pos.vy;
          pos.vx *= 0.85;
          pos.vy *= 0.85;

          // Keep in bounds
          pos.x = Math.max(50, Math.min(width - 50, pos.x));
          pos.y = Math.max(50, Math.min(height - 50, pos.y));
        });
      }

      // Draw edges
      ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const pos1 = nodePositions.get(edge.from);
        const pos2 = nodePositions.get(edge.to);
        if (!pos1 || !pos2) return;

        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;

        const isHovered = hoveredNode === node.id;
        const isSelected = selectedNode === node.id;
        const radius = isHovered || isSelected ? 8 : 6;

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? "#3b82f6" : isHovered ? "#60a5fa" : "#1e293b";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#2563eb" : "#475569";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label (only for hovered/selected)
        if (isHovered || isSelected) {
          const fileName = node.path.split("/").pop() || node.path;
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.fillText(fileName, pos.x, pos.y - 12);
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [nodes, edges, hoveredNode, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    // This would require keeping track of node positions
    // For simplicity, we'll skip this for now
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No dependency data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="w-full h-auto bg-gray-900/50 rounded-lg border border-gray-700 cursor-pointer"
        onClick={handleCanvasClick}
      />
      <div className="mt-4 flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-700 rounded-full border border-gray-500"></div>
          <span>Module</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full border border-blue-400"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-600"></div>
          <span>Dependency</span>
        </div>
      </div>
    </motion.div>
  );
}
