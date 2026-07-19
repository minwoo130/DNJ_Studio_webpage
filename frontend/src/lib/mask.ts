// 게시글/리뷰 작성자 이름을 공개 노출할 때 가운데 글자를 *로 가림 (예: 김민수 -> 김*수)
export function maskName(name: string) {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}
