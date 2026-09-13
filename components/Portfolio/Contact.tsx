"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import { EMAIL_ADDRESS } from "@/app/config";
import styles from "./dark.module.css";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  async function copyEmail() {
    if (timeout.current) clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timeout.current = setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <>
      <div className={styles.actions}>
        <a className={`${styles.button} ${styles.primary}`} href={`mailto:${EMAIL_ADDRESS}`}>Say hello <ArrowUpRight size={19} aria-hidden="true" /></a>
        <button type="button" className={styles.button} onClick={copyEmail}>{status === "copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{status === "copied" ? "Email copied" : "Copy email"}</button>
      </div>
      <a className={styles.email} href={`mailto:${EMAIL_ADDRESS}`}>{EMAIL_ADDRESS}</a>
      <p className={styles.copyStatus} role="status">{status === "failed" ? "Couldn’t copy. Select the email address above to copy it manually." : status === "copied" ? "Email address copied to clipboard." : ""}</p>
    </>
  );
}
