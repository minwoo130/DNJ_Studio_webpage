// 게시글/리뷰 작성자 이름을 공개 노출할 때 두번째 글자만 *로 가림 (예: 김민수 -> 김*수, 남궁민수 -> 남*민수)
export function maskName(name: string) {
  if (name.length <= 1) return name;
  return `${name[0]}*${name.slice(2)}`;
}
