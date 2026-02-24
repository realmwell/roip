"use client";

interface ModelBadgeProps {
  model: string;
}

const MODEL_STYLES: Record<string, { label: string; className: string }> = {
  "gpt-4.1-nano": {
    label: "nano",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  "gpt-4.1-mini": {
    label: "mini",
    className: "bg-blue/20 text-blue border-blue/30",
  },
  "gpt-4.1": {
    label: "full",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

export default function ModelBadge({ model }: ModelBadgeProps) {
  const style = MODEL_STYLES[model] ?? {
    label: model,
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${style.className}`}
    >
      {style.label}
    </span>
  );
}
