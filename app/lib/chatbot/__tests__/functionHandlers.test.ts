/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { executeFunctionCall } from "../functionHandlers";
import { reportErrorMessage } from "@/app/utils/handleReport";

mock.module("@/app/utils/handleReport", () => ({
  getErrorMessage: (err: any) => err.message || String(err),
  reportErrorMessage: mock(),
}));

describe("functionHandlers", () => {
  let mockAppActions: any;
  let mockUiState: any;

  beforeEach(() => {
    mockAppActions = {
      sendEmailAction: mock(),
      addReminderAction: mock(),
      showProjectDemo: mock(),
    };
    mockUiState = {
      scrollTargetList: new Set(["section1"]),
      scrollToSection: mock(),
      setChatOpen: mock(),
    };
    (reportErrorMessage as any).mockClear();
  });

  it("should call handleNavigation for NavigateSection", async () => {
    const functionCall = {
      name: "NavigateSection",
      args: { section: "section1" },
    };

    await executeFunctionCall(functionCall, mockAppActions, mockUiState);
    
    // Use a small delay for setTimeout in handleNavigation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    expect(mockUiState.scrollToSection).toHaveBeenCalledWith("section1");
  });

  it("should call handleSendEmail for SendEmail", async () => {
    const functionCall = {
      name: "SendEmail",
      args: { name: "John", email: "test@test.com", title: "Hi", description: "Body" },
    };

    await executeFunctionCall(functionCall, mockAppActions, mockUiState);
    expect(mockAppActions.sendEmailAction).toHaveBeenCalled();
  });

  it("should report error for unknown function", async () => {
    const functionCall = {
      name: "unknown_func",
      args: {},
    };

    await executeFunctionCall(functionCall, mockAppActions, mockUiState);
    expect(reportErrorMessage).toHaveBeenCalledWith("Unknown Function Called");
  });

  it("should report error if handler throws", async () => {
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
