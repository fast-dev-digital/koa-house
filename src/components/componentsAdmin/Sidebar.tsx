import { FaUser, FaChalkboardTeacher, FaUsers, FaMoneyBill, FaSignOutAlt, FaHome, FaUserPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import Logo from "/logo-brazuka.png"; // Altere o caminho se necessário

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth); // Desloga do Firebase
    navigate("/");
  };

  return (
    <aside className="w-56 bg-white h-screen flex flex-col justify-between border-r shadow-lg">
      <div className="flex items-center justify-center pt-6 pb-4">
        <Link to="/">
          <img src={Logo} alt="Logo" className="h-12 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 mt-2">
        <ul className="space-y-1">
          <li>
            <Link to="/admin-dashboard" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <FaHome /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/gestao-alunos" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <FaUser /> Gestão de alunos
            </Link>
          </li>
          <li>
            <Link to="/gestao-professores" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <FaChalkboardTeacher /> Gestão de Professores
            </Link>
          </li>
          <li>
            <Link to="/gestao-turmas" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <FaUsers /> Gestão de Turmas
            </Link>
          </li>
          <li>
            <Link to="/controle-pagamentos" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <FaMoneyBill /> Controle de Pagamentos
            </Link>
          </li>
          <li>
            <Link to="/admin-dashboard/cadastrar" className="flex items-center gap-3 px-6 py-3 text-green-700 hover:bg-green-100 cursor-pointer">
              <FaUserPlus /> Cadastrar Admin
            </Link>
          </li>
        </ul>
      </nav>
      <div className="pb-6">
        <ul>
          <li
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Sair
          </li>
        </ul>
      </div>
    </aside>
  );
}