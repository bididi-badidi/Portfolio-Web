import Link from "next/link";
import { projects } from "@/content/projects";

export default function PreviewArchive() {
  return <div className="mx-auto max-w-4xl px-6 py-24"><Link href="/preview" className="text-sm text-foreground">← Back to the preview</Link><h1 className="mt-12 text-5xl tracking-tight text-bright">All projects</h1><p className="mt-5 text-foreground">Selected work and earlier explorations.</p><div className="mt-12">{projects.map((project) => <article key={project.id} className="border-t border-glass-border py-7"><h2 className="text-xl text-bright">{project.title}</h2><p className="mt-2 text-sm text-foreground">{project.summary}</p>{project.route ? <Link className="mt-4 inline-block text-sm text-bright" href={project.route}>Explore project →</Link> : <p className="mt-4 text-xs text-muted">Case study in preparation</p>}{project.demo && <Link href={project.demo.href} className="ml-6 text-sm text-bright">{project.demo.label} →</Link>}</article>)}</div></div>;
}
