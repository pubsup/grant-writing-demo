"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ApplicantInfo = {
  fullName: string;
  county: string;
  role: string;
};

type QuestionSummary = {
  id: string;
  title: string;
  answer: string;
};

export default function GrantSummaryPage() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const [questionSummaries, setQuestionSummaries] = useState<QuestionSummary[]>([]);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("grantQuestions");
    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions);
        const summaries = questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          answer: q.draftAnswerParagraphs.join("\n\n") || "No answer draft generated."
        }));
        setQuestionSummaries(summaries);
      } catch (e) {
        console.error("Failed to parse saved questions", e);
      }
    }
  }, []);

  // Placeholder data - can be replaced with props or context later
  const applicant: ApplicantInfo = {
    fullName: "Jane Smith",
    county: "Frederick County, MD",
    role: "Grants Manager",
  };

  const buildSummaryText = (): string => {
    let text = "";

    // Applicant info
    text += `Name: ${applicant.fullName}\n`;
    text += `County: ${applicant.county}\n`;
    text += `Role: ${applicant.role}\n\n`;

    // Questions and answers
    questionSummaries.forEach((q, index) => {
      text += `${q.title}\n`;
      text += `${q.answer}\n`;
      // Add extra newline between questions, but not after the last one
      if (index < questionSummaries.length - 1) {
        text += "\n";
      }
    });

    return text;
  };

  const handleCopy = async () => {
    try {
      const summaryText = buildSummaryText();
      
      if (!navigator.clipboard) {
        console.error("Clipboard API not available");
        setCopyError(true);
        setTimeout(() => setCopyError(false), 3000);
        return;
      }

      await navigator.clipboard.writeText(summaryText);
      console.log("Copied to clipboard:");
      console.log(summaryText);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const renderAnswer = (answer: string) => {
    // Split on double newlines to create paragraphs
    const paragraphs = answer.split("\n\n");
    return paragraphs.map((para, index) => (
      <p key={index} className="text-base text-gray-700 leading-relaxed mt-2 first:mt-0">
        {para}
      </p>
    ));
  };

  const canCopy = applicant.fullName && questionSummaries.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Grant Summary</h1>
          <p className="text-lg text-gray-700">
            Review the applicant information and drafted responses before exporting.
          </p>
        </div>

        {/* Copy Button */}
        <div className="flex justify-end items-center gap-3">
          {copied && (
            <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded">
              ✓ Copied!
            </span>
          )}
          {copyError && (
            <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded">
              ✗ Copy failed
            </span>
          )}
          <Button
            onClick={handleCopy}
            disabled={!canCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
              py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg
              disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            📋 Copy All to Clipboard
          </Button>
        </div>

        {/* Applicant Info */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Applicant Information</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">Name:</span>
              <span className="text-gray-900">{applicant.fullName}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">County:</span>
              <span className="text-gray-900">{applicant.county}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">Role:</span>
              <span className="text-gray-900">{applicant.role}</span>
            </div>
          </div>
        </Card>

        {/* Questions & Answers */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Grant Responses</h2>
          <div className="space-y-8">
            {questionSummaries.map((question) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {question.title}
                </h3>
                <div className="space-y-3">
                  {renderAnswer(question.answer)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Actions */}
        <div className="flex justify-center pt-4">
          <p className="text-sm text-gray-600">
            Use the copy button above to paste this summary into your grant application.
          </p>
        </div>
      </div>
    </div>
  );
}
