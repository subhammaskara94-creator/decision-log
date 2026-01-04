"use client";

import { useState } from "react";

type NewDecisionFormProps = {
  onSave: (title: string, confidence: number) => void;
  onCancel: () => void;
};

export default function NewDecisionForm({
  onSave,
  onCancel,
}: NewDecisionFormProps) {
  const [title, setTitle] = useState("");
  const [confidence, setConfidence] = useState(3);

  return (
    <div className="mt-6 rounded-lg border border-gray-200 p-4">
      <p className="mb-3 text-sm font-medium text-gray-900">
        New decision
      </p>

      {/* Title input */}
      <input
        type="text"
        placeholder="Decision title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="mt-4">
        <p className="mb-1 text-xs text-gray-500">Confidence</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setConfidence(value)}
              className={`rounded-md px-3 py-1 text-sm ${
                confidence === value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            if (!title.trim()) return;
            onSave(title, confidence);
            setTitle("");
            setConfidence(3);
          }}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Save
        </button>

        <button
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
