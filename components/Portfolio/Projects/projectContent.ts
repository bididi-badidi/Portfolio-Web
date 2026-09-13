import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  Gauge,
  Layers3,
  ListPlus,
  LockKeyhole,
  MessagesSquare,
  Radio,
  ScanText,
  Search,
  ServerCog,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export type DarkProjectId = "stock-ai" | "shortcuts" | "remainder-api" | "automation-manager";

export interface ProjectFeature {
  id: string;
  label: string;
  title: string;
  description: string;
  detail: string;
  flow: string;
  icon: LucideIcon;
  video?: string;
}

export interface ProjectProcessStep {
  title: string;
  subtitle: string;
  detail: string;
  formula: string;
  icon: LucideIcon;
}

export interface DarkProjectContent {
  id: DarkProjectId;
  name: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroLabel: string;
  heroPoints: readonly string[];
  overviewTitle: string;
  overviewAccent: string;
  overview: readonly string[];
  featureLabel: string;
  featureTitle: string;
  featureAccent: string;
  featureDescription: string;
  features: readonly ProjectFeature[];
  processTitle: string;
  processAccent: string;
  processDescription: string;
  process: readonly ProjectProcessStep[];
  buildTitle: string;
  buildAccent: string;
  stack: readonly { label: string; value: string; description: string }[];
  closingTitle: string;
  closingAccent: string;
  closingDescription: string;
  actionHref: string;
  actionLabel: string;
  disclosure?: string;
}

