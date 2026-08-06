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

// QnA는 문의 내용에 개인정보가 포함되기 쉬워 항상 비밀글로 강제한다
// (작성자·관리자만 열람/댓글 가능).
export const FORCE_PRIVATE_BOARD_TYPES: BoardType[] = ["qna"];

export function isForcedPrivateBoard(boardType: BoardType): boolean {
  return FORCE_PRIVATE_BOARD_TYPES.includes(boardType);
}

// 반품/교환은 공지사항처럼 관리자만 작성하는 공지성 게시판: 항상 전체 공개(비밀글 불가)이고 댓글도 없다.
export const NOTICE_LIKE_BOARD_TYPES: BoardType[] = ["notice", "exchange"];

export function isNoticeLikeBoard(boardType: BoardType): boolean {
  return NOTICE_LIKE_BOARD_TYPES.includes(boardType);
}
