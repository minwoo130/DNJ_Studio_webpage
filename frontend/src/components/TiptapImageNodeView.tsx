"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Fragment } from "@tiptap/pm/model";

function moveImage(editor: NodeViewProps["editor"], getPos: NodeViewProps["getPos"], direction: -1 | 1) {
  const pos = getPos();
  if (typeof pos !== "number") return;
  const { state, view } = editor;
  const $pos = state.doc.resolve(pos);
  const parent = $pos.parent;
  const index = $pos.index();
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= parent.childCount) return;

  const children = [];
  for (let i = 0; i < parent.childCount; i++) children.push(parent.child(i));
  [children[index], children[targetIndex]] = [children[targetIndex], children[index]];

  const parentStart = $pos.start();
  view.dispatch(state.tr.replaceWith(parentStart, parentStart + parent.content.size, Fragment.fromArray(children)));
}

export default function TiptapImageNodeView({ node, editor, getPos, selected }: NodeViewProps) {
  const align = (node.attrs.align as string | null) ?? null;
  const justify = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <NodeViewWrapper
      as="div"
      data-drag-handle
      contentEditable={false}
      className="group relative my-3 flex"
      style={{ justifyContent: justify, cursor: "grab" }}
    >
      <div className={`relative inline-block ${selected ? "outline outline-2 outline-black" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          draggable={false}
          className="block max-w-full rounded-md"
        />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="pointer-events-auto mt-1 flex gap-0.5 rounded-md bg-black/75 px-1 py-1">
            <button
              type="button"
              title="위로 이동"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => moveImage(editor, getPos, -1)}
              className="rounded px-1.5 py-0.5 text-xs text-white hover:bg-white/20"
            >
              ▲
            </button>
            <button
              type="button"
              title="아래로 이동"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => moveImage(editor, getPos, 1)}
              className="rounded px-1.5 py-0.5 text-xs text-white hover:bg-white/20"
            >
              ▼
            </button>
            <button
              type="button"
              title="사진 삭제"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const pos = getPos();
                if (typeof pos !== "number") return;
                editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
              }}
              className="rounded px-1.5 py-0.5 text-xs text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
