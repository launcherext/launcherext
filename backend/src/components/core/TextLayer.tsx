"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { type TextLayer as TextLayerType } from "@/lib/text-editor-utils";
import { cn } from "@/lib/utils";

interface TextLayerProps {
  layer: TextLayerType;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextLayerType>) => void;
  onDelete: () => void;
}

export function TextLayerComponent({
  layer,
  isSelected,
  containerWidth,
  containerHeight,
  onSelect,
  onUpdate,
  onDelete,
}: TextLayerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, layerX: 0, layerY: 0 });

  // Calculate pixel position from relative position
  const pixelX = layer.x * containerWidth;
  const pixelY = layer.y * containerHeight;

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.preventDefault();
      e.stopPropagation();

      onSelect();
      setIsDragging(true);

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        layerX: layer.x,
        layerY: layer.y,
      };
    },
    [isEditing, layer.x, layer.y, onSelect]
  );

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Convert pixel delta to relative delta
      const relativeX = deltaX / containerWidth;
      const relativeY = deltaY / containerHeight;

      // Calculate new position (clamped to 0-1)
      const newX = Math.max(0.05, Math.min(0.95, dragStartRef.current.layerX + relativeX));
      const newY = Math.max(0.05, Math.min(0.95, dragStartRef.current.layerY + relativeY));

      onUpdate({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, containerWidth, containerHeight, onUpdate]);

  // Handle double-click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ text: e.target.value });
  };

  // Handle blur to stop editing
  const handleBlur = () => {
    setIsEditing(false);
    if (!layer.text.trim()) {
      onUpdate({ text: "Text" });
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (!isEditing && isSelected) {
        onDelete();
      }
    }
  };

  // Base width for scaling (matches the export canvas size)
  const BASE_WIDTH = 1500;
  const scale = containerWidth > 0 ? containerWidth / BASE_WIDTH : 1;

  // Build text style with scaling
  const textStyle: React.CSSProperties = {
    fontSize: layer.fontSize * scale,
    fontFamily: layer.fontFamily,
    color: layer.color,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
    textShadow: layer.effects.shadow
      ? `2px 2px ${layer.effects.shadowBlur * scale}px ${layer.effects.shadowColor}`
      : undefined,
    WebkitTextStroke: layer.effects.outline
      ? `${layer.effects.outlineWidth * scale}px ${layer.effects.outlineColor}`
      : undefined,
    filter: layer.effects.glow
      ? `drop-shadow(0 0 ${layer.effects.glowBlur * scale}px ${layer.effects.glowColor})`
      : undefined,
  };

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: "absolute",
        left: pixelX,
        top: pixelY,
        transform: "translate(-50%, -50%)",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        "select-none outline-none",
        isSelected && "ring-2 ring-accent-acid ring-offset-2 ring-offset-transparent rounded"
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={layer.text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...textStyle,
            background: "transparent",
            border: "none",
            outline: "none",
            width: "auto",
            minWidth: "100px",
          }}
          className="text-center"
        />
      ) : (
        <span style={textStyle}>{layer.text}</span>
      )}

      {/* Selection handles */}
      {isSelected && !isEditing && (
        <>
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
          >
            ×
          </button>

          {/* Resize hint */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-concrete-400 font-mono whitespace-nowrap">
            Double-click to edit
          </div>
        </>
      )}
    </motion.div>
  );
}
