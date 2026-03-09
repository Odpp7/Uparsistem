import {
  Users, GraduationCap, BookOpen, TrendingUp, Minus,
  Plus, Info, UserPlus, AlertTriangle, CheckCircle,
  ArrowUp,
} from "lucide-react";
import '../styles/dashboard.css';

const bars = [
  { label: "Jan", height: 50,  style: ""          },
  { label: "Feb", height: 40,  style: ""          },
  { label: "Mar", height: 70,  style: "bar-active" },
  { label: "Apr", height: 85,  style: "bar-active" },
  { label: "May", height: 25,  style: ""          },
  { label: "Jun", height: 60,  style: "bar-mid"   },
];

const events = [
  { month: "Oct", day: "12", title: "Faculty Meeting",      sub: "09:00 AM • Auditorium A", highlight: true  },
  { month: "Oct", day: "15", title: "Mid-Term Exams Begin", sub: "08:00 AM • All Branches", highlight: false },
  { month: "Oct", day: "20", title: "Parent-Teacher Night", sub: "06:00 PM • Main Hall",    highlight: false },
];

const notifications = [
  { icon: <UserPlus size={20} />,      color: "blue",  text: '12 new students enrolled in "Advanced Physics"',            time: "2 hours ago"          },
  { icon: <AlertTriangle size={20} />, color: "amber", text: "Unusual login attempt detected from IP 192.168.1.4",        time: "5 hours ago"          },
  { icon: <CheckCircle size={20} />,   color: "green", text: "Monthly payroll reports for October are now ready",          time: "Yesterday at 4:30 PM" },
];

export default function Dashboard() {
  return (
    <>
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <p className="dash-title">Dashboard Overview</p>
          <p className="dash-subtitle">Welcome back, Principal Henderson. Here is what's happening today.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Create Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Students</span>
            <div className="stat-icon"><Users size={20} /></div>
          </div>
          <p className="stat-value">1,284</p>
          <div className="stat-trend">
            <span className="trend-up"><TrendingUp size={14} /> +12.5%</span>
            <span className="trend-note">vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Teachers</span>
            <div className="stat-icon"><GraduationCap size={20} /></div>
          </div>
          <p className="stat-value">86</p>
          <div className="stat-trend">
            <span className="trend-up"><TrendingUp size={14} /> +5%</span>
            <span className="trend-note">vs last term</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Current Courses</span>
            <div className="stat-icon"><BookOpen size={20} /></div>
          </div>
          <p className="stat-value">42</p>
          <div className="stat-trend">
            <span className="trend-flat"><Minus size={14} /> Stable</span>
            <span className="trend-note">New curriculum ready</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Chart + Events */}
      <div className="main-grid">

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-top">
            <div>
              <p className="chart-title">Monthly Enrollment</p>
              <p className="chart-subtitle">Comparison between Jan – Jun 2024</p>
            </div>
            <select className="chart-select">
              <option>Current Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="chart-total">
            <span className="chart-total-num">842</span>
            <span className="chart-total-pct"><ArrowUp size={14} /> 15%</span>
          </div>
          <div className="bar-chart">
            {bars.map((b) => (
              <div className="bar-col" key={b.label}>
                <div
                  className={`bar-fill ${b.style}`}
                  style={{ height: `${b.height}%` }}
                />
                <span className="bar-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="right-col">

          {/* Events */}
          <div className="events-card">
            <div className="events-card-top">
              <span className="events-title">Upcoming Events</span>
              <a href="#" className="events-link">View All</a>
            </div>
            <div className="events-list">
              {events.map((e) => (
                <div className="event-item" key={e.day}>
                  <div className={`event-date ${e.highlight ? "highlight" : ""}`}>
                    <span className="event-month">{e.month}</span>
                    <span className="event-day">{e.day}</span>
                  </div>
                  <div>
                    <p className="event-info-title">{e.title}</p>
                    <p className="event-info-sub">{e.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System notice */}
          <div className="notice-card">
            <div className="notice-title">
              <Info size={18} />
              System Update
            </div>
            <p className="notice-text">
              A scheduled maintenance is planned for Sunday, Oct 14th from 2:00 AM to 4:00 AM.
              Portal access will be limited.
            </p>
          </div>

        </div>
      </div>

      {/* Recent Notifications */}
      <p className="notif-section-title">Recent Notifications</p>
      <div className="notif-list">
        {notifications.map((n, i) => (
          <div className="notif-item" key={i}>
            <div className={`notif-icon ${n.color}`}>{n.icon}</div>
            <div>
              <p className="notif-text">{n.text}</p>
              <p className="notif-time">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}