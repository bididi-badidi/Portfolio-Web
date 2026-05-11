/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { executeFunctionCall } from "../../functionHandlers";
import { reportErrorMessage } from "@/app/utils/handleReport";
import {
  CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS,
  SCROLL_DELAY_MS,
} from "../../config";

mock.module("@/app/utils/handleReport", () => ({
  getErrorMessage: mock((err: any) => err?.message || String(err)),
  reportErrorMessage: mock(),
}));

describe("functionHandlers", () => {
  let mockAppActions: any;
  let mockUiState: any;
  let timeoutCalls: number[];
  let originalSetTimeout: typeof globalThis.setTimeout;

  beforeEach(() => {
    mockAppActions = {
      sendEmailAction: mock(),
      addReminderAction: mock(() => Promise.resolve()),
      showProjectDemo: mock(),
    };
    mockUiState = {
      scrollTargetList: new Set(["section1", "contact", "projects", "reminder-api"]),
      scrollToSection: mock(),
      setChatOpen: mock(),
    };
    (reportErrorMessage as any).mockClear();

    timeoutCalls = [];
    originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((handler: any, timeout?: number) => {
      timeoutCalls.push(timeout as number);
      if (typeof handler === "function") handler();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof globalThis.setTimeout;
  });

  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
  });

  it("should return early when functionCall is undefined", async () => {
    await executeFunctionCall(undefined, mockAppActions, mockUiState);
    expect(mockAppActions.sendEmailAction).not.toHaveBeenCalled();
    expect(mockUiState.scrollToSection).not.toHaveBeenCalled();
  });

  describe("NavigateSection", () => {
    it("should scroll to section and close chat", async () => {
      const functionCall = {
        name: "NavigateSection",
        args: { section: "contact" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);

      expect(mockUiState.scrollToSection).toHaveBeenCalledWith("contact");
      expect(mockUiState.setChatOpen).toHaveBeenCalledWith(false);
      expect(timeoutCalls).toContain(CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS);
      expect(timeoutCalls).toContain(SCROLL_DELAY_MS);
    });

    it("should not scroll when target is not in scrollTargetList", async () => {
      const functionCall = {
        name: "NavigateSection",
        args: { section: "nonexistent" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);

      expect(mockUiState.scrollToSection).not.toHaveBeenCalled();
    });

    it("should not crash when args are missing", async () => {
      const functionCall = {
        name: "NavigateSection",
        args: undefined,
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockUiState.scrollToSection).not.toHaveBeenCalled();
    });
  });

  describe("NavigateProjects", () => {
    it("should scroll to project section", async () => {
      const functionCall = {
        name: "NavigateProjects",
        args: { project: "reminder-api" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);

      expect(mockUiState.scrollToSection).toHaveBeenCalledWith("reminder-api");
    });

    it("should still scroll when setChatOpen is unavailable", async () => {
      mockUiState.setChatOpen = undefined;
      const functionCall = {
        name: "NavigateSection",
        args: { section: "contact" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockUiState.scrollToSection).toHaveBeenCalledWith("contact");
    });
  });

  describe("SendEmail", () => {
    it("should call sendEmailAction with correct email shape", async () => {
      const functionCall = {
        name: "SendEmail",
        args: { name: "John", email: "test@test.com", title: "Hi", description: "Body" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.sendEmailAction).toHaveBeenCalledWith({
        name: "John",
        email: "test@test.com",
        title: "Hi",
        content: "Body",
      });
    });

    it("should still call sendEmailAction with undefined fields", async () => {
      const functionCall = {
        name: "SendEmail",
        args: {},
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.sendEmailAction).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        title: undefined,
        content: undefined,
      });
    });

    it("should pass through non-string fields without crashing", async () => {
      const functionCall = {
        name: "SendEmail",
        args: { name: 123, email: { x: 1 }, title: true, description: null },
      };

      await executeFunctionCall(functionCall as any, mockAppActions, mockUiState);
      expect(mockAppActions.sendEmailAction).toHaveBeenCalled();
    });
  });

  describe("AddNewReminder", () => {
    it("should call addReminderAction with mapped reminder fields", async () => {
      const functionCall = {
        name: "AddNewReminder",
        args: {
          title: "Buy groceries",
          dueDate: "2026-06-01",
          time: "14:00:00",
          description: "Milk and eggs",
          reminderType: "Personal",
        },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.addReminderAction).toHaveBeenCalled();

      const reminder = mockAppActions.addReminderAction.mock.calls[0][0];
      expect(reminder.title).toBe("Buy groceries");
      expect(reminder.dueDate).toBe("2026-06-01");
      expect(reminder.dueTime).toBe("14:00:00");
      expect(reminder.description).toBe("Milk and eggs");
    });

    it("should use default values when args are missing", async () => {
      const functionCall = {
        name: "AddNewReminder",
        args: {},
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.addReminderAction).toHaveBeenCalled();

      const reminder = mockAppActions.addReminderAction.mock.calls[0][0];
      expect(reminder.title).toBe("No title");
      expect(reminder.dueDate).toBe("2020-10-01");
      expect(reminder.description).toBe("");
    });
  });

  describe("ShowProjectDemo", () => {
    it("should call showProjectDemo with correct URL for known project", async () => {
      const functionCall = {
        name: "ShowProjectDemo",
        args: { name: "PersonalAI" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.showProjectDemo).toHaveBeenCalledWith(
        "https://www.zishenchan.com/projects/personal-ai"
      );
    });

    it("should not call showProjectDemo for unknown project", async () => {
      const functionCall = {
        name: "ShowProjectDemo",
        args: { name: "NonExistentProject" },
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.showProjectDemo).not.toHaveBeenCalled();
    });

    it("should handle missing name arg gracefully", async () => {
      const functionCall = {
        name: "ShowProjectDemo",
        args: {},
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(mockAppActions.showProjectDemo).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should call reportErrorMessage for unknown function", async () => {
      const functionCall = {
        name: "unknown_func",
        args: {},
      };

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(reportErrorMessage).toHaveBeenCalledWith("Unknown Function Called");
    });

    it("should call reportErrorMessage (not browser reportError) when handler throws", async () => {
      const functionCall = {
        name: "SendEmail",
        args: {},
      };
      mockAppActions.sendEmailAction.mockImplementation(() => {
        throw new Error("Action Failed");
      });

      await executeFunctionCall(functionCall, mockAppActions, mockUiState);
      expect(reportErrorMessage).toHaveBeenCalledWith("Action Failed");
    });
  });
});
