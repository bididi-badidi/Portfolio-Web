import { useAppActions } from "@/app/context/AppActionsContext";
import { useUIState } from "@/app/context/UIStateContext";
import { Email } from "@/app/interfaces/Email";
import {
  ReminderStatus,
  ReminderType,
  PriorityType,
} from "@/app/enums/ReminderEnums";
import { Reminder } from "@/app/interfaces/Reminder";
import { FunctionCallType } from "@/app/enums/functionCall";
import type { FunctionCall } from "./types";
import { getErrorMessage, reportErrorMessage } from "@/app/utils/handleReport";
import {
  CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS,
  PROJECT_DEMO_URL_DICT,
  SCROLL_DELAY_MS,
} from "./config";

const handleNavigation = async (
  args: Record<string, unknown> | undefined,
  appActions: ReturnType<typeof useAppActions>,
  uiState: ReturnType<typeof useUIState>
) => {
  const targetId = (args?.section as string) || (args?.project as string);
  if (!targetId) {
    console.error("Navigation function call missing target section/project ID");
    return;
  }

  if (uiState.scrollTargetList.has(targetId)) {
    if (uiState.setChatOpen) {
      setTimeout(
        () => uiState.setChatOpen(false),
        CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS
      );
    }
    setTimeout(() => uiState.scrollToSection(targetId), SCROLL_DELAY_MS);
  }
};

const handleSendEmail = (
  args: Record<string, unknown> | undefined,
  appActions: ReturnType<typeof useAppActions>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uiState: ReturnType<typeof useUIState>
) => {
  const email = {
    name: args?.name,
    email: args?.email,
    title: args?.title,
    content: args?.description,
  } as Email;
  appActions.sendEmailAction(email);
};

const handleAddReminder = async (
  args: Record<string, unknown> | undefined,
  appActions: ReturnType<typeof useAppActions>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uiState: ReturnType<typeof useUIState>
) => {
  const newReminder = {
    title: args?.title || "No title",
    dueDate: args?.dueDate || "2020-10-01",
    dueTime: args?.time,
    description: args?.description || "",
    status: ReminderStatus.Pending,
    reminderType: args?.reminderType || ReminderType.Work,
    priority: PriorityType.Low,
  } as Reminder;

  await appActions.addReminderAction(newReminder);
};

const handleShowProjectDemo = async (
  args: Record<string, unknown> | undefined,
  appActions: ReturnType<typeof useAppActions>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uiState: ReturnType<typeof useUIState>
) => {
  console.log(args);
  const name = typeof args?.name === "string" ? args.name : "no";
  const url = PROJECT_DEMO_URL_DICT[name];
  if (!url) {
    console.error(`Project Demo URL for ${name} not found`);
    return;
  }
  appActions.showProjectDemo(url);
};

export const functionRegistry = {
  [FunctionCallType.NavigateSection.name]: handleNavigation,
  [FunctionCallType.NavigateProjects.name]: handleNavigation,
  [FunctionCallType.AddNewReminder.name]: handleAddReminder,
  [FunctionCallType.SendEmail.name]: handleSendEmail,
  [FunctionCallType.ShowProjectDemo.name]: handleShowProjectDemo,
};

export const executeFunctionCall = async (
  functionCall: FunctionCall | undefined,
  appActions: ReturnType<typeof useAppActions>,
  uiState: ReturnType<typeof useUIState>
) => {
  if (!functionCall) return;
  const functionName = functionCall?.name;
  const functionArgs = functionCall?.args;

  const handler =
    functionRegistry[functionName as keyof typeof functionRegistry];

  if (handler) {
    try {
      await handler(functionArgs, appActions, uiState);
    } catch (err) {
      const errMsg = getErrorMessage(err);
      reportErrorMessage(errMsg);
    }
  } else {
    reportErrorMessage("Unknown Function Called");
    console.warn(`No function handler registered for "${functionName}"`);
  }
};
