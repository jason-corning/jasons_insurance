// Tiny renderer for the markdown subset used by help articles:
// "## " headings, ordered ("1. ") and unordered ("- ") lists with hanging
// indents, **bold**, and [text](href) links. No external dependencies.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-ink">
          {match[1]}
        </strong>,
      );
    } else {
      const href = match[3];
      const label = match[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={`${keyBase}-l${i}`} to={href} className="font-medium text-pine underline decoration-sage underline-offset-2 hover:text-pinedeep">
            {label}
          </Link>
        ) : (
          <a key={`${keyBase}-l${i}`} href={href} className="font-medium text-pine underline decoration-sage underline-offset-2 hover:text-pinedeep">
            {label}
          </a>
        ),
      );
    }
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ol"; items: string[] }
  | { kind: "ul"; items: string[] };

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ kind: "h2", text: trimmed.slice(3) });
      i++;
      continue;
    }
    if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith("- ")) {
      const ordered = /^\d+\.\s/.test(trimmed);
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) break;
        if (/^\d+\.\s/.test(t)) items.push(t.replace(/^\d+\.\s/, ""));
        else if (t.startsWith("- ")) items.push(t.slice(2));
        else if (items.length > 0) items[items.length - 1] += ` ${t}`;
        else break;
        i++;
      }
      blocks.push(ordered ? { kind: "ol", items } : { kind: "ul", items });
      continue;
    }
    // paragraph: consume until blank line or structural marker
    const para: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t.startsWith("## ") || /^\d+\.\s/.test(t) || t.startsWith("- ")) break;
      para.push(t);
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }
  return blocks;
}

export function Markdown({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        if (block.kind === "h2")
          return (
            <h2 key={idx} className="pt-2 font-display text-xl font-semibold text-pine">
              {block.text}
            </h2>
          );
        if (block.kind === "ol")
          return (
            <ol key={idx} className="list-decimal space-y-2 pl-6 text-ink/85 marker:font-semibold marker:text-leaf">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item, `${idx}-${j}`)}</li>
              ))}
            </ol>
          );
        if (block.kind === "ul")
          return (
            <ul key={idx} className="list-disc space-y-2 pl-6 text-ink/85 marker:text-leaf">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item, `${idx}-${j}`)}</li>
              ))}
            </ul>
          );
        return (
          <p key={idx} className="leading-relaxed text-ink/85">
            {renderInline(block.text, `${idx}`)}
          </p>
        );
      })}
    </div>
  );
}
