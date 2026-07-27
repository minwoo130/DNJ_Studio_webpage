export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  WAITING: "입금대기",
  PAID: "입금완료",
  CANCELLED: "취소됨",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: "주문접수",
  preparing: "상품준비중",
  cancelled: "주문취소",
};

export function paymentStatusBadgeClass(status: string) {
  if (status === "PAID") return "bg-green-50 text-green-600";
  if (status === "CANCELLED") return "bg-gray-100 text-gray-400";
  return "bg-yellow-50 text-yellow-700";
}
