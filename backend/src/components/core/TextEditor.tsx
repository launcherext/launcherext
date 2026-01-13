"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Type,
  Palette,
  Sparkles,
  Download,
  RotateCcw,
  Minus,
  Check,
} from "lucide-react";
import { TextLayerComponent } from "./TextLayer";
import {
  TextLayer,
  createTextLayer,
  renderBannerWithText,
  AVAILABLE_FONTS,
  COLOR_PRESETS,
} from "@/lib/text-editor-utils";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  isOpen: boolean;
  onClose: () => void;
  baseImageUrl: string;
  onApply: (editedImageUrl: string) => void;
}

export function TextEditor({ isOpen, onClose, baseImageUrl, onApply }: TextEditorProps) {
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Get selected layer
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Update container size
  useEffect(() => {
    if (!containerRef.current || !isOpen) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  // Add new text layer
  const addLayer = useCallback(() => {
    const newLayer = createTextLayer("New Text");
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  // Update a layer
  const updateLayer = useCallback((id: string, updates: Partial<TextLayer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  }, []);

  // Delete a layer
  const deleteLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);

  // Handle background click to deselect
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedLayerId(null);
    }
  }, []);

  // Apply changes and close
  const handleApply = async () => {
    if (layers.length === 0) {
      onClose();
      return;
    }

    setIsApplying(true);
    try {
      const editedImageUrl = await renderBannerWithText(baseImageUrl, layers);
      onApply(editedImageUrl);
      onClose();
    } catch (error) {
      console.error("Failed to apply text:", error);
    } finally {
      setIsApplying(false);
    }
  };

  // Reset all layers
  const handleReset = () => {
    setLayers([]);
    setSelectedLayerId(null);
  };

  // Close and discard
  const handleDiscard = () => {
    setLayers([]);
    setSelectedLayerId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-moss flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-concrete-800">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-accent-acid" />
              <h2 className="font-syne font-bold text-lg text-white">Text Editor</h2>
              <span className="px-2 py-0.5 bg-concrete-800 rounded text-xs font-mono text-concrete-400">
                {layers.length} layer{layers.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-2 text-concrete-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleDiscard}
                className="px-3 py-2 text-concrete-400 hover:text-white transition-colors text-sm font-medium"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-4 py-2 bg-accent-acid text-moss font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isApplying ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas area */}
            <div className="flex-1 p-8 flex items-center justify-center bg-concrete-950">
              <div
                ref={containerRef}
                onClick={handleBackgroundClick}
                className="relative w-full max-w-5xl aspect-[3/1] bg-concrete-900 rounded-xl overflow-hidden border border-concrete-700 shadow-2xl"
                style={{
                  backgroundImage: `url(${baseImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Text layers */}
                <AnimatePresence>
                  {layers.map((layer) => (
                    <TextLayerComponent
                      key={layer.id}
                      layer={layer}
                      isSelected={layer.id === selectedLayerId}
                      containerWidth={containerSize.width}
                      containerHeight={containerSize.height}
                      onSelect={() => setSelectedLayerId(layer.id)}
                      onUpdate={(updates) => updateLayer(layer.id, updates)}
                      onDelete={() => deleteLayer(layer.id)}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {layers.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
                    <Type className="w-12 h-12 text-concrete-500 mb-4" />
                    <p className="text-concrete-400 font-mono text-sm">No text layers</p>
                    <button
                      onClick={addLayer}
                      className="mt-4 px-4 py-2 bg-accent-acid text-moss font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Text
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-concrete-900 border-l border-concrete-800 flex flex-col overflow-hidden">
              {/* Add layer button */}
              <div className="p-4 border-b border-concrete-800">
                <button
                  onClick={addLayer}
                  className="w-full py-3 bg-concrete-800 hover:bg-concrete-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Text Layer
                </button>
              </div>

              {/* Layer properties */}
              {selectedLayer ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Text input */}
                  <div>
                    <label className="block text-xs font-mono text-concrete-400 uppercase mb-2">
                      Text
                    </label>
                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="w-full px-3 py-2 bg-concrete-800 border border-concrete-700 rounded-lg text-white focus:outline-none focus:border-accent-acid"
                    />
                  </div>

                  {/* Font family */}
                  <div>
                    <label className="block text-xs font-mono text-concrete-400 uppercase mb-2">
                      Font
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => updateLayer(selectedLayer.id, { fontFamily: font.id })}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm transition-colors text-left",
                            selectedLayer.fontFamily === font.id
                              ? "bg-accent-acid/20 border border-accent-acid text-accent-acid"
                              : "bg-concrete-800 border border-concrete-700 text-concrete-300 hover:border-concrete-500"
                          )}
                          style={{ fontFamily: font.id }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font size */}
                  <div>
                    <label className="block text-xs font-mono text-concrete-400 uppercase mb-2">
                      Size: {selectedLayer.fontSize}px
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateLayer(selectedLayer.id, {
                            fontSize: Math.max(12, selectedLayer.fontSize - 4),
                          })
                        }
                        className="p-2 bg-concrete-800 hover:bg-concrete-700 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="12"
                        max="200"
                        value={selectedLayer.fontSize}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })
                        }
                        className="flex-1"
                      />
                      <button
                        onClick={() =>
                          updateLayer(selectedLayer.id, {
                            fontSize: Math.min(200, selectedLayer.fontSize + 4),
                          })
                        }
                        className="p-2 bg-concrete-800 hover:bg-concrete-700 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-mono text-concrete-400 uppercase mb-2">
                      <Palette className="w-3 h-3 inline mr-1" />
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateLayer(selectedLayer.id, { color })}
                          className={cn(
                            "w-8 h-8 rounded-lg border-2 transition-all",
                            selectedLayer.color === color
                              ? "border-accent-acid scale-110"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="color"
                        value={selectedLayer.color}
                        onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Effects */}
                  <div>
                    <label className="block text-xs font-mono text-concrete-400 uppercase mb-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Effects
                    </label>
                    <div className="space-y-3">
                      {/* Shadow */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLayer.effects.shadow}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              effects: { ...selectedLayer.effects, shadow: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-accent-acid"
                        />
                        <span className="text-sm text-concrete-300">Shadow</span>
                      </label>

                      {/* Outline */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLayer.effects.outline}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              effects: { ...selectedLayer.effects, outline: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-accent-acid"
                        />
                        <span className="text-sm text-concrete-300">Outline</span>
                        {selectedLayer.effects.outline && (
                          <input
                            type="color"
                            value={selectedLayer.effects.outlineColor}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, {
                                effects: { ...selectedLayer.effects, outlineColor: e.target.value },
                              })
                            }
                            className="w-6 h-6 rounded cursor-pointer ml-auto"
                          />
                        )}
                      </label>

                      {/* Glow */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLayer.effects.glow}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              effects: { ...selectedLayer.effects, glow: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-accent-acid"
                        />
                        <span className="text-sm text-concrete-300">Glow</span>
                        {selectedLayer.effects.glow && (
                          <input
                            type="color"
                            value={selectedLayer.effects.glowColor}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, {
                                effects: { ...selectedLayer.effects, glowColor: e.target.value },
                              })
                            }
                            className="w-6 h-6 rounded cursor-pointer ml-auto"
                          />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Delete layer */}
                  <button
                    onClick={() => deleteLayer(selectedLayer.id)}
                    className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Layer
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <Type className="w-8 h-8 text-concrete-600 mb-3" />
                  <p className="text-concrete-500 text-sm">Select a text layer to edit</p>
                  <p className="text-concrete-600 text-xs mt-1">or add a new one</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
