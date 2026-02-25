"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Database } from "lucide-react";

const REQUIRED_FILES = [
  { key: "request_summary", label: "request_summary.ndjson" },
  { key: "openai_usage", label: "openai_usage.ndjson" },
  { key: "spans_retrieval", label: "spans_retrieval.ndjson" },
  { key: "spans_openai_chat", label: "spans_openai_chat.ndjson" },
  { key: "spans_inventory_call", label: "spans_inventory_call.ndjson" },
] as const;

interface UploadZoneProps {
  onLoadSample: () => void;
  onUpload: (files: Record<string, string>) => void;
  loading: boolean;
}

export default function UploadZone({
  onLoadSample,
  onUpload,
  loading,
}: UploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles = { ...uploadedFiles };

      for (const file of Array.from(fileList)) {
        const baseName = file.name.replace(".ndjson", "");
        const match = REQUIRED_FILES.find((f) => f.key === baseName);
        if (match) {
          const text = await file.text();
          newFiles[match.key] = text;
        }
      }

      setUploadedFiles(newFiles);

      // Auto-submit if all files are present
      const allPresent = REQUIRED_FILES.every((f) => newFiles[f.key]);
      if (allPresent) {
        onUpload(newFiles);
      }
    },
    [uploadedFiles, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const uploadedCount = REQUIRED_FILES.filter(
    (f) => uploadedFiles[f.key]
  ).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-fg">
          RAG Pipeline Assessment
        </h2>
        <p className="text-sm text-muted-fg">
          Upload your NDJSON telemetry logs or load the sample dataset to
          generate a full pipeline health report with cost optimization
          scenarios.
        </p>
      </div>

      {/* Sample data button */}
      <button
        onClick={onLoadSample}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-blue/30 bg-blue/5 px-6 py-4 text-sm font-medium text-blue hover:bg-blue/10 hover:border-blue/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Database className="h-5 w-5" />
        {loading ? "Analyzing..." : "Load Sample Dataset"}
        <span className="text-xs text-muted-fg font-normal">
          (1,200 requests, 5 telemetry files)
        </span>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-xs text-muted-fg uppercase tracking-wider">
          or upload your own
        </span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center ${
          dragOver
            ? "border-blue bg-blue/5"
            : "border-surface-border bg-surface"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".ndjson"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-fg" />
        <p className="text-sm text-fg font-medium">
          Drop .ndjson files here or click to browse
        </p>
        <p className="text-xs text-muted-fg mt-1">
          {uploadedCount} of {REQUIRED_FILES.length} files loaded
        </p>
      </div>

      {/* File checklist */}
      <div className="rounded-xl border border-surface-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-fg mb-3">
          Required Files
        </p>
        <div className="space-y-2">
          {REQUIRED_FILES.map((f) => {
            const present = !!uploadedFiles[f.key];
            return (
              <div
                key={f.key}
                className="flex items-center gap-2 text-sm"
              >
                {present ? (
                  <CheckCircle2 className="h-4 w-4 text-green flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-fg flex-shrink-0" />
                )}
                <span className={present ? "text-fg" : "text-muted-fg"}>
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
