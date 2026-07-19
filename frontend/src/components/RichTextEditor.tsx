"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded px-2 py-1 text-xs font-semibold ${
        active ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  uploadEndpoint = "/api/products/upload",
}: {
  value: string;
  onChange: (html: string) => void;
  uploadEndpoint?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-md" } }),
      Placeholder.configure({ placeholder: "상세페이지 내용을 작성하세요 (텍스트, 사진 자유롭게 배치)" }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-content min-h-[240px] px-3 py-2 text-sm outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && document.activeElement?.tagName !== "DIV") {
      // 외부에서 초기값(수정 모드로 기존 글 불러오기)이 바뀔 때만 동기화, 타이핑 중 커서 튀는 것 방지
      if (!editor.isFocused) {
        editor.commands.setContent(value || "", false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`${API_URL}${uploadEndpoint}`, {
      method: "POST",
      headers: authHeader(),
      body,
    });
    if (!res.ok) return;
    const data = await res.json();
    editor.chain().focus().setImage({ src: data.url }).run();
  }

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
        <ToolbarButton
          label="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          label="제목2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="제목3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="글머리 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •ㅡ
        </ToolbarButton>
        <ToolbarButton
          label="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton label="사진 삽입" onClick={() => fileInputRef.current?.click()}>
          🖼
        </ToolbarButton>
        <ToolbarButton label="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </ToolbarButton>
        <ToolbarButton label="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
