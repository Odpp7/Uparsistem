import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react"
import '../../styles/layout.css';

const navLinks = [
  { path: "/dashboard",   label: "Dashboard" },
  { path: "/estudiantes", label: "Estudiantes"  },
  { path: "/profesores",  label: "Profesores"  },
  { path: "/modulos",     label: "Modulos"   },
  { path: "/pagos",       label: "Pagos y cartera"     },
  { path: "/notas",       label: "Notas"     }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="layout-wrapper">

      <header className="navbar">
        <div className="navbar-left">

          <a href="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <GraduationCap className="navbar-logo-icon-svg" />
            </div>
            <span className="navbar-logo-text">Instituto Ebenezer</span>
          </a>

          <nav className="navbar-nav">
            {navLinks.map((item) => (
              <Link 
              key={item.path} to={item.path} 
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>


      <main className="layout-main">
        {children}
      </main>


      <footer className="layout-footer">
          <div className="footer-brand">
            <div className="footer-brand-icon">
              <GraduationCap size={15} />
            </div>
            <p className="footer-copy">Manejo de Plataforma Educacional</p>
          </div>
      </footer>

    </div>
  );
}