export const darkProjectContent: Record<DarkProjectId, DarkProjectContent> = {
  "stock-ai": {
    id: "stock-ai",
    name: "StockAI",
    heroTitle: "Stock research.",
    heroAccent: "One command away.",
    heroDescription:
      "A focused command-line workspace for company research, earnings dates, and market events.",
    heroLabel: "ONE RESEARCH WORKSPACE",
    heroPoints: ["Company research", "Earnings calendar", "Critical event monitor"],
    overviewTitle: "Research without",
    overviewAccent: "the tab overload.",
    overview: [
      "Company research often fragments across reports, calendars, search results, and separate analysis tools. StockAI brings those tasks into one command-line workflow.",
      "The project focuses on reducing context switching: ask for the research task you need, then receive the relevant report, date, or event in the same interface.",
    ],
    featureLabel: "02 / In the terminal",
    featureTitle: "Four commands.",
    featureAccent: "One clear workflow.",
    featureDescription: "Explore the core StockAI commands through the recorded interface.",
    features: [
      {
        id: "help",
        label: "Guide",
        title: "A useful start,\nbefore the first query.",
        description: "A built-in help command makes every capability discoverable without leaving the terminal.",
        detail: "Commands and usage guidance stay close to the work, so the interface remains approachable even when a workflow is unfamiliar.",
        flow: "Open StockAI → review commands → choose a task",
        icon: CircleHelp,
        video: "/videos/stockAI/help.mp4",
      },
      {
        id: "research",
        label: "Research",
        title: "Company context.\nIn one place.",
        description: "Research a company and bring key information into a single, focused response.",
        detail: "The command consolidates the research step instead of asking the user to assemble the same context across several browser tabs.",
        flow: "Company → research request → focused report",
        icon: Search,
        video: "/videos/stockAI/main.mp4",
      },
      {
        id: "earnings",
        label: "Earnings",
        title: "Upcoming dates.\nEasy to scan.",
        description: "Surface companies with future earnings dates from the same research workspace.",
        detail: "The calendar view keeps time-sensitive research close to company information and reduces the need for a separate lookup flow.",
        flow: "Date range → earnings lookup → upcoming companies",
        icon: CalendarDays,
        video: "/videos/stockAI/earnings.mp4",
      },
      {
        id: "events",
        label: "Events",
        title: "Important signals.\nLess searching.",
        description: "Look for future company events such as product releases, conferences, and important notices.",
        detail: "The event monitor turns another common research task into a repeatable command while keeping the result in context.",
        flow: "Company → event scan → relevant notices",
        icon: Radio,
        video: "/videos/stockAI/events.mp4",
      },
    ],
    processTitle: "Ask once.",
    processAccent: "Keep the context.",
    processDescription: "A compact pipeline turns a research command into a useful result without changing tools.",
    process: [
      { title: "Choose the research task", subtitle: "One command surface", detail: "The user selects company research, earnings, events, or help from the same interface.", formula: "Command + company → research intent", icon: Search },
      { title: "Gather the relevant information", subtitle: "Task-specific retrieval", detail: "The selected workflow gathers the information needed for that request and keeps unrelated material out of the result.", formula: "Intent → relevant sources → context", icon: Layers3 },
      { title: "Return a focused result", subtitle: "One terminal response", detail: "The answer is presented inside the command-line workspace so the next research step can begin without another tool switch.", formula: "Context → response → next command", icon: ChartNoAxesCombined },
    ],
    buildTitle: "A practical stack.",
    buildAccent: "Built for focused research.",
    stack: [
      { label: "Interface", value: "Command-line workflow", description: "A compact surface for discoverable research commands." },
      { label: "Intelligence", value: "Gemini", description: "Language-model support for company research and synthesis." },
      { label: "Services", value: "AWS · Redis", description: "Cloud and data services used by the authored implementation." },
    ],
    closingTitle: "More ideas.",
    closingAccent: "More to explore.",
    closingDescription: "Explore more projects that connect AI with everyday work.",
    actionHref: "/#projects",
    actionLabel: "Explore all projects",
  },
  shortcuts: {
    id: "shortcuts",
    name: "Productivity Shortcuts",
    heroTitle: "Small shortcuts.",
    heroAccent: "More flow.",
    heroDescription:
      "A collection of Apple Shortcuts that turns on-screen details, conversations, and one-line plans into calendar events.",
    heroLabel: "THREE SHORTCUTS, ONE LESS INTERRUPTION",
    heroPoints: ["Screen to calendar", "Conversation to calendar", "Batch scheduling"],
    overviewTitle: "Keep the moment.",
    overviewAccent: "Skip the admin.",
    overview: [
      "Adding a calendar event is a small task that arrives at exactly the wrong time. It interrupts the email, page, conversation, or plan that contains the information in the first place.",
      "Productivity Shortcuts is a collection of three focused workflows. Each one captures the context already in front of you, extracts the useful event details, and hands them to Calendar.",
    ],
    featureLabel: "02 / The shortcut library",
    featureTitle: "Three ways in.",
    featureAccent: "One organised calendar.",
    featureDescription: "The collection meets event details where they already are: on screen, in conversation, or in a list.",
    features: [
      {
        id: "screen",
        label: "Screen",
        title: "Select it.\nSchedule it.",
        description: "Turn selected on-screen information—from an email or web page—into a calendar event.",
        detail: "The shortcut filters away surrounding copy and keeps the useful date, time, title, and location details for the event.",
        flow: "Selected content → useful details → Calendar event",
        icon: ScanText,
        video: "/videos/shortcuts/calendar1080.mp4",
      },
      {
        id: "conversation",
        label: "Conversation",
        title: "A spoken plan.\nCaptured.",
        description: "Extract dates, times, and locations from a conversation and turn the commitment into an event.",
        detail: "This shortcut is designed for the moment a plan is spoken aloud, keeping the scheduling action close to the conversation.",
        flow: "Conversation → event details → Calendar event",
        icon: MessagesSquare,
        video: "/videos/shortcuts/calendar-conversation.mp4",
      },
      {
        id: "batch",
        label: "Batch",
        title: "A full plan.\nOne command.",
        description: "Create multiple calendar events from one list or instruction instead of entering them one by one.",
        detail: "It is useful for a meeting-heavy day, a trip, or any plan where several events arrive together.",
        flow: "One list → multiple events → organised schedule",
        icon: ListPlus,
        video: "/videos/shortcuts/calendar-multievent.mp4",
      },
    ],
    processTitle: "Capture first.",
    processAccent: "Confirm before saving.",
    processDescription: "Each shortcut follows the same small, understandable path from raw context to a calendar entry.",
    process: [
      { title: "Capture the source", subtitle: "Selection, speech, or typed plan", detail: "The workflow starts with the information the user already has, without asking them to re-enter it in Calendar.", formula: "Screen · speech · text → source context", icon: ScanText },
      { title: "Extract event details", subtitle: "Gemini-assisted parsing", detail: "The shortcut identifies useful event fields such as the title, date, time, and location while dropping unrelated text.", formula: "Context → structured event details", icon: Bot },
      { title: "Create the event", subtitle: "Apple Calendar", detail: "The structured details are handed to Calendar, where the event or batch of events can be reviewed as part of the workflow.", formula: "Event details → Calendar", icon: CalendarDays },
    ],
    buildTitle: "Native tools.",
    buildAccent: "Thoughtfully connected.",
    stack: [
      { label: "Automation", value: "Apple Shortcuts", description: "The native workflow layer that connects each step." },
      { label: "Understanding", value: "Gemini", description: "Extracts useful event details from natural language and surrounding content." },
      { label: "Destination", value: "Apple Calendar", description: "Receives the resulting event or batch of events." },
    ],
    closingTitle: "Small ideas.",
    closingAccent: "Useful possibilities.",
    closingDescription: "Discover more ways I use software to make everyday work simpler.",
    actionHref: "/#projects",
    actionLabel: "Explore all projects",
  },
  "remainder-api": {
    id: "remainder-api",
    name: "Reminder API",
    heroTitle: "Reminders that fit",
    heroAccent: "into other workflows.",
    heroDescription:
      "A secure, extensible API for creating and managing reminders from apps, services, and AI assistants.",
    heroLabel: "BUILT TO BE CONNECTED",
    heroPoints: ["Authenticated access", "Validated requests", "AI-ready integration"],
    overviewTitle: "A reminder service",
    overviewAccent: "designed for extension.",
    overview: [
      "Reminder features become more useful when they can be reached from the tool a person is already using. This API creates a dependable boundary for those integrations.",
      "The implementation combines authenticated access, request validation, structured errors, and a conventional REST surface so clients and AI-assisted workflows can manage reminders predictably.",
    ],
    featureLabel: "02 / The API in action",
    featureTitle: "A dependable core.",
    featureAccent: "Ready for integrations.",
    featureDescription: "Explore the current API, its access layer, and an AI-assisted reminder flow.",
    features: [
      {
        id: "api",
        label: "API",
        title: "Create and manage.\nFrom anywhere.",
        description: "A REST interface makes reminder operations available to web apps, services, and other clients.",
        detail: "The API provides the reusable reminder layer; the calling interface can stay focused on its own experience.",
        flow: "Client request → reminder API → stored reminder",
        icon: ServerCog,
        video: "/videos/remainderApi/main.mp4",
      },
      {
        id: "access",
        label: "Access",
        title: "Identity first.\nThen the data.",
        description: "Authentication and authorization keep reminder operations associated with the current user.",
        detail: "The authored implementation uses ASP.NET Core Identity and JWT-based access for client requests.",
        flow: "Credentials → identity → authorised request",
        icon: LockKeyhole,
        video: "/videos/remainderApi/auth.mp4",
      },
      {
        id: "integration",
        label: "AI flow",
        title: "Natural language.\nStructured action.",
        description: "An assistant can translate a request into the API fields needed to create or update a reminder.",
        detail: "Persistent authentication lets an approved client connect conversational input to the same reminder operations.",
        flow: "Request → validated fields → reminder action",
        icon: Bot,
        video: "/videos/remainderApi/interaction.mp4",
      },
    ],
    processTitle: "Validate early.",
    processAccent: "Fail clearly.",
    processDescription: "The request pipeline protects the data boundary before work reaches the controller.",
    process: [
      { title: "Authenticate the caller", subtitle: "Identity and JWT", detail: "The request establishes who is making it and whether that caller can access the operation.", formula: "Credentials → token → authorised caller", icon: ShieldCheck },
      { title: "Validate the request", subtitle: "Model state and DTO rules", detail: "Malformed data and invalid fields are rejected before the controller modifies reminder data.", formula: "Request body → validation → typed input", icon: Gauge },
      { title: "Handle the operation", subtitle: "Controllers and data access", detail: "Valid requests are routed to the relevant operation, with database and service failures handled consistently.", formula: "Typed input → operation → response", icon: ServerCog },
    ],
    buildTitle: "Conventional pieces.",
    buildAccent: "A clear service boundary.",
    stack: [
      { label: "Application", value: ".NET · ASP.NET Core", description: "The web API, middleware, identity, and request pipeline." },
      { label: "Data", value: "PostgreSQL · Entity Framework Core", description: "Persistence and application data access." },
      { label: "Protocol", value: "REST · JWT", description: "A client-friendly contract with authenticated requests." },
    ],
    closingTitle: "Try the reminder",
    closingAccent: "playground.",
    closingDescription: "Try creating a reminder through the interactive playground.",
    actionHref: "/projects/reminders",
    actionLabel: "Open reminders playground",
  },
  "automation-manager": {
    id: "automation-manager",
    name: "Automation Manager",
    heroTitle: "Device testing.",
    heroAccent: "One managed workflow.",
    heroDescription:
      "An internship web platform for running Android device tests and making their results easier to review.",
    heroLabel: "GENERALIZED PROJECT OVERVIEW",
    heroPoints: ["Test orchestration", "Result review", "Extensible services"],
    overviewTitle: "Less repetition.",
    overviewAccent: "More visible results.",
    overview: [
      "Android device testing combines repetitive operations with results that still need interpretation. Automation Manager brings those parts together in a single web workflow.",
      "This case study describes the system at a generalized level. Employer screenshots, internal data, implementation specifics, and measured impact are intentionally excluded.",
    ],
    featureLabel: "02 / The workflow",
    featureTitle: "Run the tests.",
    featureAccent: "Understand the result.",
    featureDescription: "A disclosure-safe view of the three responsibilities brought into one interface.",
    features: [
      {
        id: "orchestrate",
        label: "Orchestrate",
        title: "A repeatable path\nfor device tests.",
        description: "The web interface provides one place to initiate and manage automated Android device testing work.",
        detail: "The workflow reduces the need to coordinate repetitive operations manually while keeping the user in control of when tests run.",
        flow: "Test request → backend coordination → device workflow",
        icon: Workflow,
      },
      {
        id: "review",
        label: "Review",
        title: "Results made\neasier to inspect.",
        description: "Testing output returns to the same product surface for review and interpretation.",
        detail: "Bringing execution and results together makes the state of the workflow easier to understand without exposing internal employer data here.",
        flow: "Test output → result processing → web review",
        icon: ChartNoAxesCombined,
      },
      {
        id: "extend",
        label: "Extend",
        title: "A boundary built\nfor new workflows.",
        description: "A backend and service-oriented structure leaves room for additional test operations and result processors.",
        detail: "This public account stays intentionally architectural; proprietary service details are not reproduced.",
        flow: "Web interface → backend → service boundary",
        icon: Layers3,
      },
    ],
    processTitle: "One visible loop.",
    processAccent: "Clear responsibility.",
    processDescription: "The generalized architecture separates the interface, coordination layer, and testing services.",
    process: [
      { title: "Start from the web interface", subtitle: "Operator-facing controls", detail: "The user selects and initiates the testing workflow from a single product surface.", formula: "User → web interface → test request", icon: Workflow },
      { title: "Coordinate in the backend", subtitle: "Workflow boundary", detail: "The backend accepts the request and coordinates the relevant service work without putting infrastructure details into the interface.", formula: "Test request → backend coordination", icon: ServerCog },
      { title: "Return results for review", subtitle: "A complete feedback loop", detail: "Processed testing results return to the web experience so the user can understand what happened and decide what comes next.", formula: "Service output → result analysis → user", icon: ChartNoAxesCombined },
    ],
    buildTitle: "Separated concerns.",
    buildAccent: "One operator experience.",
    stack: [
      { label: "Interface", value: "Web application", description: "A unified surface for starting tests and reviewing results." },
      { label: "Coordination", value: "Backend services", description: "The boundary between user intent and automated operations." },
      { label: "Execution", value: "Testing microservices", description: "Generalized service components for device-testing workflows." },
    ],
    closingTitle: "A careful account",
    closingAccent: "of internship work.",
    closingDescription: "Explore more of my work, from personal experiments to practical applications.",
    actionHref: "/#projects",
    actionLabel: "Explore all projects",
    disclosure: "Generalized case study · No employer screenshots, internal data, or performance metrics are published.",
  },
};

export const darkProjectIds = Object.keys(darkProjectContent) as DarkProjectId[];

export function isDarkProjectId(value: string): value is DarkProjectId {
  return value in darkProjectContent;
}
