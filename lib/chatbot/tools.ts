import "server-only";
import { z } from "zod";
import type { ToolDefinition } from "./openai";

const text = z.string().trim().min(1).max(2000);
const nullableText = z.string().trim().max(2000).nullable();
function tool(name: string, description: string, shape: z.ZodRawShape, properties: Record<string, unknown>) {
  return {
    schema: z.object(shape).strict(),
    definition: { type: "function", name, description, strict: true,
      parameters: { type: "object", properties, required: Object.keys(properties), additionalProperties: false },
    } satisfies ToolDefinition,
  };
}
const string = { type: "string" };
const optionalString = { type: ["string", "null"] };
const sections = ["contact", "hero", "techstack", "about"] as const;
const projects = ["projects", "reminder-api", "xcuisite", "sccc", "hologram", "personal-assistant", "automation-manager", "stock-ai", "event-capture"] as const;
export const tools = {
  search_portfolio: tool("search_portfolio", "Search the local portfolio ground-truth sources when the supplied context does not answer the visitor's question.", { query: text }, { query: string }),
  NavigateSection: tool("NavigateSection", "Request browser navigation only when the visitor asks to go there or accepts an offer. This queues navigation; it does not confirm completion.", { section: z.enum(sections) }, { section: { type: "string", enum: sections } }),
  NavigateProjects: tool("NavigateProjects", "Request navigation to a project only when asked or after an accepted offer; do not navigate for informational questions.", { project: z.enum(projects) }, { project: { type: "string", enum: projects } }),
  SendEmail: tool("SendEmail", "Prepare an email for the browser to send only when the visitor explicitly asks to send it. Ask for missing name and email; never invent them. No email has been sent yet.", { name: text, email: z.string().email().max(254), title: text, description: nullableText }, { name: string, email: string, title: string, description: optionalString }),
  AddNewReminder: tool("AddNewReminder", "Prepare a reminder only when explicitly requested. Resolve relative dates against the supplied current date in Asia/Singapore. Use null for an unspecified date/time; never invent them.", { title: text, dueDate: z.string().date().nullable(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/).nullable(), description: nullableText, reminderType: z.enum(["Work", "Personal"]) }, { title: string, dueDate: optionalString, time: optionalString, description: optionalString, reminderType: { type: "string", enum: ["Work", "Personal"] } }),
};

export function validateTool(name: string, args: unknown): Record<string, unknown> {
  if (!Object.hasOwn(tools, name)) throw new Error("Unknown tool");
  const result = tools[name as keyof typeof tools].schema.parse(args);
  if (name === "AddNewReminder" && result.time && !result.dueDate) throw new Error("A reminder time requires a date");
  return result;
}
