"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, FontFamily } from "@/lib/tiptap-font-extensions";
import { AlignableImage } from "@/lib/tiptap-image-align";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const FONT_FAMILIES = [
  { label: "기본 글꼴", value: "" },
  { label: "고딕", value: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" },
  { label: "명조", value: "'Batang', 'Apple Myungjo', serif" },
  { label: "굴림", value: "'Gulim', sans-serif" },
  { label: "궁서", value: "'Gungsuh', serif" },
];

const FONT_SIZES = [
  { label: "기본 크기", value: "" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
];

function authHeader() {
  const token = sessionStorage.getItem("token");
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
  onUploadingChange,
}: {
  value: string;
  onChange: (html: string) => void;
  uploadEndpoint?: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadFiles(files: File[], targetEditor: Editor) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    setUploading(true);
    onUploadingChange?.(true);
    setUploadError(null);

    for (const file of imageFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        setUploadError(`"${file.name}" 용량이 15MB를 초과해 건너뛰었습니다.`);
        continue;
      }

      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`${API_URL}${uploadEndpoint}`, {
        method: "POST",
        headers: authHeader(),
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setUploadError(data?.error ?? `"${file.name}" 업로드에 실패했습니다.`);
        continue;
      }
      const data = await res.json();
      targetEditor.chain().focus().setImage({ src: data.url }).run();
    }

    setUploading(false);
    onUploadingChange?.(false);
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({ types: ["paragraph"] }),
      AlignableImage.configure({ HTMLAttributes: { class: "rounded-md" } }),
      Placeholder.configure({
        placeholder: "상세페이지 내용을 작성하세요 (텍스트 입력, 사진은 버튼으로 추가하거나 드래그·붙여넣기로도 추가할 수 있어요)",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-content min-h-[240px] px-3 py-2 text-sm outline-none",
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (!files.length || !editor) return false;
        event.preventDefault();
        uploadFiles(files, editor);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.length || !editor) return false;
        event.preventDefault();
        uploadFiles(files, editor);
        return true;
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
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!editor) return;
    await uploadFiles(files, editor);
  }

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
        <select
          aria-label="글꼴"
          value={editor.getAttributes("textStyle").fontFamily ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          className="rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-600"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="글자 크기"
          value={editor.getAttributes("textStyle").fontSize ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(v).run();
          }}
          className="rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-600"
        >
          {FONT_SIZES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
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
        <ToolbarButton
          label="왼쪽 정렬"
          active={
            editor.isActive("image") ? editor.isActive("image", { align: null }) : editor.isActive({ textAlign: "left" })
          }
          onClick={() =>
            editor.isActive("image")
              ? editor.chain().focus().updateAttributes("image", { align: null }).run()
              : editor.chain().focus().setTextAlign("left").run()
          }
        >
          ≡←
        </ToolbarButton>
        <ToolbarButton
          label="가운데 정렬"
          active={
            editor.isActive("image")
              ? editor.isActive("image", { align: "center" })
              : editor.isActive({ textAlign: "center" })
          }
          onClick={() =>
            editor.isActive("image")
              ? editor.chain().focus().updateAttributes("image", { align: "center" }).run()
              : editor.chain().focus().setTextAlign("center").run()
          }
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          label="오른쪽 정렬"
          active={
            editor.isActive("image")
              ? editor.isActive("image", { align: "right" })
              : editor.isActive({ textAlign: "right" })
          }
          onClick={() =>
            editor.isActive("image")
              ? editor.chain().focus().updateAttributes("image", { align: "right" }).run()
              : editor.chain().focus().setTextAlign("right").run()
          }
        >
          →≡
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
        {uploading && <span className="px-1 text-xs text-gray-400">사진 업로드 중...</span>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageFile}
          className="hidden"
        />
      </div>
      {uploadError && (
        <p className="border-b border-gray-200 bg-red-50 px-3 py-1.5 text-xs text-brand-red">{uploadError}</p>
      )}
      <EditorContent editor={editor} />
      <p className="border-t border-gray-100 px-3 py-1.5 text-[11px] text-gray-400">
        사진은 여러 장 한번에 선택하거나, 파일을 끌어다 놓거나(드래그), 복사한 이미지를 붙여넣기(Ctrl+V)해도 추가됩니다. 사진에 마우스를
        올리면 나오는 ▲▼ 버튼으로 순서를 바꾸거나, 사진을 직접 끌어서 원하는 위치로 옮길 수 있어요.
      </p>
    </div>
  );
}
