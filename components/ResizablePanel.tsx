"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResizablePanelProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onClose?: () => void;
}

export default function ResizablePanel({
  children,
  defaultWidth = 400,
  minWidth = 320,
  maxWidth = 800,
  onClose,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return (
    <motion.div
      ref={panelRef}
      className="fixed top-0 right-0 h-screen bg-darker border-l border-gray-800 z-40 flex shadow-2xl"
      style={{ width: isMinimized ? "60px" : `${width}px` }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Resize Handle - only show when not minimized */}
      {!isMinimized && (
        <div
          className={`w-1 hover:w-1.5 bg-gray-800 hover:bg-primary cursor-col-resize transition-all flex-shrink-0 relative group ${
            isResizing ? "bg-primary w-1.5" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          {/* Visual indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-8 bg-gray-600 rounded-full"></div>
              <div className="w-0.5 h-8 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Minimize/Expand button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition"
            title="Close (ESC)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content - hide when minimized */}
        {!isMinimized && children}
        
        {/* Minimized state indicator */}
        {isMinimized && (
          <div className="flex items-center justify-center h-full">
            <div className="transform -rotate-90 whitespace-nowrap text-gray-400 text-sm font-medium">
              AI Assistant
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
