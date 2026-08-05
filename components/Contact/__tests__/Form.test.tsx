import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const sendFormEmail = mock(() => Promise.resolve());

mock.module("@/app/api/sendEmail", () => ({
  sendFormEmail,
}));

mock.module("motion/react", () => {
  const React = require("react");

  const makeMotionEl =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, whileTap: _whileTap, animate: _animate, transition: _transition, ...rest }: any) =>
      React.createElement(tag, rest, children);

  return {
    motion: {
      button: makeMotionEl("button"),
      div: makeMotionEl("div"),
    },
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => {},
    }),
  };
});

import { Form } from "../Form";

afterEach(() => {
  cleanup();
  sendFormEmail.mockReset();
  sendFormEmail.mockImplementation(() => Promise.resolve());
});

describe("Contact Form", () => {
  it("renders the contact fields and submit button", () => {
    render(<Form />);

    expect(screen.getByLabelText("Name*")).toBeRequired();
    expect(screen.getByLabelText("Email*")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Title*")).toBeRequired();
    expect(screen.getByLabelText("Comments")).toHaveAttribute("name", "content");
    expect(screen.getByRole("button", { name: /send email/i })).toBeEnabled();
  });

  it("submits the form element to sendFormEmail", async () => {
    render(<Form />);

    fireEvent.change(screen.getByLabelText("Name*"), { target: { value: "Zi Shen" } });
    fireEvent.change(screen.getByLabelText("Email*"), { target: { value: "zi@example.com" } });
    fireEvent.change(screen.getByLabelText("Title*"), { target: { value: "Hello" } });
    fireEvent.submit(screen.getByRole("button", { name: /send email/i }).closest("form")!);

    await waitFor(() => expect(sendFormEmail).toHaveBeenCalledTimes(1));
    expect(sendFormEmail.mock.calls[0]?.[0].formDetails).toBeInstanceOf(window.HTMLFormElement);
  });

  it("disables submit while a submission is in flight", async () => {
    let resolveSend: () => void = () => {};
    sendFormEmail.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        }),
    );

    render(<Form />);

    const button = screen.getByRole("button", { name: /send email/i });
    fireEvent.submit(button.closest("form")!);
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => expect(button).toBeDisabled());
    expect(sendFormEmail).toHaveBeenCalledTimes(1);

    resolveSend();
    await waitFor(() => expect(button).toBeEnabled());
  });
});
