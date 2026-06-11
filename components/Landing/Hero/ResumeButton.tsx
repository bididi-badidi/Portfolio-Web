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
import { themeClasses } from "@/app/styles/themeClasses";
import { AnimatedGlassWindow } from "@/components/ui/AnimatedGlassWindow";
import { GlassButton } from "@/components/Buttons/GlassButton";
import { motion } from "motion/react";

export function ResumeButton({
  className,
  labelDelay = 0,
  labelInitialOpacity = 1,
  layoutId,
  layoutTransition,
  reserveLabelSpace = false,
}: {
  className?: string;
  labelDelay?: number;
  labelInitialOpacity?: number;
  layoutId?: string;
  layoutTransition?: Record<string, unknown>;
  reserveLabelSpace?: boolean;
}) {
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
      <GlassButton
        layoutId={layoutId}
        transition={layoutTransition}
        onClick={() => setIsOpen(true)}
        className={cn(
          "mt-8 h-11 min-w-11 text-xl lg:text-2xl",
          className,
        )}
        borderRadius="14px"
        contentClassName={cn(
          "px-6 py-0",
          reserveLabelSpace ? "" : "w-fit",
        )}
      >
        <motion.span
          className="block whitespace-nowrap leading-none"
          initial={{ opacity: labelInitialOpacity }}
          animate={{ opacity: 1 }}
          transition={{ delay: labelDelay, duration: 0.24, ease: "easeOut" }}
          style={{ minWidth: reserveLabelSpace ? "4.6rem" : undefined }}
        >
          Resume
        </motion.span>
      </GlassButton>

      <AnimatedGlassWindow
        open={isOpen}
        onOutsideClick={() => setIsOpen(false)}
        backdrop={<div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />}
        className="z-[100] p-0"
        panelClassName="w-full max-w-md relative z-50 flex flex-col"
        panelHeight="auto"
        glassClassName="pt-0 border-elevated shadow-2xl"
        tintColor="var(--color-bg-page)"
        borderRadius="0.75rem"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-elevated bg-surface/50">
          <div className="flex items-center gap-2">
            {showCustomInput && (
              <button onClick={() => setShowCustomInput(false)} className={cn(themeClasses.control.iconButton, "mr-2")}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xl font-medium text-bright">
              {showCustomInput ? "Paste Job Description" : "Select Resume Version"}
            </h3>
          </div>
          <button onClick={() => setIsOpen(false)} className={themeClasses.control.iconButton}>
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
                      <div className="font-medium text-bright group-hover:text-[var(--color-text-on-accent)]">
                        {option.label}
                      </div>
                      <div className="text-xs text-muted">{option.text}</div>
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
                  className="w-full h-60 p-3 bg-surface border border-elevated rounded-lg text-bright placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
                  disabled={loading === "Custom"}
                />
              </div>

              <button
                onClick={handleCustomGeneration}
                disabled={!jobDescription.trim() || loading === "Custom"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                  themeClasses.gradient.primaryAction,
                  themeClasses.text.onAccent,
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
          <p className="text-xs text-muted">
            {showCustomInput
              ? "AI will analyze requirements to highlight best matching skills from my database"
              : "Powered by Docx & Gemini 3 Pro"}
          </p>
        </div>
      </AnimatedGlassWindow>
    </>
  );
}
