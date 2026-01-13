"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SubQuestion = {
  id: string;
  label: string;
  notes: string;
};

type Question = {
  id: string;
  title: string;
  subQuestions: SubQuestion[];
  draftAnswerParagraphs: string[];
  status?: "Not started" | "In progress" | "Complete";
};

type GrantOverviewQuestionsPageProps = {
  grantId: string;
};

export default function GrantOverviewQuestionsPage({
  grantId,
}: GrantOverviewQuestionsPageProps) {
  const fallbackQuestions: Question[] = [
    {
      id: "q-0",
      title: "Describe the community need and how this project addresses it.",
      subQuestions: [
        {
          id: "sq-0-0",
          label: "What data supports the need?",
          notes: "Include recent local statistics and trends.",
        },
        {
          id: "sq-0-1",
          label: "Who is impacted most?",
          notes: "Call out priority populations and service gaps.",
        },
      ],
      draftAnswerParagraphs: [],
      status: "In progress",
    },
    {
      id: "q-1",
      title: "Summarize the project approach and key milestones.",
      subQuestions: [
        {
          id: "sq-1-0",
          label: "What are the major work phases?",
          notes: "Planning, design, and implementation phases.",
        },
        {
          id: "sq-1-1",
          label: "What are the deliverables?",
          notes: "Enumerate outputs and community-facing outcomes.",
        },
      ],
      draftAnswerParagraphs: [],
      status: "Not started",
    },
    {
      id: "q-2",
      title: "Explain how the budget aligns with the scope of work.",
      subQuestions: [
        {
          id: "sq-2-0",
          label: "What are the primary cost drivers?",
          notes: "Labor, materials, and vendor services.",
        },
        {
          id: "sq-2-1",
          label: "What matching funds are available?",
          notes: "List local and partner contributions.",
        },
      ],
      draftAnswerParagraphs: [],
      status: "Not started",
    },
  ];
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState("Initializing...");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setProcessingStatus("Loading grant questions...");
        const grantRes = await fetch(
          `http://localhost:8000/api/grants/${grantId}`
        );
        if (!grantRes.ok) {
          throw new Error("Grant not found");
        }

        const { grant } = await grantRes.json();
        const rawQuestions = Array.isArray(grant?.questions)
          ? grant.questions
          : [];

        const processedQuestions: Question[] = rawQuestions.map(
          (
            question: { question: string; sub_questions: string[] },
            index: number
          ) => ({
            id: `q-${index}`,
            title: question.question,
            subQuestions: (question.sub_questions ?? []).map((sq, idx) => ({
              id: `sq-${index}-${idx}`,
              label: sq,
              notes: "",
            })),
            draftAnswerParagraphs: [],
          })
        );

        const finalQuestions =
          processedQuestions.length > 0
            ? processedQuestions
            : fallbackQuestions;

        setQuestions(finalQuestions);
        setCurrentQuestionId(finalQuestions[0]?.id ?? "");
      } catch (error) {
        setQuestions(fallbackQuestions);
        setCurrentQuestionId(fallbackQuestions[0]?.id ?? "");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [grantId]);

  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("grantQuestions", JSON.stringify(questions));
    }
  }, [questions]);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const getQuestionStatus = (
    question: Question
  ): "Not started" | "In progress" | "Complete" => {
    if (question.status) {
      return question.status;
    }
    if (question.draftAnswerParagraphs.length > 0) {
      return "Complete";
    }
    const hasNotes = question.subQuestions.some(
      (sq) => sq.notes.trim().length > 0
    );
    if (hasNotes) {
      return "In progress";
    }
    return "Not started";
  };

  const setQuestionStatus = (
    questionId: string,
    status: "Not started" | "In progress" | "Complete"
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status,
            }
          : q
      )
    );
  };

  const updateSubQuestion = (
    questionId: string,
    subQuestionId: string,
    updates: Partial<SubQuestion>
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: q.subQuestions.map((sq) =>
                sq.id === subQuestionId ? { ...sq, ...updates } : sq
              ),
            }
          : q
      )
    );
  };

  const deleteSubQuestion = (questionId: string, subQuestionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: q.subQuestions.filter(
                (sq) => sq.id !== subQuestionId
              ),
            }
          : q
      )
    );
  };

  const addSubQuestion = (questionId: string) => {
    const newSubQuestion: SubQuestion = {
      id: `sq-${Date.now()}`,
      label: "New sub-question",
      notes: "",
    };
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: [...q.subQuestions, newSubQuestion],
            }
          : q
      )
    );
  };

  const generateDraftAnswer = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setGeneratingDraft(true);
    try {
      const outline = {
        sections: question.subQuestions.map((sq) => ({
          name: sq.label,
          description: sq.notes || "Include relevant details based on context.",
        })),
      };

      const response = await fetch(
        "http://localhost:8000/api/generate_response",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.title,
            outline: outline,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const paragraphs = data.response
          .split("\n\n")
          .filter((p: string) => p.trim());

        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  draftAnswerParagraphs: paragraphs,
                }
              : q
          )
        );
      } else {
        console.error("Failed to generate response");
      }
    } catch (e) {
      console.error("Error generating draft:", e);
    } finally {
      setGeneratingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f1e8] flex">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition"
            href="/dashboard"
          >
            <span aria-hidden="true">&lt;-</span>
            Dashboard
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Monitor a single grant from kickoff through submission.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}`}
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href={`/overview/${grantId}/questions`}
            >
              Questions
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/documents`}
            >
              Documents
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/team`}
            >
              Team
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-10 py-10 flex items-center justify-center">
          <Card className="p-8 bg-white/70 border border-white/70 shadow-xl shadow-black/5 max-w-lg w-full text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Analyzing Grant Document
            </h2>
            <p className="text-slate-600">{processingStatus}</p>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f6f1e8] flex items-center justify-center">
        <Card className="p-8 bg-white/70 border border-white/70 shadow-xl shadow-black/5">
          <p className="text-slate-700">No questions found or extracted.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition"
            href="/dashboard"
          >
            <span aria-hidden="true">&lt;-</span>
            Dashboard
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Monitor a single grant from kickoff through submission.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}`}
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href={`/overview/${grantId}/questions`}
            >
              Questions
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/documents`}
            >
              Documents
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/team`}
            >
              Team
            </Link>
          </nav>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Grant questions
              </p>
              <h1 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                Question navigator
              </h1>
              <p className="text-slate-600 mt-3 max-w-2xl">
                Break down each question, add research, and build draft answers
                directly inside this grant workspace.
              </p>
            </div>
            <Button
              asChild
              className="bg-[#0d2a2b] hover:bg-[#133d3f] text-white font-semibold"
            >
              <Link href="/summary">View summary →</Link>
            </Button>
          </div>

          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0">
              <Card className="p-4 bg-white/70 shadow-xl shadow-black/5 border border-white/70 sticky top-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Questions
                </h2>
                <div className="space-y-2">
                  {questions.map((question) => {
                    const status = getQuestionStatus(question);
                    const isActive = question.id === currentQuestionId;
                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionId(question.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          isActive
                            ? "bg-[#0d2a2b]/10 border border-[#0d2a2b]/40 font-semibold text-slate-900"
                            : "bg-white/70 border border-white/70 hover:bg-white/90 text-slate-700"
                        }`}
                        type="button"
                      >
                        <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">
                          {question.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              status === "Complete"
                                ? "bg-[#0d2a2b] text-white"
                                : status === "In progress"
                                ? "bg-[#f29f5c]/20 text-[#8b4b1a]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="flex-1">
              <Card className="p-8 bg-white/80 shadow-xl shadow-black/5 border border-white/80">
                <div className="mb-6">
                  <h2 className="text-3xl font-semibold text-slate-900 mb-2 whitespace-normal">
                    {currentQuestion.title}
                  </h2>
                  <p className="text-slate-600">
                    Break this question into sub-questions and add your notes.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Status
                    </span>
                    <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-700">
                      {(
                        ["Not started", "In progress", "Complete"] as const
                      ).map((status) => {
                        const isActive =
                          getQuestionStatus(currentQuestion) === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              setQuestionStatus(currentQuestion.id, status)
                            }
                            className={`px-3 py-1 rounded-full transition ${
                              isActive
                                ? "bg-[#0d2a2b] text-white"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Sub-questions
                  </h3>
                  {currentQuestion.subQuestions.map((subQ, index) => (
                    <div
                      key={subQ.id}
                      className="border border-white/70 bg-white/60 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-slate-500 mt-2">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={subQ.label}
                          onChange={(e) =>
                            updateSubQuestion(currentQuestion.id, subQ.id, {
                              label: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 text-base font-semibold text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d2a2b] focus:border-[#0d2a2b] bg-white"
                          placeholder="Sub-question"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            deleteSubQuestion(currentQuestion.id, subQ.id)
                          }
                          className="px-3 py-2 text-sm font-semibold text-[#8b4b1a] hover:text-[#6f3a12] hover:bg-[#f29f5c]/15 rounded-lg transition-colors"
                          aria-label="Delete sub-question"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="ml-8">
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Notes / Context / Research
                        </label>
                        <textarea
                          value={subQ.notes}
                          onChange={(e) =>
                            updateSubQuestion(currentQuestion.id, subQ.id, {
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add context or research you've already done..."
                          rows={4}
                          className="w-full px-4 py-3 text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d2a2b] focus:border-[#0d2a2b] placeholder-slate-400 text-slate-900 resize-y bg-white"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSubQuestion(currentQuestion.id)}
                    className="px-4 py-2 text-sm font-semibold text-[#0d2a2b] bg-white border border-[#0d2a2b] rounded-lg hover:bg-[#0d2a2b]/10 transition-colors"
                  >
                    + Add Sub-question
                  </button>
                </div>

                <div className="mb-8">
                  <Button
                    onClick={() => generateDraftAnswer(currentQuestion.id)}
                    disabled={generatingDraft}
                    className="bg-[#0d2a2b] hover:bg-[#133d3f] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:bg-slate-400"
                  >
                    {generatingDraft
                      ? "Generating..."
                      : "Generate Draft Answer"}
                  </Button>
                </div>

                {currentQuestion.draftAnswerParagraphs.length > 0 && (
                  <div className="border-t border-white/80 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-slate-900">
                        Draft Answer
                      </h3>
                      <button
                        onClick={() => {
                          const text =
                            currentQuestion.draftAnswerParagraphs.join("\n\n");
                          navigator.clipboard.writeText(text);
                        }}
                        className="px-4 py-2 text-sm font-semibold text-[#0d2a2b] bg-white border border-[#0d2a2b] rounded-lg hover:bg-[#0d2a2b]/10 transition-colors"
                      >
                        Copy to clipboard
                      </button>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <textarea
                          value={currentQuestion.draftAnswerParagraphs.join(
                            "\n\n"
                          )}
                          onChange={(e) => {
                            const paragraphs = e.target.value
                              .split("\n\n")
                              .filter((p) => p.trim());
                            setQuestions((prev) =>
                              prev.map((q) =>
                                q.id === currentQuestion.id
                                  ? {
                                      ...q,
                                      draftAnswerParagraphs: paragraphs,
                                    }
                                  : q
                              )
                            );
                          }}
                          rows={12}
                          className="w-full px-4 py-3 text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d2a2b] focus:border-[#0d2a2b] text-slate-900 resize-y font-normal h-auto bg-white"
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#f29f5c]/15 border border-[#f29f5c]/30 rounded-lg">
                      <p className="text-sm text-[#6f3a12]">
                        Tip: Adjust sub-questions or notes and regenerate the
                        draft to refresh your narrative.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
