import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

const LANGS: [string, typeof python][] = [
  ["python", python],
  ["c", c],
  ["cpp", cpp],
  ["css", css],
  ["go", go],
  ["java", java],
  ["javascript", javascript],
  ["json", json],
  ["markdown", markdown],
  ["bash", bash],
  ["sql", sql],
  ["typescript", typescript],
  ["xml", xml],
  ["yaml", yaml],
  ["rust", rust],
];

for (const [name, def] of LANGS) hljs.registerLanguage(name, def);

const ALIAS: Record<string, string> = {
  py: "python",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  node: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "xml",
  svg: "xml",
  yml: "yaml",
  md: "markdown",
  cplusplus: "cpp",
  "c++": "cpp",
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightLang(lang: string) {
  const raw = lang.trim().toLowerCase();
  if (!raw || raw === "text" || raw === "plain" || raw === "plaintext" || raw === "mermaid") return "";
  return ALIAS[raw] ?? raw;
}

export function highlightHtml(lang: string, code: string) {
  const id = highlightLang(lang);
  if (!id || !hljs.getLanguage(id)) return escapeHtml(code);
  try {
    return hljs.highlight(code, { language: id, ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(code);
  }
}
