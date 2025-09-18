import { useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categoriasOpcoes = [
  { label: "Estreante", value: "Estreante" },
  { label: "Iniciante", value: "Iniciante" },
  { label: "Intermediário", value: "Intermediário" },
  { label: "Misto Bronze", value: "Misto Bronze" },
  { label: "Misto Prata", value: "Misto Prata" },
  { label: "A+B", value: "A+B" },
];
const whatsappNumber = "5519981924006";

export default function CadastrarTorneio() {
  const [nome, setNome] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nomeDuplas, setNomeDuplas] = useState<{ [key: string]: string }>({});

  const handleCategoriaChange = (categoria: string) => {
    setCategorias((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleObservacaoChange = (categoria: string, valor: string) => {
    setNomeDuplas((prev) => ({
      ...prev,
      [categoria]: valor,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let mensagem = `*Cadastro de Torneio*\n\n`;
    mensagem += `*Nome do Aluno:* ${nome}\n`;
    mensagem += `*Tamanho do Uniforme:* ${tamanho}\n`;
    mensagem += `*Categorias Participadas:*\n`;

    categorias.forEach((cat) => {
      mensagem += `- ${cat}`;
      if (nomeDuplas[cat]) {
        mensagem += ` | Dupla: ${nomeDuplas[cat]}`;
      }
      mensagem += `\n`;
    });

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank");
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/aluno")}
          className="mb-4 text-sm text-gray-600 hover:text-green-700 flex items-center gap-2"
        >
          {/* Ícone de seta para a esquerda */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar para Dashboard
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Cadastra-se no Torneio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome do Aluno
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-base"
              placeholder="Seu nome"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tamanho do Uniforme
            </label>
            <input
              type="text"
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-base"
              placeholder="Coloque o tamanho de P a GG e o genêro ao lado"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Categorias Participadas
            </label>
            <div className="space-y-2">
              {categoriasOpcoes.map((cat) => (
                <div
                  key={cat.value}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={cat.value}
                      checked={categorias.includes(cat.value)}
                      onChange={() => handleCategoriaChange(cat.value)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label htmlFor={cat.value} className="text-sm">
                      {cat.label}
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Digite o nome da dupla"
                    value={nomeDuplas[cat.value] || ""}
                    onChange={(e) =>
                      handleObservacaoChange(cat.value, e.target.value)
                    }
                    className="w-full sm:w-auto px-2 py-1 border rounded-lg text-sm mt-2 sm:mt-0"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-base"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
