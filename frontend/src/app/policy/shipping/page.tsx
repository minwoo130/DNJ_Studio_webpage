import PolicyLayout from "@/components/PolicyLayout";

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="배송정책" subtitle="Shipping Policy">
      <h2>배송 기간</h2>
      <p>결제 확인 후 평균 1~3영업일 이내 출고됩니다 (주말·공휴일 제외).</p>

      <h2>배송 업체</h2>
      <p>CJ대한통운을 통해 배송됩니다.</p>

      <h2>배송비</h2>
      <ul>
        <li>기본 배송비: 3,000원</li>
        <li>6만원 이상 구매 시 무료배송</li>
      </ul>

      <h2>배송지 안내</h2>
      <p>
        도서·산간 지역은 추가 배송비가 발생하거나 배송이 지연될 수 있습니다. 주문 시 입력한 배송지
        정보가 정확한지 반드시 확인해 주세요.
      </p>

      <p className="mt-8 text-xs text-gray-400">본 페이지는 예시 템플릿이며, 실제 계약 택배사·배송비 정책에 맞게 수정해야 합니다.</p>
    </PolicyLayout>
  );
}
