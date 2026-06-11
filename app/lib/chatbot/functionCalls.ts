import { type FunctionDeclaration, Type } from "./geminiTypes";
import { FunctionCallType } from "@/app/enums/functionCall";
// import { ProjectDemoType } from "@/app/enums/projectDemo";

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

const addNewReminderDeclaration: FunctionDeclaration = {
  name: FunctionCallType.AddNewReminder.name,
  parameters: {
    type: Type.OBJECT,
    description: FunctionCallType.AddNewReminder.description,
    properties: {
      title: {
        type: Type.STRING,
        description:
          "The title for the reminder. Keep this as short as possible, and use the rest details as description.",
      },
      dueDate: {
        type: Type.STRING,
        description:
          "The due date for the new reminder. Must be either undefined or in YYYY-MM-DD format.",
      },
      time: {
        type: Type.STRING,
        description:
          "The due time for the new reminder. Must be in undefined or in hh:mm:ss format. return undefined if user did not suggest. CANNOT exist without due date.",
      },
      description: {
        type: Type.STRING,
        description: "The description for the reminder. Optional",
      },
      reminderType: {
        type: Type.STRING,
        description:
          "The reminder type. Select from the options based on the conversation history.",
        enum: ["Work", "Personal"],
      },
    },
    required: ["title", "dueDate", "reminderType"],
  },
};

const navigateSectionDeclaration: FunctionDeclaration = {
  name: FunctionCallType.NavigateSection.name,
  parameters: {
    type: Type.OBJECT,
    description: FunctionCallType.NavigateSection.description,
    properties: {
      section: {
        type: Type.STRING,
        description: "The specific section to navigate to.",
        enum: ["contact", "hero", "techstack", "about"],
      },
    },
    required: ["section"],
  },
};

const navigateProjectsDeclaration: FunctionDeclaration = {
  name: FunctionCallType.NavigateProjects.name,
  parameters: {
    type: Type.OBJECT,
    description: FunctionCallType.NavigateProjects.description,
    properties: {
      project: {
        type: Type.STRING,
        description:
          "The target project to navigate to. The option 'projects' is only applicable only if the users ask to see all the projects.",
        enum: [
          "projects",
          "reminder-api",
          "xcuisite",
          "sccc",
          "hologram",
          "personal-assistant",
          "automation-manager",
          "stock-ai",
          "event-capture",
        ],
      },
    },
    required: ["project"],
  },
};

const sendEmailDeclaration: FunctionDeclaration = {
  name: FunctionCallType.SendEmail.name,
  parameters: {
    type: Type.OBJECT,
    description: FunctionCallType.SendEmail.description,
    properties: {
      email: {
        type: Type.STRING,
        description: "user email. This field cannot be empty or unknown.",
      },
      name: {
        type: Type.STRING,
        description: "user name. This field cannot be empty or unknown.",
      },
      title: {
        type: Type.STRING,
        description:
          "A short title for the email. This field cannot be empty or unknown. This field can be read from the conversation by summarize.",
      },
      description: {
        type: Type.STRING,
        description:
          "A brief email description. This field is optional and can be deduced from the conversation.",
      },
    },
    required: ["name", "email", "title"],
  },
};

export const functionCallList = [
  sendEmailDeclaration,
  navigateProjectsDeclaration,
  navigateSectionDeclaration,
  addNewReminderDeclaration,
];
