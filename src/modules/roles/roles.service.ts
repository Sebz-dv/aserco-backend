export type Role = {
  id: number;
  name: string;
  description?: string;
};

export async function listRoles(): Promise<Role[]> {
  return [];
}
