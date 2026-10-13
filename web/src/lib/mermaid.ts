const START =
  /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|mindmap|timeline|gitGraph|journey|C4Context|C4Container|C4Component|C4Dynamic|quadrantChart|requirementDiagram|sankey-beta|xychart-beta|block-beta|packet-beta|kanban|architecture-beta)\b/;

export function mermaidSource(raw: string) {
  let text = raw.replace(/\r\n/g, "\n").trim();
  const fenced = /^```(?:mermaid)?[^\n]*\n([\s\S]*?)\n```$/i.exec(text);
  if (fenced?.[1]) text = fenced[1].trim();
  return text;
}

export function isMermaidSource(lang: string, code: string) {
  if (/^mermaid$/i.test(lang.trim())) return true;
  return START.test(mermaidSource(code));
}

let mermaidReady: Promise<typeof import("mermaid").default> | null = null;
let draw = 0;

export function mermaidEngine() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "antiscript",
        theme: "base",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        flowchart: { htmlLabels: true, useMaxWidth: true, curve: "basis" },
        sequence: { useMaxWidth: true },
        themeVariables: {
          primaryColor: "#E4EAF3",
          primaryTextColor: "#1C1917",
          primaryBorderColor: "#1B365D",
          lineColor: "#1B365D",
          secondaryColor: "#F7F6F3",
          tertiaryColor: "#FFFFFF",
          clusterBkg: "#F7F6F3",
          clusterBorder: "#E4E2DB",
          edgeLabelBackground: "#FFFFFF",
          noteBkgColor: "#E4EAF3",
          noteTextColor: "#1B365D",
        },
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

export function nextMermaidId() {
  draw += 1;
  return `wos-mmd-${draw}`;
}
