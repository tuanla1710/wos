"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
import { markdownFromPaste } from "@/lib/pasteHtml";

type Props = {
  value: string;
  onChange: (md: string) => void;
  upload: (file: File) => Promise<string>;
  onAttach?: () => void;
  tools?: ReactNode;
  placeholder?: string;
};

function markdownOf(editor: Editor): string {
  return (editor.storage.markdown as { getMarkdown: () => string }).getMarkdown();
}

/** markdown-it merges `- a` and `- [ ] b` into one task list; a different bullet char keeps them apart. */
function prepMarkdown(md: string): string {
  let fenced = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line.replace(/^(\s*)[-*+] (\[[ xX]\] )?/, (_all, pad: string, box?: string) => (box ? `${pad}* ${box}` : `${pad}- `));
    })
    .join("\n");
}

function imageFiles(data: DataTransfer | null): File[] {
  return Array.from(data?.files ?? []).filter((f) => f.type.startsWith("image/"));
}

export function RichNoteEditor({ value, onChange, upload, onAttach, tools, placeholder = "Write the note…" }: Props) {
  const emitted = useRef(value);
  const plain = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  async function insertImages(editor: Editor, files: File[], pos?: number) {
    setError("");
    for (const file of files) {
      setBusy((n) => n + 1);
      try {
        const src = await upload(file);
        const chain = editor.chain().focus();
        (pos === undefined ? chain : chain.setTextSelection(pos)).setImage({ src, alt: file.name }).run();
      } catch {
        setError(`Couldn’t upload ${file.name}.`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false, breaks: true, linkify: true, transformPastedText: true }),
    ],
    content: prepMarkdown(value),
    editorProps: {
      attributes: { class: "rich-note min-h-[360px] outline-none" },
      handleKeyDown: (_view, event) => {
        plain.current = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "v";
        return false;
      },
      handlePaste: (_view, event) => {
        const ed = editorRef.current;
        if (!ed) return false;
        const files = imageFiles(event.clipboardData);
        if (files.length) {
          event.preventDefault();
          void insertImages(ed, files);
          return true;
        }
        const md = markdownFromPaste(event.clipboardData, plain.current);
        plain.current = false;
        if (!md) return false;
        event.preventDefault();
        ed.commands.insertContent(prepMarkdown(md), { parseOptions: { preserveWhitespace: false } });
        return true;
      },
      handleDrop: (view, event) => {
        const ed = editorRef.current;
        const files = imageFiles(event.dataTransfer);
        if (!ed || !files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void insertImages(ed, files, at?.pos);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = markdownOf(ed);
      emitted.current = md;
      onChange(md);
    },
  });

  editorRef.current = editor;

  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(prepMarkdown(value), false);
  }, [editor, value]);

  const btn = (active: boolean) => `h-8 rounded px-2 font-semibold ${active ? "bg-hover text-ink" : "text-muted hover:bg-hover hover:text-ink"}`;

  return (
    <div className="flex flex-col gap-2">
      {editor && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 bg-bg py-1 text-[12px]">
          <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
            B
          </button>
          <button type="button" className={`${btn(editor.isActive("italic"))} italic`} onClick={() => editor.chain().focus().toggleItalic().run()}>
            I
          </button>
          <button type="button" className={`${btn(editor.isActive("strike"))} line-through`} onClick={() => editor.chain().focus().toggleStrike().run()}>
            S
          </button>
          {([1, 2, 3] as const).map((level) => (
            <button key={level} type="button" className={btn(editor.isActive("heading", { level }))} onClick={() => editor.chain().focus().toggleHeading({ level }).run()}>
              H{level}
            </button>
          ))}
          <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            List
          </button>
          <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            1.
          </button>
          <button type="button" className={btn(editor.isActive("taskList"))} onClick={() => editor.chain().focus().toggleTaskList().run()}>
            Checkbox
          </button>
          <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            Quote
          </button>
          <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            Code
          </button>
          <button
            type="button"
            className={btn(editor.isActive("link"))}
            onClick={() => {
              if (editor.isActive("link")) return void editor.chain().focus().unsetLink().run();
              const href = window.prompt("Link URL", "https://");
              if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            }}
          >
            Link
          </button>
          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            Table
          </button>
          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            —
          </button>
          {onAttach && (
            <button type="button" className={btn(false)} onClick={onAttach}>
              Attach
            </button>
          )}
          {tools}
          {busy > 0 && <span className="ml-2 text-muted">Uploading image…</span>}
          {error && <span className="ml-2 text-overdue">{error}</span>}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
