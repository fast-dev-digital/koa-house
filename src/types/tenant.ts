export type TenantStatus = "trial" | "ativo" | "suspenso";

export interface BaseTenantDoc {
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TenantAccount {
  id: string;
  name: string;
  status: TenantStatus;
  planId?: string;
  tenantIds?: string[];
}

export interface TenantMembership {
  uid: string;
  tenantId: string;
  role: "owner" | "admin" | "staff" | "user";
  active: boolean;
}
