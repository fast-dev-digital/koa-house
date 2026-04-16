import {
  collection,
  collectionGroup,
  getDocs,
  limit,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { normalizeEmail, resolveTenantId } from "../utils/tenant";

interface IdentityLookupResult<T = Record<string, unknown>> {
  id: string;
  tenantId: string | null;
  data: T;
}

interface IdentityLookupOptions {
  expectedAuthUid?: string;
}

const extractTenantIdFromPath = (path: string): string | null => {
  const parts = path.split("/");
  const tenantsIndex = parts.indexOf("tenants");

  if (tenantsIndex === -1 || tenantsIndex + 1 >= parts.length) {
    return null;
  }

  const tenantId = parts[tenantsIndex + 1]?.trim();
  return tenantId ? tenantId : null;
};

const buildLookupResult = <T = Record<string, unknown>>(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): IdentityLookupResult<T> => {
  const data = docSnap.data() as T & Record<string, unknown>;
  const tenantFromData = resolveTenantId(data);
  const tenantFromPath = extractTenantIdFromPath(docSnap.ref.path);

  return {
    id: docSnap.id,
    tenantId: tenantFromData ?? tenantFromPath,
    data: data as T,
  };
};

export const buscarAdminPorEmail = async <T = Record<string, unknown>>(
  email: string,
): Promise<IdentityLookupResult<T> | null> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const adminQuery = query(
    collection(db, "admins"),
    where("email", "==", normalizedEmail),
    limit(1),
  );
  const adminSnapshot = await getDocs(adminQuery);

  if (adminSnapshot.empty) {
    return null;
  }

  return buildLookupResult<T>(adminSnapshot.docs[0]);
};

export const buscarAlunoPorEmail = async <T = Record<string, unknown>>(
  email: string,
  options?: IdentityLookupOptions,
): Promise<IdentityLookupResult<T> | null> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const alunoQuery = query(
    collectionGroup(db, "alunos"),
    where("email", "==", normalizedEmail),
  );
  const alunoSnapshot = await getDocs(alunoQuery);

  if (alunoSnapshot.empty) {
    return null;
  }

  const docs = alunoSnapshot.docs;
  const expectedAuthUid = options?.expectedAuthUid?.trim();

  if (expectedAuthUid) {
    const docComAuthUid = docs.find(
      (item) =>
        (item.data().authUid || "").toString().trim() === expectedAuthUid,
    );

    if (docComAuthUid) {
      return buildLookupResult<T>(docComAuthUid);
    }

    if (docs.length > 1) {
      console.warn(
        "Lookup de aluno ambíguo: email encontrado em múltiplos tenants sem match de authUid.",
      );
      return null;
    }
  }

  if (docs.length > 1) {
    console.warn(
      "Lookup de aluno por email retornou múltiplos documentos. Usando o primeiro resultado.",
    );
  }

  return buildLookupResult<T>(docs[0]);
};
