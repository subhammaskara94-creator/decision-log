"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { signInWithEmail, signOut } from "@/lib/auth";
import NewDecisionForm from "../components/NewDecisionForm";
import DecisionCard from "../components/DecisionCard";


type Decision = {
  id: string;
  title: string;
  date: string;
  confidence: number;
  reviewed: boolean;
  outcome?: "better" | "same" | "worse";
};

export default function Home() {
  // --------------------------------
  // 1. STATE (always at top)
  // --------------------------------
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);



  // --------------------------------
  // 2. EFFECTS (side effects)
  // --------------------------------

  // Auth lifecycle
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Load decisions from localStorage (on mount)
useEffect(() => {
if (!user) return;

fetchDecisions(user.id).then((data) => {
    setDecisions(
    data.map((d) => ({
        id: d.id,
        title: d.title,
        confidence: d.confidence,
        reviewed: d.reviewed,
        outcome: d.outcome,
        date: new Date(d.created_at).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
        ),
    }))
    );
});
}, [user]);


  // Persist decisions to localStorage (on change)
//   useEffect(() => {
//     localStorage.setItem("decisions", JSON.stringify(decisions));
//   }, [decisions]);

  async function fetchDecisions(userId: string) {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching decisions:", error);
    return [];
  }

  return data;
}

async function insertDecision(
  userId: string,
  title: string,
  confidence: number
) {
  const { error } = await supabase.from("decisions").insert({
    user_id: userId,
    title,
    confidence,
    reviewed: false,
  });

  if (error) {
    console.error("Error inserting decision:", error);
    throw error;
  }
}

const deleteDecision = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this decision?"
  );
  if (!confirmed) return;

  const { error } = await supabase
    .from("decisions")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete decision");
    console.error(error);
    return;
  }

  // Remove from local state AFTER successful delete
  setDecisions((prev) => prev.filter((d) => d.id !== id));
};

const updateDecision = async (
  id: string,
  updates: { title?: string; confidence?: number }
) => {
  const { error } = await supabase
    .from("decisions")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Update failed:", error);
    alert(error.message);
    return;
  }

  setDecisions((prev) =>
    prev.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    )
  );
};

const reviewDecision = async (
  id: string,
  outcome: "better" | "same" | "worse"
) => {
  const { error } = await supabase
    .from("decisions")
    .update({
      reviewed: true,
      outcome,
    })
    .eq("id", id);

  if (error) {
    console.error("Review update failed:", error);
    alert(error.message);
    return;
  }

  setDecisions((prev) =>
    prev.map((d) =>
      d.id === id
        ? { ...d, reviewed: true, outcome }
        : d
    )
  );
};

const reviewedDecisions = decisions.filter((d) => d.reviewed);

const outcomeCounts = reviewedDecisions.reduce(
  (acc, d) => {
    if (d.outcome) acc[d.outcome] += 1;
    return acc;
  },
  { better: 0, same: 0, worse: 0 }
);

const highConfidence = reviewedDecisions.filter(
  (d) => d.confidence >= 4
);

const lowConfidence = reviewedDecisions.filter(
  (d) => d.confidence <= 2
);

const successRate = (items: typeof reviewedDecisions) => {
  if (items.length === 0) return null;
  const success = items.filter(
    (d) => d.outcome === "better" || d.outcome === "same"
  ).length;
  return Math.round((success / items.length) * 100);
};


  // --------------------------------
  // 3. UI (JSX)
  // --------------------------------
  return (
  <main className="min-h-screen bg-gray-50 px-6 py-10">
    <div className="mx-auto max-w-5xl">
      {/* App container */}
      <div className="rounded-xl bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Decision Log
          </h1>

          {/* Auth */}
          {!user ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const email = (
                  e.currentTarget as HTMLFormElement
                ).email.value;

                await signInWithEmail(email);
                alert("Check your email for the login link.");
              }}
              className="flex max-w-md gap-2"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
                Sign in
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Signed in as {user.email}</span>
              <button
                onClick={signOut}
                className="text-red-600 hover:underline"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* LEFT — Decisions */}
          <div className="md:col-span-2">
            {/* Primary action */}
            {user && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Log decision
                </button>
              </div>
            )}

            {/* New decision form */}
            {showForm && (
              <div className="mb-6">
                <NewDecisionForm
                  onSave={async (title, confidence) => {
                    if (!user) return;

                    await insertDecision(user.id, title, confidence);

                    const data = await fetchDecisions(user.id);
                    setDecisions(
                      data.map((d) => ({
                        id: d.id,
                        title: d.title,
                        confidence: d.confidence,
                        reviewed: d.reviewed,
                        outcome: d.outcome,
                        date: new Date(d.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        ),
                      }))
                    );

                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Decisions list */}
            <div className="space-y-4">
              {decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  id={decision.id}
                  title={decision.title}
                  date={decision.date}
                  confidence={decision.confidence}
                  reviewed={decision.reviewed}
                  outcome={decision.outcome}
                  isEditing={editingId === decision.id}
                  onEdit={() => setEditingId(decision.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={async (title, confidence) => {
                    await updateDecision(decision.id, {
                      title,
                      confidence,
                    });
                    setEditingId(null);
                  }}
                  onDelete={() => deleteDecision(decision.id)}
                  onReview={(outcome) =>
                    reviewDecision(decision.id, outcome)
                  }
                />
              ))}
            </div>
          </div>

          {/* RIGHT — Insights */}
          <div className="md:col-span-1">
            {reviewedDecisions.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Insights
                </p>

                <p className="text-sm text-gray-600">
                  Reviewed {reviewedDecisions.length} decision
                  {reviewedDecisions.length > 1 ? "s" : ""}.
                </p>

                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-700">
                    Outcomes so far
                  </p>
                  <ul className="mt-1 space-y-0.5 pl-3 text-gray-500">
                    <li>Better: {outcomeCounts.better}</li>
                    <li>As expected: {outcomeCounts.same}</li>
                    <li>Worse: {outcomeCounts.worse}</li>
                  </ul>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Avg confidence:{" "}
                  {(
                    reviewedDecisions.reduce(
                      (sum, d) => sum + d.confidence,
                      0
                    ) / reviewedDecisions.length
                  ).toFixed(1)}
                  /5
                </p>

                {highConfidence.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    High-confidence decisions (4–5):{" "}
                    {successRate(highConfidence)}% successful
                  </p>
                )}

                {lowConfidence.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Low-confidence decisions (1–2):{" "}
                    {successRate(lowConfidence)}% successful
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </main>
);
}
