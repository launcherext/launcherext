"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  preview: string | null;
  className?: string;
}

export function ImageUpload({ onImageSelect, onImageRemove, preview, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please use PNG, JPG, or WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File too large (${sizeMB}MB). Maximum size is 5MB.`;
    }
    return null;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    processFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(file, reader.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </motion.div>
      )}

      {!preview ? (
        <motion.div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
            isDragging
              ? "border-accent-plasma bg-accent-plasma/5 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
              : "border-white/10 hover:border-accent-plasma/50 bg-glass"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging 
                ? "bg-accent-plasma/20 scale-110 rotate-3" 
                : "bg-gray-800/50 group-hover:bg-gray-800 group-hover:scale-105"
            )}>
              {isDragging ? (
                <Upload className="w-10 h-10 text-accent-plasma animate-bounce" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-500 group-hover:text-gray-300 transition-colors" />
              )}
            </div>

            <div className="space-y-2">
              <p className={cn(
                "font-outfit font-bold text-xl transition-colors",
                isDragging ? "text-accent-plasma" : "text-gray-200"
              )}>
                {isDragging ? "Drop image here" : "Upload Art"}
              </p>
              <p className="text-gray-400 text-sm font-mono">
                Drag & drop or click to browse
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-8 bg-gray-700" />
                <span className="text-[10px] uppercase text-gray-600 font-mono tracking-widest">or</span>
                <div className="h-px w-8 bg-gray-700" />
              </div>
              <p className="text-accent-cyan/80 text-xs font-mono">
                Let AI generate from text
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="relative rounded-xl overflow-hidden bg-glass border border-white/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="p-4 flex items-center justify-center">
            <img
              src={preview}
              alt="Token preview"
              className="max-h-40 rounded-lg object-contain"
            />
          </div>

          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 text-white/70 hover:text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-plasma/20 rounded text-accent-plasma text-xs font-mono flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Ready
          </div>
        </motion.div>
      )}
    </div>
  );
}
