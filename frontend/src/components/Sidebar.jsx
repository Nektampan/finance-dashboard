import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const menus = [
    { path: "/", label: "Dashboard", icon: "ti-layout-dashboard" },
    { path: "/transactions", label: "Transaksi", icon: "ti-arrows-exchange" },
    { path: "/categories", label: "Kategori", icon: "ti-tag" },
  ];

  return (
    <aside style={{background: "#0f172a"}} className="w-60 min-h-screen flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{borderColor: "#1e293b"}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className="text-white text-base font-semibold">FinanceOS</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-medium px-3 mb-3" style={{color: "#475569"}}>MENU</p>
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: location.pathname === menu.path ? "#1e3a5f" : "transparent",
              color: location.pathname === menu.path ? "#60a5fa" : "#94a3b8",
            }}
          >
            <i className={`ti ${menu.icon} text-lg`} aria-hidden="true"></i>
            {menu.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{borderTop: "0.5px solid #1e293b"}}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{background: "#1e293b"}}>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{color: "#64748b"}}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-red-900"
          style={{color: "#64748b"}}
        >
          <i className="ti ti-logout text-base" aria-hidden="true"></i>
          Keluar
        </button>
      </div>
    </aside>
  );
}