import { FiCpu, FiTrendingUp, FiAlertTriangle, FiTool, FiNavigation } from "react-icons/fi";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const radarData = [
  { metric:"On-Time",        A:92 },
  { metric:"GPS Coverage",   A:89 },
  { metric:"Cargo Safety",   A:95 },
  { metric:"Fuel Efficiency",A:88 },
  { metric:"Maintenance",    A:76 },
  { metric:"Route Opt.",     A:91 },
];

const INSIGHTS = [
  {
    label:"Delay Prediction", value:78, color:"#f59e0b",
    icon: FiAlertTriangle,
    detail:"23 wagons predicted to be delayed tomorrow",
    items:["WGN-002 — Chennai → Hyd (High traffic)", "WGN-006 — Ahmedabad → Delhi (Weather)", "WGN-010 — Patna → Delhi (Track issue)"],
  },
  {
    label:"Maintenance Forecast", value:65, color:"#ef4444",
    icon: FiTool,
    detail:"18 wagons require service within 7 days",
    items:["WGN-004 — Wheel bearing inspection due", "WGN-008 — Brake pad replacement", "WGN-014 — Engine overhaul required"],
  },
  {
    label:"Fuel Efficiency", value:88, color:"#22c55e",
    icon: FiTrendingUp,
    detail:"Avg efficiency up 4.2% — AI route optimisation active",
    items:["Save ~420L/day via optimised routing", "6 routes rescheduled for off-peak hours", "Dynamic speed regulation saving 8.4% fuel"],
  },
  {
    label:"Route Optimisation", value:92, color:"#3b82f6",
    icon: FiNavigation,
    detail:"12 routes optimised by AI engine this week",
    items:["Delhi–Mumbai rerouted via Kota (18 min faster)", "Chennai–Hyd via Secunderabad corridor opened", "Night corridor utilisation up 34%"],
  },
];

const AT_RISK = [
  { wagon:"WGN-002", route:"Chennai → Hyderabad",  risk:"High",   reason:"Signal congestion + weather delay", eta:"3h 18m", confidence:"87%" },
  { wagon:"WGN-006", route:"Ahmedabad → Delhi",    risk:"Medium", reason:"Low-pressure weather system",       eta:"9h 15m", confidence:"74%" },
  { wagon:"WGN-010", route:"Patna → Delhi",        risk:"Medium", reason:"Track maintenance window conflict", eta:"8h 40m", confidence:"69%" },
  { wagon:"WGN-004", route:"Pune → Mumbai CST",    risk:"High",   reason:"Mechanical issue — wheel bearing",  eta:"Halted", confidence:"94%" },
  { wagon:"WGN-008", route:"Jaipur → Mumbai",      risk:"High",   reason:"Scheduled maintenance overdue",     eta:"Halted", confidence:"91%" },
];

const riskClass = r => ({ High:"badge-high", Medium:"badge-medium", Low:"badge-low", Critical:"badge-critical" }[r]||"badge-info");

const PredictiveInsights = () => (
  <DashboardLayout title="Predictive Insights" sub="AI-powered forecasts, risk analysis, and network optimisation">
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
      <StatCard title="AI Accuracy"      value="94.2%"  color="#3b82f6"  icon={FiCpu}          trend="+1.8%"  trendUp />
      <StatCard title="Predicted Delays" value="23"     color="#f59e0b"  icon={FiAlertTriangle} trend="-12%"   trendUp />
      <StatCard title="Maintenance Alerts" value="18"   color="#ef4444"  icon={FiTool}          trend="+2"     trendUp={false} />
      <StatCard title="Routes Optimised" value="12"     color="#22c55e"  icon={FiNavigation}    trend="+5"     trendUp />
    </div>

    {/* Forecast Cards */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"20px", marginBottom:"20px" }}>
      {INSIGHTS.map(ins => (
        <div key={ins.label} className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
            <div>
              <div style={{ color:"#94a3b8", fontSize:"12px", marginBottom:"4px" }}>{ins.label}</div>
              <div style={{ color: ins.color, fontSize:"30px", fontWeight:800 }}>{ins.value}%</div>
            </div>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`${ins.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ins.icon color={ins.color} size={18} />
            </div>
          </div>
          <div className="progress-bg" style={{ marginBottom:"12px" }}>
            <div className="progress-fill" style={{ width:`${ins.value}%`, background: ins.color }} />
          </div>
          <div style={{ color:"#64748b", fontSize:"12px", marginBottom:"12px" }}>{ins.detail}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {ins.items.map((it, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                <span style={{ color: ins.color, marginTop:"2px", flexShrink:0 }}>›</span>
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{it}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Radar + At-Risk Table */}
    <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:"20px" }}>
      <div className="card">
        <div className="section-title">Network Health Radar</div>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1a3356" />
            <PolarAngleAxis dataKey="metric" tick={{ fill:"#64748b", fontSize:11 }} />
            <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
            <Tooltip contentStyle={{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="section-title">At-Risk Wagons</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon</th><th>Route</th><th>Risk Level</th><th>Reason</th><th>ETA</th><th>AI Confidence</th></tr>
            </thead>
            <tbody>
              {AT_RISK.map(r => (
                <tr key={r.wagon}>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{r.wagon}</td>
                  <td>{r.route}</td>
                  <td><span className={`badge ${riskClass(r.risk)}`}>{r.risk}</span></td>
                  <td style={{ color:"#94a3b8", fontSize:"12px" }}>{r.reason}</td>
                  <td style={{ color: r.eta === "Halted" ? "#ef4444" : "#f59e0b", fontWeight:600 }}>{r.eta}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div className="progress-bg" style={{ flex:1 }}>
                        <div className="progress-fill" style={{ width:r.confidence, background:"#3b82f6" }} />
                      </div>
                      <span style={{ color:"#3b82f6", fontSize:"11px", fontWeight:700, width:"32px" }}>{r.confidence}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default PredictiveInsights;
