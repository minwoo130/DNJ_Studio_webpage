import Image from "@tiptap/extension-image";

// 이미지 정렬(왼쪽/가운데/오른쪽): margin auto 트릭이라 이미지 폭이 컨테이너보다 좁을 때 위치 차이가 보임
export const AlignableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-align"),
        renderHTML: (attributes: { align?: string | null }) => {
          if (attributes.align === "center") {
            return { "data-align": "center", style: "margin-left: auto; margin-right: auto;" };
          }
          if (attributes.align === "right") {
            return { "data-align": "right", style: "margin-left: auto; margin-right: 0;" };
          }
          return {};
        },
      },
    };
  },
});
