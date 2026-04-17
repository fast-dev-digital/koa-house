import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { normalizeEmail } from "../utils/tenant";

export interface CriarTenantCadastroInput {
  tenantName: string;
  ownerName: string;
  ownerEmail: string;
  ownerUid: string;
}

const sanitizarSegmento = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const gerarTenantId = (tenantName: string, ownerUid: string): string => {
  const base = sanitizarSegmento(tenantName) || "tenant";
  const sufixo = ownerUid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "owner";
  return `tenant_${base}_${sufixo}`;
};

export async function criarTenantComOwner(
  input: CriarTenantCadastroInput,
): Promise<{ tenantId: string }> {
  const tenantId = gerarTenantId(input.tenantName, input.ownerUid);
  const agora = new Date().toISOString();
  const emailNormalizado = normalizeEmail(input.ownerEmail);

  await setDoc(doc(db, "tenants", tenantId), {
    tenantId,
    name: input.tenantName,
    status: "trial",
    planId: "starter",
    ownerUid: input.ownerUid,
    ownerEmail: emailNormalizado,
    ownerName: input.ownerName,
    createdAt: agora,
    updatedAt: agora,
    createdBy: input.ownerUid,
    updatedBy: input.ownerUid,
    source: "web",
  });

  await setDoc(doc(db, "users", input.ownerUid), {
    uid: input.ownerUid,
    email: emailNormalizado,
    nome: input.ownerName,
    active: true,
    tenantIds: [tenantId],
    tenantRoles: {
      [tenantId]: "owner",
    },
    createdAt: agora,
    updatedAt: agora,
  });

  await setDoc(doc(db, "admins", input.ownerUid), {
    nome: input.ownerName,
    email: emailNormalizado,
    role: "admin",
    tenantId,
    tenantIds: [tenantId],
    tenantRoles: {
      [tenantId]: "owner",
    },
    authUid: input.ownerUid,
    createdAt: agora,
    updatedAt: agora,
  });

  await setDoc(doc(db, `tenants/${tenantId}/members`, input.ownerUid), {
    uid: input.ownerUid,
    tenantId,
    role: "owner",
    active: true,
    email: emailNormalizado,
    nome: input.ownerName,
    createdAt: agora,
    updatedAt: agora,
  });

  return { tenantId };
}
