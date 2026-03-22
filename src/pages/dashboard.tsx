import { useEffect, useState } from "react";
import { obtenerResumenDashboard, obtenerNotificaciones, obtenerPagosPorMes } from "../services/dashboardService";
import { Users, GraduationCap, BookOpen, Plus, BanknoteArrowUp } from "lucide-react";
import { obtenerEventos } from "../services/eventService";
import ModalAddEvent from "../components/modals/ModalAddEvent";
import ModalVerEventos from "../components/modals/ModalVerEventos";
import '../styles/dashboard.css';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventosModalOpen, setIsEventosModalOpen] = useState(false);
  const [resumen, setResumen] = useState<any>({});
  const [pagosMes, setPagosMes] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);


  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const res = await obtenerResumenDashboard();
    const pagos = await obtenerPagosPorMes();
    const notif = await obtenerNotificaciones();
    const eventos = await obtenerEventos();

    setResumen(res);
    setPagosMes(pagos);
    setNotificaciones(notif);
    setEventos(eventos);
  }

  const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const bars = pagosMes.map((p) => ({
    label: meses[parseInt(p.mes) - 1],
    height: Math.min(p.total / 1000, 100),
    total: p.total
  }));

  const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });


  return (
    <>
      <div className="dash-header">
        <div>
          <p className="dash-title">Dashboard Overview</p>
          <p className="dash-subtitle">Bienvenido de vuelta!!</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Crear Evento
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Estudiantes</span>
            <div className="stat-icon"><Users size={20} /></div>
          </div>
          <p className="stat-value">{resumen.totalEstudiantes}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Ingresos Totales</span>
            <div className="stat-icon"><GraduationCap size={20} /></div>
          </div>
          <p className="stat-value">{formatoCOP.format(resumen.totalPagos)}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Estudiantes pendientes de pago</span>
            <div className="stat-icon"><BookOpen size={20} /></div>
          </div>
          <p className="stat-value">{resumen.pendientes}</p>
        </div>

      </div>

      <div className="main-grid">

        <div className="chart-card">
          <div className="chart-card-top">
            <div>
              <p className="chart-title">Resumen Mensual de Ingresos</p>
              <p className="chart-subtitle">Comparación entre meses</p>
            </div>
            <select className="chart-select">
              <option>Current Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="bar-chart">
            {bars.map((b) => (
              <div className="bar-col" key={b.label}>
                <div className="bar-wrapper">
                  <span className="bar-tooltip"> {formatoCOP.format(b.total)} </span>
                  <div className="bar-fill" style={{ height: `${b.height}%` }} />
                </div>
                <span className="bar-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="right-col">
          <div className="events-card">
            <div className="events-card-top">
              <span className="events-title">Proximos Eventos</span>
              <a className="events-link" onClick={(e) => { e.preventDefault(); setIsEventosModalOpen(true) }}>
                Ver Todos
              </a>
            </div>
            <div className="events-list">
              {eventos.length > 0 ? (
                eventos.slice(0, 4).map((e) => {

                  const hoy = new Date().toLocaleDateString("en-CA");

                  let estado = "proximo";

                  if (e.fecha === hoy) {
                    estado = "hoy";
                  } else if (e.fecha < hoy) {
                    estado = "pasado";
                  }

                  const [year, month, day] = e.fecha.split("-").map(Number);
                  const fecha = new Date(year, month - 1, day);

                  const mes = fecha.toLocaleString("es-CO", { month: "short" });

                  return (
                    <div className="event-item" key={e.id}>
                      <div className="event-date highlight">
                        <span className="event-month">{mes}</span>
                        <span className="event-day">{day}</span>
                      </div>

                      <div>
                        <p className="event-info-title">{e.nombre}</p>

                        <span className={`event-badge ${estado}`}>
                          {estado === "hoy" && "Hoy"}
                          {estado === "proximo" && "Próximo"}
                          {estado === "pasado" && "Finalizado"}
                        </span>

                        <p className="event-info-sub">
                          {e.hora ? `${e.hora} • ` : ""}
                          {e.lugar || "Sin ubicación"}
                        </p>
                      </div>
                    </div>
                  );
                })

              ) : (
                <p>No hay eventos próximos</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="notif-section-title">Notificaciones Recientes</p>
      <div className="notif-list">
        {notificaciones.length > 0 ? (
          notificaciones.slice(0, 4).map((n, i) => (
            <div className="notif-item" key={i}>
              <div className="notif-icon green"> <BanknoteArrowUp size={18} /> </div>
              <div>
                <p className="notif-text"> {n.nombre} pagó {formatoCOP.format(n.monto)} en {n.modulo} </p>
                <p className="notif-time"> {n.fecha} </p>
              </div>
            </div>
          ))
        ) : (
          <p>No hay actividad reciente</p>
        )}
      </div>

      {isModalOpen && <ModalAddEvent onClose={() => setIsModalOpen(false)} onGuardado={cargarDatos} />}
      {isEventosModalOpen && <ModalVerEventos onClose={() => setIsEventosModalOpen(false)} eventos={eventos} />}
    </>
  );
}