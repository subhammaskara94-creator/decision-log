"use client";

import { useState } from "react";

type DecisionCardProps = {
  id: string;
  title: string;
  date: string;
  confidence: number;
  reviewed: boolean;
  outcome?: "better" | "same" | "worse";

  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (title: string, confidence: number) => void;

  onReview: (outcome: "better" | "same" | "worse") => void;
  onDelete: () => void;
};


export default function DecisionCard({
  title,
  date,
  confidence,
  reviewed,
  outcome,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onReview,
  onDelete,
}: DecisionCardProps) {


  const [editedTitle, setEditedTitle] = useState(title);
  const [editedConfidence, setEditedConfidence] = useState(confidence);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-500">
            {date}
          </p>
        </div>

        {isEditing ? (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setEditedConfidence(value)}
                className={`rounded px-2 py-0.5 text-xs ${
                  editedConfidence === value
                    ? "bg-gray-900 text-white"
                    : "border text-gray-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-500">
            Confidence {confidence}/5
          </span>
        )}
      </div>

      {/* Review section (unchanged) */}
      {!reviewed ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onReview("better")}
            className="rounded-md border px-2 py-0.5 text-xs text-gray-600 border-gray-300
 hover:bg-gray-50"
          >
            Better than expected
          </button>
          <button
            onClick={() => onReview("same")}
            className="rounded-md border px-2 py-0.5 text-xs text-gray-600 border-gray-300
 hover:bg-gray-50"
          >
            As expected
          </button>
          <button
            onClick={() => onReview("worse")}
            className="rounded-md border px-2 py-0.5 text-xs text-gray-600 border-gray-300
 hover:bg-gray-50"
          >
            Worse than expected
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          Outcome:{" "}
          {outcome === "better"
            ? "Better than expected"
            : outcome === "same"
            ? "As expected"
            : "Worse than expected"}
        </p>
      )}

      {/* Edit actions */}
      <div className="mt-3 flex gap-3 text-xs">
            {isEditing ? (
                <>
                <button
                    onClick={() => onSaveEdit(editedTitle, editedConfidence)}
                    className="text-gray-900 hover:underline"
                >
                    Save
                </button>
                <button
                    onClick={onCancelEdit}
                    className="text-gray-500 hover:underline"
                >
                    Cancel
                </button>
                </>
            ) : (
                <>
                <button
                    onClick={onEdit}
                    className="text-gray-500 hover:underline"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="text-red-500 hover:underline"
                >
                    Delete
                </button>
                </>
            )}
        </div>

    </div>
  );
}
