import { api } from "./api";

export async function logOut(router: { replace: (href: string) => void }) {
  await api("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("workspaceId");
  router.replace("/login");
}
