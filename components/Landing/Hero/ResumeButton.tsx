"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { Loader2, X, Sparkles, ArrowLeft } from "lucide-react";
import { generateResume } from "@/lib/docx";
import { fetchResumeData } from "@/app/lib/chatbot/fetchCustomizedResume";
import { ResumeOption } from "@/app/interfaces/Resume";
import { RESUME_OPTIONS } from "@/app/config";
import toast from "react-hot-toast";
import { downloadResumePdf, getMasterResume } from "@/lib/s3-file-loader";
import purify from "dompurify";

export function ResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const handleStaticDownload = async (option: ResumeOption) => {
    try {
      setLoading(option.id);

      const base64Data = await toast.promise(downloadResumePdf(option.filename), {
        loading: "Fetching resume...",
        success: "Resume Fetched! Downloading File...",
        error: "Fetching failed. Please try again later.",
      });

      if (!base64Data) {
        throw new Error("Failed to retrieve file");
      }

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });

      saveAs(blob, option.downloadFilename);

      setIsOpen(false);
    } catch (error) {
      console.error("Static download failed:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleCustomGeneration = async () => {
    if (!jobDescription.trim()) return;

    const sanitizedJobDescription = purify.sanitize(jobDescription);

    const toastId = toast.loading("Fetching Required Data...");

    try {
      setLoading("Custom");
      const master_data = await getMasterResume();

      toast.loading("Initializing prompts...", { id: toastId });

      setTimeout(() => {
        toast.loading("Handpicking Experiences..", { id: toastId });
      }, 4000);

      setTimeout(() => {
        toast.loading("Phrasing Details...", { id: toastId });
      }, 8000);

      const customized_data = await fetchResumeData(sanitizedJobDescription, JSON.stringify(master_data));
      if (!customized_data) throw new Error("No data returned from LLM");

      toast.loading("Generating Resume...", { id: toastId });
      const blob = await generateResume(customized_data);

      toast.loading("Finalizing...", { id: toastId });

      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Resume generated!", { id: toastId });

      await new Promise((resolve) => setTimeout(resolve, 500));
      saveAs(blob, `zi_shen_chan_custom_resume.docx`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsOpen(false);
      setShowCustomInput(false);
      setJobDescription("");
    } catch (error) {
      console.error("Resume generation failed:", error);
      toast.error("Resume generated failed. Please try again later.", {
        id: toastId,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleOptionClick = (option: ResumeOption) => {
    if (option.id === "Custom") {
      setShowCustomInput(true);
    } else {
      handleStaticDownload(option);
    }
  };

  const handleDoubleClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(jobDescription + text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert("Please allow clipboard access to use double-click paste.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xl lg:text-2xl mt-8 underline cursor-pointer hover:text-bright transition-colors"
      >
        Resume
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-background border border-elevated rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-elevated bg-surface/50">
              <div className="flex items-center gap-2">
                {showCustomInput && (
                  <button
                    onClick={() => setShowCustomInput(false)}
                    className="mr-2 text-foreground hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="text-xl font-medium text-bright">
                  {showCustomInput ? "Paste Job Description" : "Select Resume Version"}
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4">
              {!showCustomInput ? (
                // 1. STANDARD OPTIONS LIST
                <div className="grid gap-3">
                  {RESUME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg text-left transition-all border border-transparent",
                          "hover:bg-surface hover:border-elevated group",
                        )}
                      >
                        <div className="p-2 rounded-md bg-surface text-foreground group-hover:text-accent-light transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-bright group-hover:text-white">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.text}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // 2. CUSTOM INPUT FORM
                <div className="space-y-6 animate-in slide-in-from-right-10 duration-200">
                  <div className="relative">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      onDoubleClick={handleDoubleClickPaste}
                      placeholder="Ctrl+V or DOUBLE click to paste the job description or role requirements here..."
                      className="w-full h-60 p-3 bg-surface border border-elevated rounded-lg text-bright placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
                      disabled={loading === "Custom"}
                    />
                  </div>

                  <button
                    onClick={handleCustomGeneration}
                    disabled={!jobDescription.trim() || loading === "Custom"}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                      "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-accent hover:to-blue-500 text-white",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
                    )}
                  >
                    {loading === "Custom" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Tailor Resume
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface/30 text-center border-t border-elevated">
              <p className="text-xs text-slate-500">
                {showCustomInput
                  ? "AI will analyze requirements to highlight best matching skills from my database"
                  : "Powered by Docx & Gemini 3 Pro"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
