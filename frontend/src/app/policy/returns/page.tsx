import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout title="교환/반품 정책" subtitle="Returns & Exchanges">
      <h2>교환/반품 가능 기간</h2>
      <p>상품 수령 후 7일 이내 신청 가능합니다 (전자상거래 등에서의 소비자보호에 관한 법률).</p>

      <h2>단순 변심에 의한 교환/반품</h2>
      <p>왕복 배송비를 고객이 부담합니다.</p>

      <h2>불량/오배송 상품</h2>
      <p>상품 하자, 오배송의 경우 무료로 교환 또는 반품해 드립니다.</p>

      <h2>교환/반품이 불가능한 경우</h2>
      <ul>
        <li>착용 흔적, 오염, 냄새 등 상품 가치가 훼손된 경우</li>
        <li>상품 택(tag) 제거 또는 부속품이 누락된 경우</li>
        <li>고객의 사용 또는 시간 경과로 재판매가 곤란할 정도로 가치가 훼손된 경우</li>
      </ul>

      <h2>신청 방법</h2>
      <p>마이페이지 주문내역 또는 고객센터 문의를 통해 접수해 주세요.</p>

      <p className="mt-8 text-xs text-gray-400">본 페이지는 예시 템플릿이며, 실제 운영 정책에 맞게 수정해야 합니다.</p>
    </PolicyLayout>
  );
}
