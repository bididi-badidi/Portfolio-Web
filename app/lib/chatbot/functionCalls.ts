import { tool } from "ai";
import { z } from "zod";
import { FunctionCallType } from "@/app/enums/functionCall";
import { ProjectDemoType } from "@/app/enums/projectDemo";

export const funcSysMsgDict = new Map<string, string>();
funcSysMsgDict.set(
  FunctionCallType.NavigateSection.name,
  "User is navigated to the portfolio section."
);
funcSysMsgDict.set(
  FunctionCallType.SendEmail.name,
  "An email is sent on behalf of user."
);
funcSysMsgDict.set(
  FunctionCallType.NavigateProjects.name,
  "User is navigated to the target project section."
);
funcSysMsgDict.set(
  FunctionCallType.AddNewReminder.name,
  "New reminder is added."
);
funcSysMsgDict.set(
  FunctionCallType.ShowProjectDemo.name,
  "A new tab is open for the project demo."
);

const addNewReminderDeclaration = tool({
  description: FunctionCallType.AddNewReminder.description,
  inputSchema: z.object({
    title: z
      .string()
      .describe("The title for the reminder. Keep this as short as possible, and use the rest details as description."),
    dueDate: z
      .string()
      .describe("The due date for the new reminder. Must be either undefined or in YYYY-MM-DD format."),
    time: z
      .string()
      .optional()
      .describe(
        "The due time for the new reminder. Must be in undefined or in hh:mm:ss format. return undefined if user did not suggest. CANNOT exist without due date.",
      ),
    description: z.string().optional().describe("The description for the reminder. Optional"),
    reminderType: z
      .enum(["Work", "Personal"])
      .describe("The reminder type. Select from the options based on the conversation history."),
  }),
});

const navigateSectionDeclaration = tool({
  description: FunctionCallType.NavigateSection.description,
  inputSchema: z.object({
    section: z
      .enum(["contact", "hero", "techstack", "about"])
      .describe("The specific section to navigate to."),
  }),
});

const navigateProjectsDeclaration = tool({
  description: FunctionCallType.NavigateProjects.description,
  inputSchema: z.object({
    project: z
      .enum([
        "projects",
        "reminder-api",
        "xcuisite",
        "sccc",
        "hologram",
        "personal-assistant",
        "automation-manager",
        "stock-ai",
        "event-capture",
      ])
      .describe(
        "The target project to navigate to. The option 'projects' is only applicable only if the users ask to see all the projects.",
      ),
  }),
});

const sendEmailDeclaration = tool({
  description: FunctionCallType.SendEmail.description,
  inputSchema: z.object({
    email: z.string().describe("user email. This field cannot be empty or unknown."),
    name: z.string().describe("user name. This field cannot be empty or unknown."),
    title: z
      .string()
      .describe(
        "A short title for the email. This field cannot be empty or unknown. This field can be read from the conversation by summarize.",
      ),
    description: z
      .string()
      .optional()
      .describe("A brief email description. This field is optional and can be deduced from the conversation."),
  }),
});

const showProjectDemoDeclaration = tool({
  description: FunctionCallType.ShowProjectDemo.description,
  inputSchema: z.object({
    name: z
      .enum([
        ProjectDemoType.PersonalAI,
        ProjectDemoType.ReminderApi,
        ProjectDemoType.Xcuisite,
      ])
      .describe("The project demo to open for the user."),
  }),
});

export const functionCallTools = {
  [FunctionCallType.SendEmail.name]: sendEmailDeclaration,
  [FunctionCallType.NavigateProjects.name]: navigateProjectsDeclaration,
  [FunctionCallType.NavigateSection.name]: navigateSectionDeclaration,
  [FunctionCallType.AddNewReminder.name]: addNewReminderDeclaration,
  [FunctionCallType.ShowProjectDemo.name]: showProjectDemoDeclaration,
};
