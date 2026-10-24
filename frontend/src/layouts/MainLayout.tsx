import { Link, Outlet } from "react-router";
import { navigation } from "../config/navigation";
import logoSirius from "../assets/images/logoSirius-white.svg";
import "../css/MainLayout.css";

export default function MainLayout() {
  return (
    <div>
      <nav className="ml-navbar">
        <Link to="/">
          <img src={logoSirius} className="ml-logo" />
        </Link>
        {navigation.map(({ path, name, label }) => (
          <Link key={name} to={path} className="ml-navitem">
            <div>{label}</div>
          </Link>
        ))}
      </nav>
      <main className="ml-main">
        <Outlet />
      </main>
    </div>
  );
}
