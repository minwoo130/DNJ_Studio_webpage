import PolicyLayout from "@/components/PolicyLayout";

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="환불정책" subtitle="Refund Policy">
      <h2>환불 처리 기준</h2>
      <p>교환/반품 접수 및 상품 회수가 확인된 이후 환불이 진행됩니다.</p>

      <h2>결제 수단별 환불 방법</h2>
      <ul>
        <li>신용카드 결제: 카드 승인 취소 (영업일 기준 2~3일 소요)</li>
        <li>무통장입금(계좌이체): 입력하신 환불 계좌로 영업일 기준 2~3일 이내 환불</li>
        <li>카카오페이/네이버페이 등 간편결제: 각 결제수단 정책에 따라 환불</li>
      </ul>

      <h2>환불 지연 사유</h2>
      <p>
        상품 회수 지연, 결제사 사정 등으로 환불이 지연될 수 있으며, 진행 상황은 고객센터를 통해
        안내해 드립니다.
      </p>

      <p className="mt-8 text-xs text-gray-400">
        본 페이지는 예시 템플릿이며, 실제 연동하는 PG사·결제수단 정책에 맞게 수정해야 합니다.
      </p>
    </PolicyLayout>
  );
}
