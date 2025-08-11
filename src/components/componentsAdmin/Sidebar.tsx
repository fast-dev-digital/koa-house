import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield,
  FaDollarSign,
} from "react-icons/fa";

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: "/admin-dashboard",
  },
  {
    id: "alunos",
    label: "Gestão de Alunos",
    icon: <FaUsers />,
    path: "/gestao-alunos",
  },
  {
    id: "turmas",
    label: "Gestão de Turmas",
    icon: <FaUserGraduate />,
    path: "/gestao-turmas",
  },
  {
    id: "professores",
    label: "Gestão de Professores",
    icon: <FaChalkboardTeacher />,
    path: "/gestao-professores",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: <FaDollarSign />,
    path: "/gestao-pagamentos",
  },
  {
    id: "cadastrar-admin",
    label: "Cadastrar Admin",
    icon: <FaUserShield />,
    path: "/cadastrar-admin",
  },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar se é mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fechar sidebar ao mudar de rota no mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // ✅ FUNÇÃO DE LOGOUT
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Confirmar antes de sair
      const confirmLogout = window.confirm(
        "Tem certeza que deseja sair do sistema?"
      );
      if (!confirmLogout) {
        setIsLoggingOut(false);
        return;
      }

      // Fazer logout no Firebase
      await signOut(auth);

      // Limpar dados locais (se houver)
      localStorage.removeItem("adminData");
      localStorage.removeItem("authToken");
      sessionStorage.clear();

      // Mostrar mensagem de sucesso
      console.log("✅ Logout realizado com sucesso!");

      // Redirecionar para página de HomePage
      navigate("/");
    } catch (error: any) {
      console.error("❌ Erro ao fazer logout:", error);
      alert("Erro ao sair do sistema. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Botão Menu Mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-green-600 text-white p-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile ? "fixed" : "sticky"} 
        top-0 left-0 h-screen 
        ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }
        transition-transform duration-300 ease-in-out
        z-50 bg-white shadow-lg border-r border-gray-200
        ${isMobile ? "w-80" : "w-64"}
        ${className}
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-1 rounded-lg flex items-center justify-center">
              <img src="/logo-brazuka.png" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Arena Brazuka</h1>
              <p className="text-sm text-gray-600">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-green-100 text-green-700 border-r-4 border-green-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span
                      className={`text-lg ${
                        isActive ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Botão de Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <FaSignOutAlt
              className={`text-gray-500 group-hover:text-red-600 transition-colors ${
                isLoggingOut ? "animate-spin" : ""
              }`}
            />
            <span className="font-medium">
              {isLoggingOut ? "Saindo..." : "Sair"}
            </span>
            {isLoggingOut && (
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
