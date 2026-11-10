import { Link, Outlet } from "react-router";
import { navigation } from "../config/navigation";
import logoSirius from "../assets/images/logoSirius-white.svg";
import "../css/MainLayout.css";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { permissionLevel } from "../config/types";

export default function MainLayout() {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [menuOpened, setMenuOpened] = useState<boolean>(window.scrollY > 50);
  const [isScrolling, setIsScrolling] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolling(true);
        setMenuOpened(false);
      } else {
        setIsScrolling(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <nav className={isScrolling ? "ml-navbar scrolling" : "ml-navbar"}>
        <div className="ml-header">
          <Link to="/" className="ml-logo" onClick={() => setMenuOpened(false)}>
            <img src={logoSirius} />
          </Link>
          {isMobile && (
            <label className="ml-hamburger-menu">
              <input
                type="checkbox"
                checked={menuOpened}
                onChange={(e) => setMenuOpened(e.target.checked)}
              />
            </label>
          )}
        </div>
        <div className="ml-navitems">
          {navigation
            .filter(
              ({ module, requiredPermission }) =>
                !module ||
                (user?.permissions[module] ?? permissionLevel.none) >=
                  requiredPermission,
            )
            .map(({ path, name, label }) => (
              <Link
                key={name}
                to={path}
                className="ml-navitem"
                onClick={() => setMenuOpened(false)}
              >
                <div>{label}</div>
              </Link>
            ))}
        </div>
      </nav>
      <main className="ml-main">
        <Outlet />
      </main>
    </>
  );
}
