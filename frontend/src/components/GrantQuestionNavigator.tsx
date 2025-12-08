"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
};

export default function GrantQuestionNavigator() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState("Initializing...");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setProcessingStatus("Extracting narrative questions from document...");
        const extractRes = await fetch("http://localhost:8000/api/extract_questions", {
          method: "POST",
        });
        if (!extractRes.ok) throw new Error("Failed to extract questions");
        
        const { questions: rawQuestions } = await extractRes.json();
        const processedQuestions: Question[] = [];

        for (let i = 0; i < rawQuestions.length; i++) {
          const qText = rawQuestions[i];
          setProcessingStatus(`Breaking down question ${i + 1} of ${rawQuestions.length}...`);
          
          const breakdownRes = await fetch("http://localhost:8000/api/break_down_question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: qText }),
          });
          
          let subQuestionsList: string[] = [];
          if (breakdownRes.ok) {
            const data = await breakdownRes.json();
            subQuestionsList = data.sub_questions;
          } else {
            subQuestionsList = ["Analyze this aspect."]; // Fallback
          }

          processedQuestions.push({
            id: `q-${i}`,
            title: qText.length > 50 ? qText.substring(0, 50) + "..." : qText, // Long title truncated
            subQuestions: subQuestionsList.map((sq, idx) => ({
              id: `sq-${i}-${idx}`,
              label: sq,
              notes: ""
            })),
            draftAnswerParagraphs: []
          });
        }

        setQuestions(processedQuestions);
        if (processedQuestions.length > 0) {
          setCurrentQuestionId(processedQuestions[0].id);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Fallback to empty or show error
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Persist to localStorage whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("grantQuestions", JSON.stringify(questions));
    }
  }, [questions]);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const getQuestionStatus = (question: Question): "Not started" | "In progress" | "Complete" => {
    if (question.draftAnswerParagraphs.length > 0) {
      return "Complete";
    }
    const hasNotes = question.subQuestions.some((sq) => sq.notes.trim().length > 0);
    if (hasNotes) {
      return "In progress";
    }
    return "Not started";
  };

  const updateSubQuestion = (questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => {
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
              subQuestions: q.subQuestions.filter((sq) => sq.id !== subQuestionId),
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
      // Build the outline from sub-questions and notes
      const outline = {
        sections: question.subQuestions.map(sq => ({
          name: sq.label,
          description: sq.notes || "Include relevant details based on the context."
        }))
      };

      // Call Backend
      const response = await fetch("http://localhost:8000/api/generate_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.title, // Pass the full title/question
          outline: outline
        })
      });

      if (response.ok) {
        const data = await response.json();
        const paragraphs = data.response.split("\n\n").filter((p: string) => p.trim());
        
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Grant Document</h2>
            <p className="text-gray-600">{processingStatus}</p>
        </div>
     );
  }

  if (!currentQuestion) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <p>No questions found or extracted.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Question Navigator</h1>
            <p className="text-lg text-gray-700">
              Break down each question, add your research, and generate draft answers.
            </p>
          </div>
          <Button
            onClick={() => router.push("/summary")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-base 
              py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            View Summary →
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* LEFT: Table of Contents */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-4 bg-white shadow-md border border-gray-200 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Questions</h2>
              <div className="space-y-2">
                {questions.map((question) => {
                  const status = getQuestionStatus(question);
                  const isActive = question.id === currentQuestionId;
                  return (
                    <div
                      key={question.id}
                      onClick={() => setCurrentQuestionId(question.id)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? "bg-blue-100 border-2 border-blue-500 font-semibold"
                          : "bg-white border-2 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {question.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            status === "Complete"
                              ? "bg-green-100 text-green-700"
                              : status === "In progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT: Question Details */}
          <div className="flex-1">
            <Card className="p-8 bg-white shadow-md border border-gray-200">
              {/* Question Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-gray-600">
                  Break this question into sub-questions and add your notes.
                </p>
              </div>

              {/* Sub-questions Editor */}
              <div className="space-y-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900">Sub-questions</h3>
                {currentQuestion.subQuestions.map((subQ, index) => (
                  <div key={subQ.id} className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
                    {/* Sub-question Label */}
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-500 mt-2">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={subQ.label}
                        onChange={(e) =>
                          updateSubQuestion(currentQuestion.id, subQ.id, { label: e.target.value })
                        }
                        className="flex-1 px-3 py-2 text-base font-semibold text-gray-900 
                          border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                          focus:border-blue-500"
                        placeholder="Sub-question"
                      />
                      <button
                        type="button"
                        onClick={() => deleteSubQuestion(currentQuestion.id, subQ.id)}
                        className="px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 
                          hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete sub-question"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Notes Textarea */}
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes / Context / Research
                      </label>
                      <textarea
                        value={subQ.notes}
                        onChange={(e) =>
                          updateSubQuestion(currentQuestion.id, subQ.id, { notes: e.target.value })
                        }
                        placeholder="Add context or research you've already done..."
                        rows={4}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          placeholder-gray-400 text-gray-900 resize-y"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Sub-question Button */}
                <button
                  type="button"
                  onClick={() => addSubQuestion(currentQuestion.id)}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 bg-white 
                    border-2 border-blue-600 rounded-lg hover:bg-blue-50 
                    transition-colors"
                >
                  + Add Sub-question
                </button>
              </div>

              {/* Generate Draft Answer Button */}
              <div className="mb-8">
                <Button
                  onClick={() => generateDraftAnswer(currentQuestion.id)}
                  disabled={generatingDraft}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base 
                    py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg
                    disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {generatingDraft ? "Generating..." : "Generate Draft Answer"}
                </Button>
              </div>

              {/* Draft Answer Preview */}
              {currentQuestion.draftAnswerParagraphs.length > 0 && (
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Draft Answer</h3>
                    <button
                      onClick={() => {
                        const text = currentQuestion.draftAnswerParagraphs.join("\n\n");
                        navigator.clipboard.writeText(text);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 
                        border-2 border-blue-600 rounded-lg hover:bg-blue-100 
                        transition-colors"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>

                  {/* Main answer display */}
                  <div className="flex gap-6">
                    {/* Left: Paragraph indicators */}
                    <div className="w-48 flex-shrink-0 space-y-4">
                      {currentQuestion.draftAnswerParagraphs.map((_, index) => {
                        const subQuestion = currentQuestion.subQuestions[index];
                        return (
                          <div
                            key={index}
                            className="text-xs font-medium text-gray-600 bg-gray-100 
                              px-3 py-2 rounded-lg border-l-4 border-blue-500"
                            style={{ minHeight: "60px" }}
                          >
                            <div className="text-blue-700 font-semibold mb-1">Para {index + 1}</div>
                            {subQuestion?.label || `Section ${index + 1}`}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Continuous paragraph text */}
                    <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
                      <div className="prose prose-gray max-w-none">
                        {currentQuestion.draftAnswerParagraphs.map((paragraph, index) => (
                          <p
                            key={index}
                            className="text-base text-gray-900 leading-relaxed mb-4 last:mb-0"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Tip:</strong> You can edit sub-questions or notes and regenerate 
                      the draft answer to update the content. Use the copy button to paste into your grant application.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
