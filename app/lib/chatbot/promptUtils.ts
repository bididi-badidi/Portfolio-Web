export function wrapWithTag(tag: string, content: string): string {
  return `<${tag}>\n${content}\n</${tag}>`;
}

export function promptSection(tag: string, content: unknown): string {
  const body = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  return `<${tag}>\n${body}\n</${tag}>`;
}

export function writingRestrictions(): string {
  return `<LanguageRestrictions>
  Do not:
- filler openers: "Certainly", "Absolutely", "Of course", "Sure", "Great", "Of course!", "Happy to help"
- sycophantic phrases: "That's a great question", "Excellent question", "I'd be happy to", "I'd be glad to"
- AI self-references: "As an AI", "As a language model", "I hope this helps", "Feel free to ask", "Let me know if you have any other questions"
- hollow transition phrases: "It's important to note", "It's worth noting", "Please note that", "It should be noted"
- LLM-cliché verbs: "delve", "dive into", "leverage" (use "use"), "utilize" (use "use"), "streamline", "unlock"
- corporate filler adjectives: "comprehensive", "robust", "seamless", "cutting-edge", "state-of-the-art", "revolutionary", "game-changer", "best practices", "innovative"
- the en-dash (–) as a stylistic separator; use a comma, colon, or rewrite the sentence instead
- pad conclusions with: "In conclusion", "To summarize", "In summary", "Overall", "All in all"
</LanguageRestrictions>`;
}
