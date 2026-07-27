// Server Components run inside the frontend container, so they must reach the
// backend over the Docker network (service name), not the host-mapped port.
const API_BASE = process.env.API_INTERNAL_URL ?? "http://backend:4000";

export type NoticeItem = {
  id: number;
  title: string;
  createdAt: string;
};

export async function fetchNotices(limit = 3): Promise<NoticeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/community/notice?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}
