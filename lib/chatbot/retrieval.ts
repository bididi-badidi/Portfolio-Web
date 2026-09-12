import "server-only";
import knowledge from "./knowledge.json";

export interface Source {
  id: string;
  title: string;
  keywords: string[];
  source: string;
  content: string;
}

export const profile: Source = {
  id: "profile", title: "Zi Shen Chan", keywords: ["education", "background", "contact", "resume", "skills"],
  source: "/", content: "Zi Shen Chan has a Math and Computer Science background from NTU and works across AI, software, and automation. Contact: zshen2002@gmail.com. Resume options on the website include Full Stack Developer, AI Engineering, Data Analysis, General, and Custom.",
};
const stopWords = new Set("a an and are as at be can could do does for from has have how i in is it me my of on or please tell that the their them these this to was what which who with you your about".split(" "));
function tokens(text: string): string[] {
  return [...new Set((text.toLowerCase().match(/[\p{L}\p{N}+#]+/gu) ?? []).filter(t => t.length > 1 && !stopWords.has(t)))];
}
const overview: Source = {
  id: "project-overview", title: "Portfolio projects and work", keywords: ["projects", "portfolio", "work"], source: "/#projects",
  content: "Projects documented in this portfolio: " + knowledge.map(item => item.title).join("; ") + ". Search a specific project for details and evidence limitations.",
};
const documents: Source[] = [profile, overview, ...knowledge];
const index = documents.map(source => ({ source, title: new Set(tokens(source.title + " " + source.id + " " + source.keywords.join(" "))), body: new Set(tokens(source.content)) }));

/** Deterministic local lookup: no embeddings, model calls, network, or user-controlled paths. */
export function searchKnowledge(query: string): Source[] {
  const terms = tokens(query.slice(0, 4000));
  return index.map(({ source, title, body }) => ({ source, score: terms.reduce((sum, term) => {
    const frequency = index.filter(doc => doc.title.has(term) || doc.body.has(term)).length;
    return sum + (title.has(term) ? 4 : body.has(term) ? 1 : 0) * Math.log(1 + index.length / (1 + frequency));
  }, 0) })).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id)).slice(0, 3).map(hit => hit.source);
}

export function retrieveContext(messages: { role: string; message: string }[]): Source[] {
  const latest = messages.at(-1)?.message ?? "";
  const direct = searchKnowledge(latest);
  // Carry topic context for short follow-ups without letting old topics displace explicit new ones.
  const namesTopic = knowledge.some(source => [source.id.replaceAll("-", " "), source.title].some(name => latest.toLowerCase().includes(name.toLowerCase())));
  const followUp = !namesTopic && (/\b(it|its|that|this|they|those|their|them)\b/i.test(latest) || tokens(latest).length <= 2);
  const previous = followUp ? searchKnowledge(messages.slice(0, -1).filter(m => m.role === "user").slice(-1).map(m => m.message).join(" ")) : [];
  return [...new Map([profile, ...(followUp ? [...previous, ...direct] : direct)].map(source => [source.id, source])).values()].slice(0, 4);
}
