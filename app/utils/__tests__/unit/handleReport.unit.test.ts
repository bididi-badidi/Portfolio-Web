/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, mock } from "bun:test";

const mockToastError = mock();
const mockToastSuccess = mock();

mock.module("react-hot-toast", () => ({
  default: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

import { getErrorMessage, reportErrorMessage, reportSuccess } from "../../handleReport";

describe("getErrorMessage", () => {
  it("should return message from an Error instance", () => {
    const err = new Error("Something went wrong");
    expect(getErrorMessage(err)).toBe("Something went wrong");
  });

  it("should return String() for a plain string", () => {
    expect(getErrorMessage("oops")).toBe("oops");
  });

  it("should return String() for a number", () => {
    expect(getErrorMessage(42)).toBe("42");
  });

  it("should return String() for null", () => {
    expect(getErrorMessage(null)).toBe("null");
  });

  it("should return String() for undefined", () => {
    expect(getErrorMessage(undefined)).toBe("undefined");
  });

  it("should return String() for a plain object", () => {
    expect(getErrorMessage({ code: 500 })).toBe("[object Object]");
  });
});

describe("reportErrorMessage", () => {
  beforeEach(() => {
    mockToastError.mockClear();
  });

  it("should call toast.error with the toast message", () => {
    reportErrorMessage("Something failed");
    expect(mockToastError).toHaveBeenCalledWith("Something failed");
  });

  it("should not call toast.error when toastMessage is omitted", () => {
    reportErrorMessage(undefined, "internal error");
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("should call toast.error and still work without errorMessage", () => {
    reportErrorMessage("User-facing error");
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});

describe("reportSuccess", () => {
  beforeEach(() => {
    mockToastSuccess.mockClear();
  });

  it("should call toast.success with the provided message", () => {
    reportSuccess("Done!");
    expect(mockToastSuccess).toHaveBeenCalledWith("Done!");
  });

  it("should call toast.success exactly once", () => {
    reportSuccess("ok");
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });
});
