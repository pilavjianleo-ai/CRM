export const WORKSPACE_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type WorkspaceRoleValue =
  (typeof WORKSPACE_ROLES)[keyof typeof WORKSPACE_ROLES];
