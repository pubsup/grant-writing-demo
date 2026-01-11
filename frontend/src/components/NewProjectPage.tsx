"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [county, setCounty] = useState<string>("");
  const [errors, setErrors] = useState<{
    file?: string;
    department?: string;
    county?: string;
  }>({});
  const [touched, setTouched] = useState<{
    file?: boolean;
    department?: boolean;
    county?: boolean;
  }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setFileName("");
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fileName) {
      newErrors.file = "Please upload a grant document.";
    }
    if (!department.trim()) {
      newErrors.department = "Please enter your department name.";
    }
    if (!county.trim()) {
      newErrors.county = "Please enter your county.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      file: true,
      department: true,
      county: true,
    });

    if (validate()) {
      try {
        const formData = new FormData();
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput.files?.[0]) {
          formData.append("file", fileInput.files[0]);
        }
        formData.append("department", department);
        formData.append("county", county);

        const response = await fetch("http://localhost:8000/api/upload_grant", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          router.push("/context");
        } else {
          console.error("Upload failed:", response.statusText);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };

  const isFormValid = fileName && department.trim() && county.trim();

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Start a new grant workspace and gather your inputs.
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href="/dashboard"
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href="/documents"
            >
              Documents
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              New project
            </p>
            <p className="text-sm mt-2 text-white">
              Step 1 of 3
              <span className="text-[#f9d48f]"> •</span> Grant intake
            </p>
          </div>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              New project
            </p>
            <h1 className="text-4xl font-semibold font-['Fraunces'] mt-3">
              Upload your grant application
            </h1>
            <p className="text-lg text-slate-600 font-medium mt-3">
              Start with the grant RFP and a few details about your department.
            </p>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-3xl p-8 shadow-xl shadow-black/5 bg-white/70 border border-white/80">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="file-upload"
                    className="block text-base font-semibold text-slate-900 mb-2"
                  >
                    Grant Application or RFP
                  </label>
                  <div className="space-y-2">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, file: true }))
                      }
                      className="block w-full text-sm text-slate-700
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-lg file:border file:border-slate-200
                        file:text-sm file:font-semibold
                        file:bg-white file:text-slate-900
                        hover:file:bg-slate-50
                        cursor-pointer border border-slate-200 rounded-lg bg-white"
                    />
                    {fileName && (
                      <p className="text-sm text-[#0d2a2b] font-medium bg-[#0d2a2b]/10 p-2 rounded">
                        Selected: {fileName}
                      </p>
                    )}
                    {touched.file && errors.file && (
                      <p className="text-sm text-[#8b4b1a] font-medium">
                        {errors.file}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-base font-semibold text-slate-900 mb-2"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    placeholder="Planning Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, department: true }))
                    }
                    className="block w-full px-4 py-3 text-base border border-slate-200 rounded-lg
                      focus:ring-2 focus:ring-[#0d2a2b] focus:border-[#0d2a2b]
                      placeholder-slate-400 text-slate-900 bg-white"
                  />
                  {touched.department && errors.department && (
                    <p className="text-sm text-[#8b4b1a] font-medium mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="county"
                    className="block text-base font-semibold text-slate-900 mb-2"
                  >
                    County or Jurisdiction
                  </label>
                  <input
                    id="county"
                    type="text"
                    placeholder="Frederick County, MD"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, county: true }))
                    }
                    className="block w-full px-4 py-3 text-base border border-slate-200 rounded-lg
                      focus:ring-2 focus:ring-[#0d2a2b] focus:border-[#0d2a2b]
                      placeholder-slate-400 text-slate-900 bg-white"
                  />
                  {touched.county && errors.county && (
                    <p className="text-sm text-[#8b4b1a] font-medium mt-1">
                      {errors.county}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full sm:w-auto sm:min-w-[240px] bg-[#0d2a2b] hover:bg-[#133d3f]
                      disabled:bg-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-300
                      text-white font-semibold text-lg py-3 px-8 rounded-lg
                      transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
