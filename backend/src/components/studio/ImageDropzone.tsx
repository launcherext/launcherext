"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import { clsx } from "clsx";

interface ImageDropzoneProps {
  value: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

/**
 * ImageDropzone - Drag and drop image upload
 * 
 * Obsidian Minimal design:
 * - Dashed border when empty
 * - Solid accent border when has image
 * - Subtle hover effects
 * - Clean upload/remove states
 */
export function ImageDropzone({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB`);
      return;
    }

    // Read file and create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
      />

      <motion.div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={clsx(
          "relative cursor-pointer rounded-xl transition-all duration-150",
          "border-2",
          value
            ? "border-solid border-accent/50 bg-accent/5"
            : isDragging
              ? "border-dashed border-accent bg-accent/10"
              : "border-dashed border-gray-700 hover:border-gray-600 hover:bg-gray-900/50"
        )}
      >
        <AnimatePresence mode="wait">
          {value ? (
            // Preview state
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="flex items-center gap-4">
                {/* Image preview */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img
                    src={value}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Success indicator */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                </div>

                {/* Info and actions */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Image uploaded
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to replace or drag a new image
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={handleRemove}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            // Empty state
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div
                className={clsx(
                  "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors",
                  isDragging ? "bg-accent/20" : "bg-gray-800"
                )}
              >
                {isDragging ? (
                  <Upload className="w-6 h-6 text-accent" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                )}
              </div>

              <p
                className={clsx(
                  "text-sm font-medium transition-colors",
                  isDragging ? "text-accent" : "text-gray-300"
                )}
              >
                {isDragging ? "Drop your image" : "Drop image here"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                or click to browse
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-error mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
