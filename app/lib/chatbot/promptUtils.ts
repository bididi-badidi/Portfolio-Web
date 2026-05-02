export function wrapWithTag(tag: string, content: string): string {
  return `<${tag}>\n${content}\n</${tag}>`;
}
