"use server";

import { envClient } from "../env/client";
import { envServer } from "../env/server";
import { Reminder } from "@/app/interfaces/Reminder";
import {
  ReminderStatus,
  ReminderType,
  PriorityType,
} from "@/app/enums/ReminderEnums";
import { getErrorMessage, reportErrorMessage } from "@/app/utils/handleReport";
import {
  fetchWithRetry,
  fetchWithRetryResponse,
} from "../utils/fetchWithRetry";

function getReminderUrl() {
  const baseUrl = envClient.NEXT_PUBLIC_AZURE_REMINDER_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_AZURE_REMINDER_API_URL is required to call the reminder API.");
  }

  return `${baseUrl}/reminder`;
}

function getReminderToken() {
  const token = envServer.REMINDER_API_TOKEN;

  if (!token) {
    throw new Error("REMINDER_API_TOKEN is required to call the reminder API.");
  }

  return token;
}

interface GetRemindersResponse {
  error: boolean;
  message: string;
  reminders: Reminder[] | null;
}

export interface AddReminderResponse {
  error: boolean;
  message: string;
  details: string | null;
}

export interface QueryObject {
  Title?: string;
  Description?: string;
  Status?: ReminderStatus;
  Type?: ReminderType;
}

async function deleteReminder(id: number) {
  const token = getReminderToken();
  const reminderUrl = getReminderUrl();
  try {
    const response = await fetch(`${reminderUrl}/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(response.json());
      return {
        error: true,
        message: "Unable to delete reminder",
      };
    }

    return {
      error: false,
      message: "Reminder deleted successfully",
    };
  } catch (err) {
    const message = getErrorMessage(err);
    reportErrorMessage(message);
    return {
      error: true,
      message: "Unable to delete reminder",
    };
  }
}

async function addReminders(reminder: Reminder): Promise<AddReminderResponse> {
  const token = getReminderToken();
  const reminderUrl = getReminderUrl();

  try {
    const response = (await fetchWithRetry(`${reminderUrl}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify([reminder]),
    })) as fetchWithRetryResponse;

    const responseJson = response.response;

    if (!responseJson) {
      return {
        error: true,
        message: "Unable to add reminder",
        details: response.errMsg,
      };
    }
    return {
      error: false,
      message: "Reminder added successfully",
      details: null,
    };
  } catch (err) {
    const message = getErrorMessage(err);
    console.error(message);
    return {
      error: true,
      message: "Something went wrong",
      details: message,
    };
  }
}

async function fetchReminders(
  queryObject: QueryObject
): Promise<GetRemindersResponse> {
  const token = getReminderToken();
  const reminderUrl = getReminderUrl();

  const queryString = Object.entries(queryObject)
    .map(([key, val]) => `${key}=${String(val)}`)
    .join("&");

  try {
    const response = (await fetchWithRetry(
      `${reminderUrl}/all?${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    )) as fetchWithRetryResponse;
    if (!response.response) {
      return {
        error: true,
        message: "Could not fetch reminders",
        reminders: [],
      };
    }
    const resJson = response.response;

    const result: Reminder[] = resJson.map((reminder: Reminder) => ({
      ...reminder,
      reminderType:
        ReminderType[reminder.reminderType as keyof typeof ReminderType],
      status: ReminderStatus[reminder.status as keyof typeof ReminderStatus],
      priority: PriorityType[reminder.priority as keyof typeof PriorityType],
    }));

    return {
      error: false,
      message: "Fetched reminders successfully",
      reminders: result,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return {
      error: true,
      message: "Failed to fetch reminders.",
      reminders: null,
    };
  }
}

export { fetchReminders, deleteReminder, addReminders };
