export type BoardType = "notice" | "review" | "qna" | "exchange";

export const BOARD_LABELS: Record<BoardType, string> = {
  notice: "Notice",
  review: "Review",
  qna: "QnA",
  exchange: "반품/교환",
};

export function isBoardType(value: string): value is BoardType {
  return value in BOARD_LABELS;
}
