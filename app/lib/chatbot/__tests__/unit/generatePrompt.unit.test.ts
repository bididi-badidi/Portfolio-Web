import { describe, it, expect } from "bun:test";
import { wrapWithTag } from "../../promptUtils";
import { generatePrompt } from "../../generatePrompt";

describe("promptUtils", () => {
  describe("wrapWithTag", () => {
    it("should wrap content in XML-like tags", () => {
      const result = wrapWithTag("MyTag", "hello");
      expect(result).toBe("<MyTag>\nhello\n</MyTag>");
    });

    it("should handle empty content", () => {
      const result = wrapWithTag("Tag", "");
      expect(result).toBe("<Tag>\n\n</Tag>");
    });

    it("should handle multiline content", () => {
      const result = wrapWithTag("Block", "line1\nline2\nline3");
      expect(result).toBe("<Block>\nline1\nline2\nline3\n</Block>");
    });

    it("should include the tag name exactly as provided", () => {
      const result = wrapWithTag("ConversationHistory", "data");
      expect(result).toContain("<ConversationHistory>");
      expect(result).toContain("</ConversationHistory>");
    });
  });
});

describe("generatePrompt", () => {
  it("should include all three sections", () => {
    const result = generatePrompt("chat-history", "knowledge-ctx", undefined);
    expect(result).toContain("<ConversationHistory>");
    expect(result).toContain("chat-history");
    expect(result).toContain("<FunctionCallDetails>");
    expect(result).toContain("<AvailableInformation>");
    expect(result).toContain("knowledge-ctx");
  });

  it("should include 'No Function Call' when functionCall is undefined", () => {
    const result = generatePrompt("history", "knowledge", undefined);
    expect(result).toContain("No Function Call");
  });

  it("should JSON-serialize the function call when provided", () => {
    const functionCall = { name: "SendEmail", args: { email: "test@test.com" } };
    const result = generatePrompt("history", "knowledge", functionCall);
    expect(result).toContain('"name":"SendEmail"');
    expect(result).toContain('"email":"test@test.com"');
    expect(result).not.toContain("No Function Call");
  });

  it("should separate sections with newlines", () => {
    const result = generatePrompt("h", "k", undefined);
    const sections = result.split("\n");
    expect(sections.length).toBeGreaterThan(3);
  });

  it("should place ConversationHistory before FunctionCallDetails", () => {
    const result = generatePrompt("history", "knowledge", undefined);
    const historyIdx = result.indexOf("<ConversationHistory>");
    const funcIdx = result.indexOf("<FunctionCallDetails>");
    expect(historyIdx).toBeLessThan(funcIdx);
  });

  it("should place FunctionCallDetails before AvailableInformation", () => {
    const result = generatePrompt("history", "knowledge", undefined);
    const funcIdx = result.indexOf("<FunctionCallDetails>");
    const infoIdx = result.indexOf("<AvailableInformation>");
    expect(funcIdx).toBeLessThan(infoIdx);
  });
});
