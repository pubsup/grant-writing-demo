"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GrantUploadPage() {
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

    // Mark all fields as touched
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
          const result = await response.json();
          console.log("Upload successful:", result);
          // Navigate to context page
          router.push("/context");
        } else {
          console.error("Upload failed:", response.statusText);
          // Handle error - maybe show a message
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Handle error
      }
    }
  };

  const isFormValid = fileName && department.trim() && county.trim();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Pubsup Grant App Demo
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Upload a grant and we&apos;ll walk your team through the application
            process.
          </p>
        </div>

        {/* Card Container */}
        <Card className="p-8 shadow-lg bg-white border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label
                htmlFor="file-upload"
                className="block text-base font-semibold text-gray-900 mb-2"
              >
                Grant RFP or Notice
              </label>
              <div className="space-y-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, file: true }))}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-lg file:border file:border-gray-300
                    file:text-sm file:font-semibold
                    file:bg-white file:text-gray-900
                    hover:file:bg-gray-50
                    cursor-pointer border border-gray-300 rounded-lg"
                />
                {fileName && (
                  <p className="text-sm text-green-700 font-medium bg-green-50 p-2 rounded">
                    ✓ Selected: {fileName}
                  </p>
                )}
                {touched.file && errors.file && (
                  <p className="text-sm text-red-700 font-medium">
                    {errors.file}
                  </p>
                )}
              </div>
            </div>

            {/* Department Name */}
            <div>
              <label
                htmlFor="department"
                className="block text-base font-semibold text-gray-900 mb-2"
              >
                Department Name
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
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400 text-gray-900"
              />
              {touched.department && errors.department && (
                <p className="text-sm text-red-700 font-medium mt-1">
                  {errors.department}
                </p>
              )}
            </div>

            {/* County */}
            <div>
              <label
                htmlFor="county"
                className="block text-base font-semibold text-gray-900 mb-2"
              >
                County
              </label>
              <input
                id="county"
                type="text"
                placeholder="Frederick County, MD"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, county: true }))}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400 text-gray-900"
              />
              {touched.county && errors.county && (
                <p className="text-sm text-red-700 font-medium mt-1">
                  {errors.county}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full sm:w-auto sm:min-w-[240px] bg-blue-600 hover:bg-blue-700
                  disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300
                  text-white font-bold text-lg py-3 px-8 rounded-lg
                  transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Start Grant Workspace
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
