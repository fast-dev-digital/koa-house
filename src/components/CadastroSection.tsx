import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase-config";
import { criarTenantComOwner } from "../services/tenantService";

type CadastroSectionProps = {
  embedded?: boolean;
};

function CadastroSection({ embedded = false }: CadastroSectionProps) {
  const [nomeAcademia, setNomeAcademia] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [CPF, setCPF] = useState("");
  const [Telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCadastro = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");

    if (senha !== confirmarSenha) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        senha,
      );
      const user = userCredential.user;

      await criarTenantComOwner({
        tenantName: nomeAcademia.trim(),
        ownerName: nome.trim(),
        ownerEmail: normalizedEmail,
        ownerUid: user.uid,
      });

      await sendEmailVerification(user);

      await signOut(auth);

      alert(
        "Conta e tenant criados com sucesso! Verifique seu email para confirmar a conta.",
      );
      navigate("/login");
    } catch (err: any) {
      console.error("Error no cadastro:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter no mínimo 6 caracteres.");
      } else {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={handleCadastro} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="nome-academia"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            Nome da Academia
          </label>
          <input
            type="text"
            id="nome-academia"
            value={nomeAcademia}
            onChange={(e) => setNomeAcademia(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label
            htmlFor="nome"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            Nome Completo
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label
            htmlFor="CPF"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            CPF
          </label>
          <input
            type="text"
            id="CPF"
            value={CPF}
            onChange={(e) => setCPF(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label
            htmlFor="Telefone"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            Telefone
          </label>
          <input
            type="tel"
            id="Telefone"
            value={Telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label
            htmlFor="senha"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            Senha
          </label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="confirmar-senha"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
          >
            Confirmar Senha
          </label>
          <input
            type="password"
            id="confirmar-senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-koa-brown focus:ring-4 focus:ring-amber-100"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-koa-brown px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Já tem uma conta?{" "}
        <Link
          to="/login"
          className="font-semibold text-koa-brown hover:underline"
        >
          Faça login
        </Link>
      </p>
    </form>
  );

  if (embedded) {
    return (
      <section
        id="cadastro"
        className="py-20 bg-gradient-to-br from-stone-50 via-amber-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full bg-koa-brown/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-koa-brown">
                Cadastro da academia
              </span>
              <h2 className="mt-6 text-4xl md:text-5xl font-black leading-tight text-gray-900">
                Leve sua operação para o digital em poucos minutos.
              </h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                Crie a conta principal da sua academia, organize alunos e
                permita que sua equipe comece a operar com uma estrutura pronta
                para crescer.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 text-sm text-gray-700">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <strong className="mb-1 block text-gray-900">
                    Conta centralizada
                  </strong>
                  Tudo começa com um tenant único para a sua operação.
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <strong className="mb-1 block text-gray-900">
                    Acesso seguro
                  </strong>
                  O e-mail de verificação protege o primeiro acesso.
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur">
              {form}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center" />
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg md:max-w-2xl rounded-[2rem] bg-white/95 p-6 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-gray-900">
              Criar Conta da Academia
            </h1>
            <p className="mt-2 text-gray-500">
              Crie o tenant principal da sua operação
            </p>
          </div>
          {form}
        </div>
      </div>
    </>
  );
}

export default CadastroSection;
