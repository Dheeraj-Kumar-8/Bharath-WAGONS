import { useEffect, useRef } from "react";
import OperatorSidebar from "./OperatorSidebar";
import OperatorNavbar from "./OperatorNavbar";
import SidebarChatBot from "./SidebarChatBot";
import { useAuth, ALL_PERMISSIONS } from "../context/AuthContext";
import "../styles/global.css";

const SpiderWebBg = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const smokes = Array.from({ length: 18 }, () => ({
      x: Math.random() * W, y: H + Math.random() * 120,
      r: 60 + Math.random() * 100, vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.15 + Math.random() * 0.25), alpha: 0.03 + Math.random() * 0.055,
    }));
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: 1.2 + Math.random() * 1.6,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      smokes.forEach(s => {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0,   `rgba(120,140,180,${s.alpha})`);
        g.addColorStop(0.5, `rgba(80,100,140,${s.alpha * 0.5})`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        s.x += s.vx; s.y += s.vy; s.r += 0.12; s.alpha -= 0.00018;
        if (s.y + s.r < 0 || s.alpha <= 0) {
          s.x = Math.random() * W; s.y = H + Math.random() * 60;
          s.r = 60 + Math.random() * 100; s.alpha = 0.03 + Math.random() * 0.055;
          s.vx = (Math.random() - 0.5) * 0.3; s.vy = -(0.15 + Math.random() * 0.25);
        }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 160) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148,180,255,${(1 - dist/160)*0.35})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,210,255,0.75)";
        ctx.shadowColor = "rgba(100,160,255,0.8)"; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", pointerEvents:"none", zIndex:0, opacity:0.72 }} />;
};

const AccessDenied = ({ moduleLabel }) => (
  <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
    <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:20, marginBottom:8 }}>Access Restricted</div>
    <div style={{ color:"#64748b", fontSize:14, marginBottom:24, maxWidth:400, lineHeight:1.6 }}>
      You do not have permission to access{" "}
      <strong style={{ color:"#60a5fa" }}>{moduleLabel}</strong>.
      {" "}Contact your Zone Admin to request access.
    </div>
    <span className="badge badge-critical" style={{ fontSize:12, padding:"6px 16px" }}>Permission Denied</span>
  </div>
);

const OperatorLayout = ({ children, title, sub, moduleKey }) => {
  const { hasPermission, operator, operators } = useAuth();
  const live = operators.find(o => o.id === operator?.id);
  const perm = ALL_PERMISSIONS.find(p => p.key === moduleKey);
  const denied = moduleKey && !hasPermission(moduleKey);
  const inactive = live && live.status !== "Active";

  return (
    <div className="page-wrapper" style={{ flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <OperatorSidebar />
        <div className="main-area">
          <OperatorNavbar />
          <div className="content-area" style={{ position: "relative" }}>
            <SpiderWebBg />
            <div style={{ position: "relative", zIndex: 1 }}>
              {inactive ? (
                <AccessDenied moduleLabel="Operator Portal" />
              ) : denied ? (
                <AccessDenied moduleLabel={perm?.label || moduleKey} />
              ) : (
                <>
                  {(title || sub) && (
                    <div className="mb-20">
                      {title && <div className="page-title">{title}</div>}
                      {sub   && <div className="page-sub">{sub}</div>}
                    </div>
                  )}
                  {children}
                </>
              )}
            </div>
          </div>
        </div>
        <SidebarChatBot />
      </div>
    </div>
  );
};

export default OperatorLayout;
