import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout title="RETURN & EXCHANGE">
      <h2>교환 및 반품 주소</h2>
      <p>(02084) 서울 중랑구 신내로 7나길 24 209동 1004호</p>

      <h2>반품 접수 시 별도 안내</h2>
      <p>
        ※ 임의로 상품을 발송하실 경우 반송될 수 있으니 반드시 고객센터를 통해 접수 후 진행해
        주시기 바랍니다.
      </p>

      <hr className="my-8 border-gray-100" />

      <h2>교환 및 반품 가능 기간</h2>
      <ul>
        <li>상품 수령일로부터 3일 이내 신청 가능합니다.</li>
        <li>상품 불량 또는 오배송의 경우 수령일로부터 7일 이내 접수 가능합니다.</li>
      </ul>

      <hr className="my-8 border-gray-100" />

      <h2>교환 및 반품이 가능한 경우</h2>
      <ul>
        <li>상품이 표시·광고 내용과 다르거나 불량 및 오배송된 경우</li>
        <li>상품 수령 후 7일 이내 미사용 상태로 보관 중인 경우</li>
      </ul>

      <hr className="my-8 border-gray-100" />

      <h2>교환 및 반품이 불가능한 경우</h2>
      <ul>
        <li>상품 수령 후 7일이 경과한 경우</li>
        <li>착용, 세탁, 향수 및 화장품 냄새 등 사용 흔적이 있는 경우</li>
        <li>상품 훼손 및 오염이 발생한 경우</li>
        <li>택(Tag) 제거 및 구성품이 누락된 경우</li>
        <li>고객 부주의로 상품 가치가 훼손된 경우</li>
      </ul>

      <hr className="my-8 border-gray-100" />

      <h2>반품 배송비</h2>
      <ul>
        <li>단순 변심 반품: 왕복 배송비 고객 부담</li>
        <li>색상 및 사이즈 교환: 왕복 배송비 고객 부담</li>
        <li>불량 및 오배송: 판매자 부담</li>
      </ul>
    </PolicyLayout>
  );
}
