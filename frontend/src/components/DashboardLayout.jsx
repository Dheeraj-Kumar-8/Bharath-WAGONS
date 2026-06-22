import { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AdminChatBot from "./AdminChatBot";
import "../styles/global.css";

const SpiderWebBg = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const SMOKE_COUNT = 18;
    const smokes = Array.from({ length: SMOKE_COUNT }, () => ({
      x:    Math.random() * W,
      y:    H + Math.random() * 120,
      r:    60 + Math.random() * 100,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   -(0.15 + Math.random() * 0.25),
      alpha: 0.03 + Math.random() * 0.055,
    }));

    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  1.2 + Math.random() * 1.6,
    }));

    const MAX_DIST = 160;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      smokes.forEach(s => {
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        grad.addColorStop(0,   `rgba(120,140,180,${s.alpha})`);
        grad.addColorStop(0.5, `rgba(80, 100,140,${s.alpha * 0.5})`);
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        s.x  += s.vx;
        s.y  += s.vy;
        s.r  += 0.12;
        s.alpha -= 0.00018;
        if (s.y + s.r < 0 || s.alpha <= 0) {
          s.x     = Math.random() * W;
          s.y     = H + Math.random() * 60;
          s.r     = 60 + Math.random() * 100;
          s.alpha = 0.03 + Math.random() * 0.055;
          s.vx    = (Math.random() - 0.5) * 0.3;
          s.vy    = -(0.15 + Math.random() * 0.25);
        }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148,180,255,${(1 - dist / MAX_DIST) * 0.35})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,210,255,0.75)";
        ctx.shadowColor = "rgba(100,160,255,0.8)";
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.shadowBlur  = 0;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.72,
      }}
    />
  );
};

const DashboardLayout = ({ children, title, sub }) => (
  <div className="page-wrapper" style={{ flexDirection: "column" }}>
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <div className="content-area" style={{ position: "relative" }}>
          <SpiderWebBg />
          <div style={{ position: "relative", zIndex: 1 }}>
            {(title || sub) && (
              <div className="mb-20">
                {title && <div className="page-title">{title}</div>}
                {sub   && <div className="page-sub">{sub}</div>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      <AdminChatBot />
    </div>
  </div>
);

export default DashboardLayout;
