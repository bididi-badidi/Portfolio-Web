"use client";

import { envClient } from "@/app/env/client";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { Email } from "@/app/interfaces/Email";
import purify from "dompurify";

interface sendEmailProps {
  formDetails: HTMLFormElement;
}

function getEmailJsConfig() {
  const { NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY } =
    envClient;

  if (!NEXT_PUBLIC_EMAILJS_SERVICE_ID || !NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || !NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
    throw new Error("EmailJS environment variables are required to send email.");
  }

  return {
    serviceId: NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  };
}

const sendFormEmail = ({ formDetails }: sendEmailProps) => {
  const emailJsConfig = getEmailJsConfig();
  const formData = new FormData(formDetails);

  const templateParams: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      templateParams[key] = purify.sanitize(value);
    } else {
      templateParams[key] = value;
    }
  });

  const sendEmailPromise = emailjs.send(
    emailJsConfig.serviceId,
    emailJsConfig.templateId,
    templateParams,
    emailJsConfig.publicKey,
  );
  toast.promise(sendEmailPromise, {
    loading: "Sending email...",
    success: "Email sent!",
    error: "Failed to send email",
  });
};

const sendEmail = ({ name, email, title, description }: Email) => {
  const emailJsConfig = getEmailJsConfig();
  const sanitizedDescription = purify.sanitize(description ?? "");
  const sanitizedTitle = purify.sanitize(title);
  const sanitizedName = purify.sanitize(name);

  const sendEmailPromise = emailjs.send(
    emailJsConfig.serviceId,
    emailJsConfig.templateId,
    { sanitizedName, email, sanitizedTitle, sanitizedDescription },
    emailJsConfig.publicKey,
  );
  toast.promise(sendEmailPromise, {
    loading: "Sending email...",
    success: "Email sent!",
    error: "Failed to send email",
  });
};

export { sendFormEmail, sendEmail };
