import { isDemoPage, isDemoRole } from "@/demo/roles";
import type { DemoPage, DemoRole } from "@/demo/types";

export interface WorkspaceLocation {
  role: DemoRole;
  page: DemoPage;
}

export function parseWorkspacePath(pathname: string): WorkspaceLocation | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "app" || !isDemoRole(parts[1])) return null;
  return {
    role: parts[1],
    page: isDemoPage(parts[2]) ? (parts[2] as DemoPage) : "overview",
  };
}

export function workspacePath(role: DemoRole, page: DemoPage = "overview") {
  return `/app/${role}/${page}`;
}