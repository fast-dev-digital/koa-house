import { fecharMesComArray } from "../integracaoService";

jest.mock("../../firebase-config", () => ({
  db: {},
}));

describe("fecharMesComArray", () => {
  it("retorna erro se não encontrar alunos ativos", async () => {
    const result = await fecharMesComArray("tenant-teste");
    expect(result.alunosProcessados).toBe(0);
    expect(result.pagamentosArquivados).toBe(0);
    expect(result.novosPagamentosGerados).toBe(0);
    expect(result.erro).toBeDefined();
  });
});
