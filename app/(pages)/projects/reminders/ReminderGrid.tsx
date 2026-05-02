"use client";

import { useEffect, useState } from "react";
import { ReminderCard } from "./ReminderCard";
import { useReminderDispatch, useReminders } from "@/app/context/ReminderContext";
import { Reminder } from "@/app/interfaces/Reminder";
import { ProjectHeading } from "@/components/Projects/ProjectHeading";
import toast from "react-hot-toast";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { fetchFunctionCalls } from "@/app/lib/chatbot/fetchFunctionCalls";
import { FunctionCallResponse } from "@/app/lib/chatbot/types";
import { PriorityType, ReminderStatus, ReminderType } from "@/app/enums/ReminderEnums";
import { ProjectText } from "@/components/Projects/ProjectText";

export function ReminderGrid() {
  const dispatch = useReminderDispatch();
  const reminders = useReminders() as Reminder[];
  const placeholders = ["Remind Zi Shen to bring notes for meeting later at 3pm."];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (textInput: string) => {
    setIsSubmitting(true);
    const createId = toast.loading("Creating Reminders...");

    try {
      const response = (await fetchFunctionCalls(textInput)) as FunctionCallResponse;
      const funcCall = response.functionCall;

      const newReminder = {
        id: reminders.length + 1,
        title: funcCall?.args?.title || "No title",
        description: funcCall?.args?.description || "",
        dueDate: funcCall?.args?.dueDate || "2020-10-01",
        reminderType: funcCall?.args?.reminderType || ReminderType.Work,
        status: ReminderStatus.Pending,
        priority: PriorityType.Low,
      } as Reminder;

      if (dispatch != null) {
        dispatch({
          type: "add",
          reminders: [newReminder] as Reminder[],
        });
      }

      toast.success("Reminder created.", { id: createId });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Something went wrong. Please refresh the page and try again.", { id: createId });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchReminderId = toast.loading("Loading Reminders...");
    toast.success("Load reminders successfully.", { id: fetchReminderId });
  }, []);

  return (
    <>
      <PlaceholdersAndVanishInput placeholders={placeholders} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <div className="h-[10dvh]" />
      <ProjectText className="mb-12">The reminders added below will be deleted after the session.</ProjectText>
      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mb-[10dvh]">
        {!reminders && <ProjectHeading>No Reminders</ProjectHeading>}
        {reminders &&
          reminders.map((rmd) => (
            <ReminderCard
              key={rmd.id}
              title={rmd.title}
              type={rmd.reminderType}
              description={rmd.description}
              date={rmd.dueDate}
            />
          ))}
      </div>
    </>
  );
}
