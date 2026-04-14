export const normalizeEmail = (email?: string | null) => {
  if (!email) {
    return "";
  }

  return email.trim().toLowerCase();
};

export const resolveTenantId = (source?: Record<string, unknown> | null) => {
  if (!source) {
    return null;
  }

  const tenantId = source.tenantId ?? source.idConta ?? source.accountId;

  if (typeof tenantId !== "string") {
    return null;
  }

  const trimmedTenantId = tenantId.trim();
  return trimmedTenantId.length > 0 ? trimmedTenantId : null;
};
