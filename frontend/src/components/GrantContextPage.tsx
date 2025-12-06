"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContextCard {
  id: number;
  title: string;
  mode: "text" | "file";
  textValue: string;
  file: File | null;
}

export default function GrantContextPage() {
  const router = useRouter();
  const [cards, setCards] = useState<ContextCard[]>([
    {
      id: 1,
      title: "Relevant Files",
      mode: "file",
      textValue: "",
      file: null,
    },
    {
      id: 2,
      title: "Budget",
      mode: "text",
      textValue: "",
      file: null,
    },
    {
      id: 3,
      title: "Plan of Action",
      mode: "text",
      textValue: "",
      file: null,
    },
    {
      id: 4,
      title: "Additional Research",
      mode: "text",
      textValue: "",
      file: null,
    },
  ]);

  const [nextId, setNextId] = useState(5);
  const [touched, setTouched] = useState<{ [key: number]: boolean }>({});

  const updateCard = (id: number, updates: Partial<ContextCard>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const deleteCard = (id: number) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const addCard = () => {
    const newCard: ContextCard = {
      id: nextId,
      title: "New Section",
      mode: "text",
      textValue: "",
      file: null,
    };
    setCards((prev) => [...prev, newCard]);
    setNextId((prev) => prev + 1);
  };

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateCard(id, { file });
  };

  const isCardValid = (card: ContextCard): boolean => {
    if (card.mode === "text") {
      return card.textValue.trim().length > 0;
    } else {
      return card.file !== null;
    }
  };

  const allCardsValid = cards.every(isCardValid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all cards as touched
    const newTouched: { [key: number]: boolean } = {};
    cards.forEach((card) => {
      newTouched[card.id] = true;
    });
    setTouched(newTouched);

    if (allCardsValid) {
      const output = cards.map((card) => ({
        id: card.id,
        title: card.title,
        mode: card.mode,
        textValue: card.textValue,
        fileName: card.file?.name || null,
      }));
      console.log(output);
      // Navigate to questions page
      router.push("/questions");
    }
  };

  const getCardError = (card: ContextCard): string | null => {
    if (!touched[card.id]) return null;
    if (!isCardValid(card)) {
      if (card.mode === "text") {
        return "Please add some text.";
      } else {
        return "Please upload a file.";
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Grant Context</h1>
          <p className="text-lg text-gray-700">
            Add key documents and narrative context so we can help structure your application.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cards Container */}
          <div className="space-y-4">
            {cards.map((card) => {
              const error = getCardError(card);
              return (
                <Card key={card.id} className="p-6 bg-white shadow-md border border-gray-200">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Editable Title */}
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCard(card.id, { title: e.target.value })}
                      className="flex-1 min-w-[150px] px-3 py-2 text-base font-semibold text-gray-900 
                        border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                        focus:border-blue-500"
                      placeholder="Section title"
                    />

                    {/* Mode Toggle */}
                    <div className="flex rounded-lg border-2 border-gray-300 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCard(card.id, { mode: "text" })}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${
                          card.mode === "text"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCard(card.id, { mode: "file" })}
                        className={`px-4 py-2 text-sm font-semibold transition-colors border-l-2 border-gray-300 ${
                          card.mode === "file"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Upload
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 
                        hover:bg-red-50 rounded-lg transition-colors border-2 border-red-300"
                      aria-label="Delete card"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-2">
                    {card.mode === "text" ? (
                      <textarea
                        value={card.textValue}
                        onChange={(e) => updateCard(card.id, { textValue: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, [card.id]: true }))}
                        placeholder="Type details here..."
                        rows={6}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          placeholder-gray-400 text-gray-900 resize-y"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                          onChange={(e) => handleFileChange(card.id, e)}
                          onBlur={() => setTouched((prev) => ({ ...prev, [card.id]: true }))}
                          className="block w-full text-sm text-gray-700
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-lg file:border file:border-gray-300
                            file:text-sm file:font-semibold
                            file:bg-white file:text-gray-900
                            hover:file:bg-gray-50
                            cursor-pointer border border-gray-300 rounded-lg"
                        />
                        {card.file && (
                          <p className="text-sm text-green-700 font-medium bg-green-50 p-2 rounded">
                            ✓ Selected: {card.file.name}
                          </p>
                        )}
                      </div>
                    )}
                    {error && (
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add Section Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addCard}
              className="px-6 py-3 text-base font-semibold text-blue-600 bg-white 
                border-2 border-blue-600 rounded-lg hover:bg-blue-50 
                transition-colors shadow-sm"
            >
              + Add Section
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={!allCardsValid}
              className="w-full sm:w-auto sm:min-w-[280px] bg-blue-600 hover:bg-blue-700
                disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300
                text-white font-bold text-lg py-3 px-8 rounded-lg
                transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Save Context &amp; Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
