const BLOCK = new Set([
  "P", "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER", "ASIDE", "FIGURE",
  "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "PRE", "BLOCKQUOTE", "TABLE", "HR",
]);
const SKIP = new Set(["BUTTON", "SVG", "STYLE", "SCRIPT", "NOSCRIPT", "TEMPLATE", "HEAD", "META", "LINK", "TITLE"]);
const RICH = /<(h[1-6]|strong|b|em|i|ul|ol|li|table|pre|code|blockquote|a|hr|del|s)\b/i;

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return blocks(doc.body)
    .join("\n\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Markdown for a paste event, or null to let the browser paste plain text. */
export function markdownFromPaste(data: DataTransfer | null, plain: boolean): string | null {
  if (!data || plain) return null;
  const html = data.getData("text/html");
  if (!html || !RICH.test(html)) return null;
  const md = htmlToMarkdown(html);
  return md || null;
}

function blocks(el: Node): string[] {
  const out: string[] = [];
  let buf = "";
  const flush = () => {
    const t = buf.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").trim();
    if (t) out.push(t);
    buf = "";
  };
  el.childNodes.forEach((child) => {
    if (child instanceof Element && SKIP.has(child.tagName)) return;
    if (child instanceof Element && (BLOCK.has(child.tagName) || child.classList.contains("katex-display"))) {
      flush();
      out.push(...block(child));
    } else if (child instanceof Element && child.tagName === "BR") {
      buf += "\n";
    } else {
      buf += inline(child);
    }
  });
  flush();
  return out;
}

function block(el: Element): string[] {
  const tag = el.tagName;
  if (el.classList.contains("katex-display")) {
    const tex = texOf(el);
    return tex ? [`$$\n${tex}\n$$`] : [];
  }
  if (tag === "H1") return line("# ", el);
  if (tag === "H2") return line("## ", el);
  if (/^H[3-6]$/.test(tag)) return line("### ", el);
  if (tag === "HR") return ["---"];
  if (tag === "PRE") return [fence(el)];
  if (tag === "UL" || tag === "OL") return [list(el, 0)];
  if (tag === "TABLE") return [table(el)];
  if (tag === "BLOCKQUOTE") {
    const body = blocks(el).join("\n\n");
    return body ? [body.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n")] : [];
  }
  if (tag === "P") {
    const t = inlineChildren(el).trim();
    return t ? [t] : [];
  }
  return blocks(el);
}

function line(prefix: string, el: Element): string[] {
  const t = inlineChildren(el).replace(/\s*\n\s*/g, " ").trim();
  return t ? [prefix + t] : [];
}

function inlineChildren(el: Element): string {
  let s = "";
  el.childNodes.forEach((child) => {
    if (child instanceof Element && child.tagName === "BR") s += "\n";
    else if (child instanceof Element && (child.tagName === "P" || child.tagName === "DIV")) s += (s ? "\n" : "") + inlineChildren(child).trim();
    else s += inline(child);
  });
  return s;
}

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\s+/g, " ");
  if (!(node instanceof Element) || SKIP.has(node.tagName)) return "";
  if (node.classList.contains("katex")) {
    const tex = texOf(node);
    return tex ? `$${tex}$` : "";
  }
  const tag = node.tagName;
  const style = node.getAttribute("style") ?? "";
  if (tag === "CODE") return code(node.textContent ?? "");
  if (tag === "BR") return "\n";
  if (tag === "IMG") {
    const src = node.getAttribute("src") ?? "";
    return /^https?:/.test(src) ? `![${node.getAttribute("alt") ?? ""}](${src})` : "";
  }
  const inner = inlineChildren(node);
  if (tag === "A") {
    const href = node.getAttribute("href") ?? "";
    const text = inner.trim();
    return /^https?:/.test(href) && text ? `[${text}](${href})` : inner;
  }
  if ((tag === "STRONG" || tag === "B") && !/font-weight:\s*(normal|[1-5]00)/.test(style)) return wrap(inner, "**");
  if (tag === "EM" || tag === "I") return wrap(inner, "*");
  if (tag === "DEL" || tag === "S" || tag === "STRIKE") return wrap(inner, "~~");
  if (tag === "SPAN") {
    let s = inner;
    if (/font-weight:\s*(bold|[6-9]00)/.test(style)) s = wrap(s, "**");
    if (/font-style:\s*italic/.test(style)) s = wrap(s, "*");
    if (/text-decoration[^;]*line-through/.test(style)) s = wrap(s, "~~");
    return s;
  }
  return inner;
}

function wrap(text: string, mark: string): string {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  if (!m || !m[2]) return text;
  return `${m[1]}${mark}${m[2]}${mark}${m[3]}`;
}

function code(text: string): string {
  const t = text.replace(/\s+/g, " ");
  return t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``;
}

function texOf(el: Element): string {
  return (el.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? "").trim();
}

function fence(pre: Element): string {
  const codeEl = pre.querySelector("code") ?? pre;
  const cls = `${codeEl.className} ${pre.className}`;
  const lang = /language-([\w+#-]+)/.exec(cls)?.[1]?.toLowerCase() ?? "";
  const text = (codeEl.textContent ?? "").replace(/\n+$/, "");
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

function list(el: Element, depth: number): string {
  const ordered = el.tagName === "OL";
  let n = Number(el.getAttribute("start") ?? 1) || 1;
  const pad = "  ".repeat(depth);
  const lines: string[] = [];
  Array.from(el.children).forEach((li) => {
    if (li.tagName !== "LI") return;
    const box = li.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    const nested: string[] = [];
    const fences: string[] = [];
    let text = "";
    li.childNodes.forEach((child) => {
      if (child instanceof Element && (child.tagName === "UL" || child.tagName === "OL")) nested.push(list(child, depth + 1));
      else if (child instanceof Element && child.tagName === "PRE") fences.push(fence(child));
      else if (child instanceof Element && child.tagName === "INPUT") return;
      else if (child instanceof Element && BLOCK.has(child.tagName)) text += ` ${inlineChildren(child)}`;
      else text += inline(child);
    });
    const marker = box ? `- [${box.checked ? "x" : " "}] ` : ordered ? `${n}. ` : "- ";
    lines.push(pad + marker + text.replace(/\s+/g, " ").trim());
    lines.push(...nested, ...fences);
    n += 1;
  });
  return lines.join("\n");
}

function table(el: Element): string {
  const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.querySelectorAll("th,td")).map((c) => inlineChildren(c).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim()),
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const fill = (r: string[]) => `| ${[...r, ...Array(width - r.length).fill("")].join(" | ")} |`;
  return [fill(rows[0]), `|${" --- |".repeat(width)}`, ...rows.slice(1).map(fill)].join("\n");
}
