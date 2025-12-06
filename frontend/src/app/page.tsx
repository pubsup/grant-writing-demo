"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchFromBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/health");
      const data = await response.json();
      setMessage(data.message || "Connected to backend!");
    } catch (error) {
      setMessage("Error: Could not connect to backend. Make sure it's running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-secondary">
      <main className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Grant Writing Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Next.js + FastAPI Boilerplate
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>Next.js with TypeScript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Next.js 16 App Router</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>shadcn/ui Components</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend</CardTitle>
              <CardDescription>FastAPI with Python</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>FastAPI Framework</li>
                <li>CORS Middleware</li>
                <li>REST API Endpoints</li>
                <li>Python Type Hints</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backend Connection Test</CardTitle>
            <CardDescription>
              Test the connection between frontend and backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchFromBackend} disabled={loading}>
              {loading ? "Connecting..." : "Test Backend Connection"}
            </Button>
            {message && (
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
              Next.js Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener noreferrer">
              FastAPI Docs
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
