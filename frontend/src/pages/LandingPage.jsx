import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

/* ── Intersection observer hook ─────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold });
    o.observe(el); return () => o.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ── Animated scroll section ────────────────────────────────────── */
function Fade({ children, delay = 0, dir = "up", style = {}, anim }) {
  const [ref, vis] = useInView();
  const defaultFrom = dir === "left" ? "translateX(-30px)" : dir === "right" ? "translateX(30px)" : "translateY(28px)";
  if (anim) {
    return (
      <div ref={ref} style={{
        opacity: vis ? 1 : 0,
        animation: vis ? `${anim} both` : "none",
        transition: `opacity .5s ${delay}s ease`,
        ...style,
      }}>{children}</div>
    );
  }
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : defaultFrom, transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s ease`, ...style }}>
      {children}
    </div>
  );
}

/* ── Scroll-triggered counter ───────────────────────────────────── */
function Count({ to, dur = 1600, decimals = 0, prefix = "", suffix = "" }) {
  const [v, setV] = useState(0);
  const [ref, vis] = useInView(.3);
  useEffect(() => {
    if (!vis) return;
    let s = null;
    const run = ts => { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); setV(+(p * to).toFixed(decimals)); if (p < 1) requestAnimationFrame(run); else setV(to); };
    requestAnimationFrame(run);
  }, [vis, to, dur, decimals]);
  return <span ref={ref}>{prefix}{typeof v === "number" && decimals === 0 ? v.toLocaleString() : v}{suffix}</span>;
}

/* ── Floating particle canvas ───────────────────────────────────── */
function Particles({ n = 50, col = "59,130,246" }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const cx = cv.getContext("2d"); let id;
    const sz = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    sz(); const ro = new ResizeObserver(sz); ro.observe(cv);
    const pts = Array.from({ length: n }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.3 + .3, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, a: Math.random() * .35 + .07 }));
    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach((d, i) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = cv.width; if (d.x > cv.width) d.x = 0;
        if (d.y < 0) d.y = cv.height; if (d.y > cv.height) d.y = 0;
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.28); cx.fillStyle = `rgba(${col},${d.a})`; cx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dist = Math.hypot(d.x - b.x, d.y - b.y);
          if (dist < 100) { cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(b.x, b.y); cx.strokeStyle = `rgba(${col},${.07 * (1 - dist / 100)})`; cx.lineWidth = .5; cx.stroke(); }
        }
      });
      id = requestAnimationFrame(draw);
    };
    draw(); return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, [n, col]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ── Typing headline ────────────────────────────────────────────── */
function TypeWriter({ words, speed = 80, pause = 2200 }) {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wi];
    const delay = deleting ? 40 : speed;
    const t = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, ci + 1));
        if (ci + 1 === word.length) setTimeout(() => setDeleting(true), pause);
        else setCi(c => c + 1);
      } else {
        setDisplay(word.slice(0, ci - 1));
        if (ci - 1 === 0) { setDeleting(false); setWi(w => (w + 1) % words.length); setCi(0); }
        else setCi(c => c - 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [ci, deleting, wi, words, speed, pause]);
  return (
    <span>
      <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{display}</span>
      <span style={{ borderRight: "3px solid #60a5fa", animation: "lp-blink .7s step-end infinite", marginLeft: 2 }} />
    </span>
  );
}

/* ── Platform section with scroll-triggered video background ──────── */
function PlatformVideoSection({ FM, FI }) {
  const sectionRef = useRef(null);
  const videoRef   = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* play / pause video with section visibility */
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="platform"
      style={{ position: "relative", overflow: "hidden", padding: "100px clamp(20px,6vw,76px)" }}
    >
      {/* ── moving video bg ── */}
      <video
        ref={videoRef}
        loop muted playsInline
        poster="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=40"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover",
          filter: "brightness(.22) saturate(.5) hue-rotate(190deg)",
          zIndex: 0,
          opacity: inView ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      >
        <source src="https://videos.pexels.com/video-files/4873765/4873765-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>

      {/* gradient overlay — dark edges, transparent centre */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(180deg,rgba(2,11,24,.92) 0%,rgba(2,11,24,.55) 18%,rgba(2,11,24,.55) 82%,rgba(2,11,24,.96) 100%)",
      }} />

      {/* subtle grid on top of video */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px)",
        backgroundSize: "55px 55px",
      }} />

      {/* scan-line sweep */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(59,130,246,.14),transparent)",
          animation: inView ? "lp-scan 8s linear infinite" : "none",
        }} />
      </div>

      {/* ── content (heading + stat cards) ── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="gtag" style={{ marginBottom: 14 }}>PLATFORM</span>
            <h2 style={{ fontFamily: FM, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginTop: 14 }}>
              Built for <span className="gtext">Scale &amp; Reliability</span>
            </h2>
            <p style={{ color: "#3a5a7c", fontSize: 15, marginTop: 12, maxWidth: 480, margin: "12px auto 0", lineHeight: 1.7 }}>
              Every number below is live — powered by the same engine running Indian Railways operations.
            </p>
          </div>
        </Fade>

        <div className="stats-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {[
            { v: 2400, suf: "+", label: "Wagons Tracked",  c: "#3b82f6", ic: "🚆" },
            { v: 8,    suf: "",  label: "Railway Zones",   c: "#a855f7", ic: "🗺" },
            { v: 99.9, suf: "%", label: "Uptime SLA",      c: "#22c55e", ic: "⚡", dec: 1 },
            { v: 2,    suf: "s", label: "Alert Response",  c: "#f59e0b", ic: "🔔", pre: "< " },
          ].map(({ v, suf, label, c, ic, dec = 0, pre = "" }) => (
            <Fade key={label}>
              <div
                style={{
                  background: "rgba(4,12,28,.75)",
                  border: `1px solid ${c}28`,
                  borderRadius: 20,
                  padding: "32px 22px",
                  textAlign: "center",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  boxShadow: `0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)`,
                  transition: "transform .3s cubic-bezier(.34,1.2,.64,1), box-shadow .3s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,.55), 0 0 36px ${c}22`;
                  e.currentTarget.style.borderColor = `${c}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)`;
                  e.currentTarget.style.borderColor = `${c}28`;
                }}
              >
                {/* top shimmer */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: `linear-gradient(90deg,transparent,${c}60,transparent)` }} />
                {/* bg glow */}
                <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${c}14,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ fontSize: 30, marginBottom: 12, position: "relative" }}>{ic}</div>
                <div style={{ color: c, fontSize: 36, fontWeight: 900, fontFamily: FM, lineHeight: 1, position: "relative" }}>
                  {pre}<Count to={v} decimals={dec} />{suf}
                </div>
                <div style={{ color: "#3a5a7c", fontSize: 12, marginTop: 8, fontWeight: 600, letterSpacing: ".4px", textTransform: "uppercase" }}>{label}</div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   HERO TRAIN ANIMATION
════════════════════════════════════════════════════════════════ */
function HeroTrainAnimation() {
  return (
    <div style={{ position: "relative", width: 380, height: 260 }}>
      <style>{`
        @keyframes ht-wheel   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ht-shake   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
        @keyframes ht-smoke1  { 0%{transform:translate(0,0) scale(.5);opacity:.85} 100%{transform:translate(-20px,-70px) scale(2.2);opacity:0} }
        @keyframes ht-smoke2  { 0%{transform:translate(0,0) scale(.4);opacity:.7}  100%{transform:translate(-6px,-88px)  scale(2.6);opacity:0} }
        @keyframes ht-smoke3  { 0%{transform:translate(0,0) scale(.35);opacity:.6} 100%{transform:translate(14px,-78px)  scale(2.4);opacity:0} }
        @keyframes ht-smoke4  { 0%{transform:translate(0,0) scale(.3);opacity:.5}  100%{transform:translate(-28px,-60px) scale(2.0);opacity:0} }
        @keyframes ht-track   { from{background-position:0 0} to{background-position:-56px 0} }
        @keyframes ht-steam   { 0%{opacity:.6;transform:scaleX(1)}  100%{opacity:0;transform:scaleX(2.5) translateX(30px)} }
        @keyframes ht-glow    { 0%,100%{opacity:.6} 50%{opacity:1} }
        .ht-w1{animation:ht-wheel .5s linear infinite; transform-box:fill-box; transform-origin:center;}
        .ht-w2{animation:ht-wheel .5s linear infinite; transform-box:fill-box; transform-origin:center;}
        .ht-w3{animation:ht-wheel .5s linear infinite; transform-box:fill-box; transform-origin:center;}
        .ht-w4{animation:ht-wheel .5s linear infinite; transform-box:fill-box; transform-origin:center;}
        .ht-body{animation:ht-shake .3s ease-in-out infinite;}
        .ht-s1{animation:ht-smoke1 2.4s ease-out infinite;}
        .ht-s2{animation:ht-smoke2 2.4s ease-out .6s infinite;}
        .ht-s3{animation:ht-smoke3 2.4s ease-out 1.2s infinite;}
        .ht-s4{animation:ht-smoke4 2.4s ease-out 1.8s infinite;}
        .ht-steam{animation:ht-steam 1.6s ease-out infinite;}
        .ht-glow{animation:ht-glow 1.8s ease-in-out infinite;}
      `}</style>

      {/* Glow under train */}
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", width:320, height:18, background:"radial-gradient(ellipse,rgba(59,130,246,.35),transparent 70%)", borderRadius:"50%", filter:"blur(6px)" }} />

      {/* Track */}
      <div style={{ position:"absolute", bottom:24, left:0, right:0, height:10, borderRadius:5, background:"rgba(30,58,100,.4)" }}>
        {/* Ties */}
        <div style={{ position:"absolute", inset:0, borderRadius:5, backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 42px,rgba(59,130,246,.35) 42px,rgba(59,130,246,.35) 50px)", animation:"ht-track .5s linear infinite" }}/>
        {/* Rails */}
        <div style={{ position:"absolute", top:1, left:0, right:0, height:3, background:"rgba(96,165,250,.5)", borderRadius:2 }}/>
        <div style={{ position:"absolute", bottom:1, left:0, right:0, height:3, background:"rgba(96,165,250,.5)", borderRadius:2 }}/>
      </div>

      {/* Speed lines */}
      {[40,65,88,108].map((top, i) => (
        <div key={i} style={{ position:"absolute", left:0, top, height:1.5, width:30+i*8, background:`linear-gradient(90deg,transparent,rgba(59,130,246,${0.12+i*0.04}))`, borderRadius:2, animation:`ht-steam ${1.2+i*0.2}s ease-out ${i*0.15}s infinite` }}/>
      ))}

      {/* Train SVG */}
      <svg className="ht-body" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 280 120" width="370" height="120"
        style={{ position:"absolute", bottom:22, left:-10 }}
      >
        {/* ── Smoke puffs ── */}
        <circle className="ht-s1" cx="52" cy="18" r="9"  fill="rgba(148,163,184,.75)"/>
        <circle className="ht-s2" cx="58" cy="14" r="8"  fill="rgba(148,163,184,.65)"/>
        <circle className="ht-s3" cx="46" cy="20" r="7"  fill="rgba(148,163,184,.55)"/>
        <circle className="ht-s4" cx="54" cy="10" r="6"  fill="rgba(100,116,139,.6)"/>

        {/* ── Chimney ── */}
        <rect x="44" y="20" width="16" height="18" rx="2" fill="#1e3a5f"/>
        <rect x="40" y="17" width="24" height="6"  rx="3" fill="#1d4ed8"/>

        {/* ── Boiler ── */}
        <rect x="22" y="36" width="130" height="44" rx="14" fill="#172a45"/>
        {/* Boiler highlight stripe */}
        <rect x="25" y="38" width="124" height="10" rx="7" fill="rgba(59,130,246,.15)"/>
        {/* Band rings */}
        <rect x="72"  y="36" width="4" height="44" rx="2" fill="rgba(59,130,246,.22)"/>
        <rect x="100" y="36" width="4" height="44" rx="2" fill="rgba(59,130,246,.22)"/>
        <rect x="128" y="36" width="4" height="44" rx="2" fill="rgba(59,130,246,.22)"/>

        {/* ── Cab ── */}
        <rect x="150" y="22" width="72" height="58" rx="7" fill="#112036"/>
        {/* Cab roof */}
        <rect x="146" y="16" width="80" height="10" rx="5" fill="#1d4ed8"/>
        {/* Cab windows */}
        <rect x="158" y="29" width="24" height="17" rx="4" fill="rgba(96,165,250,.22)" stroke="rgba(59,130,246,.55)" strokeWidth="1.2"/>
        <rect x="190" y="29" width="20" height="17" rx="4" fill="rgba(96,165,250,.18)" stroke="rgba(59,130,246,.45)" strokeWidth="1.2"/>
        {/* Cab door */}
        <rect x="164" y="56" width="28" height="24" rx="3" fill="rgba(59,130,246,.1)" stroke="rgba(59,130,246,.25)" strokeWidth="1"/>

        {/* ── Tender (coal car) ── */}
        <rect x="220" y="46" width="55" height="34" rx="6" fill="#0f1e33"/>
        <rect x="222" y="48" width="51" height="8"  rx="3" fill="rgba(30,58,100,.6)"/>
        {/* Coal lumps */}
        <ellipse cx="234" cy="50" rx="7"  ry="4" fill="rgba(30,41,59,.9)"/>
        <ellipse cx="247" cy="49" rx="6"  ry="3.5" fill="rgba(30,41,59,.8)"/>
        <ellipse cx="259" cy="51" rx="5.5" ry="3" fill="rgba(30,41,59,.85)"/>

        {/* ── Cow-catcher ── */}
        <polygon points="22,80 4,88 22,88" fill="#1d4ed8"/>

        {/* ── Running board ── */}
        <rect x="4" y="78" width="218" height="8" rx="4" fill="#1a3050"/>

        {/* ── Headlight ── */}
        <circle className="ht-glow" cx="10" cy="58" r="8" fill="rgba(251,191,36,.2)" stroke="rgba(251,191,36,.7)" strokeWidth="1.8"/>
        <circle cx="10" cy="58" r="4" fill="rgba(251,191,36,.8)"/>
        {/* Headlight beam */}
        <polygon points="2,54 2,62 -18,60 -18,56" fill="rgba(251,191,36,.07)"/>

        {/* Steam pipe */}
        <rect x="100" y="30" width="6" height="10" rx="2" fill="#1e3a5f"/>
        <rect x="97"  y="28" width="12" height="4" rx="2" fill="#1d4ed8"/>

        {/* ── WHEELS ── */}
        {/* Big drive wheel L */}
        <g className="ht-w1">
          <circle cx="62"  cy="90" r="20" fill="none" stroke="#3b82f6" strokeWidth="3.5"/>
          <circle cx="62"  cy="90" r="11" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle cx="62"  cy="90" r="4"  fill="#60a5fa"/>
          <line x1="62" y1="70" x2="62" y2="110" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="42" y1="90" x2="82" y2="90"  stroke="#3b82f6" strokeWidth="2"/>
          <line x1="48" y1="76" x2="76" y2="104" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="76" y1="76" x2="48" y2="104" stroke="#3b82f6" strokeWidth="1.5"/>
        </g>
        {/* Big drive wheel R */}
        <g className="ht-w2">
          <circle cx="112" cy="90" r="20" fill="none" stroke="#3b82f6" strokeWidth="3.5"/>
          <circle cx="112" cy="90" r="11" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle cx="112" cy="90" r="4"  fill="#60a5fa"/>
          <line x1="112" y1="70" x2="112" y2="110" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="92"  y1="90" x2="132" y2="90"  stroke="#3b82f6" strokeWidth="2"/>
          <line x1="98"  y1="76" x2="126" y2="104" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="126" y1="76" x2="98"  y2="104" stroke="#3b82f6" strokeWidth="1.5"/>
        </g>
        {/* Connecting rod */}
        <rect x="62" y="87" width="50" height="6" rx="3" fill="rgba(59,130,246,.55)"/>
        {/* Piston rod */}
        <rect x="20" y="87" width="44" height="4" rx="2" fill="rgba(59,130,246,.4)"/>

        {/* Small front wheel */}
        <g className="ht-w3">
          <circle cx="28" cy="94" r="11" fill="none" stroke="#3b82f6" strokeWidth="2.5"/>
          <circle cx="28" cy="94" r="3"  fill="#60a5fa"/>
          <line x1="28" y1="83" x2="28" y2="105" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="17" y1="94" x2="39" y2="94"  stroke="#3b82f6" strokeWidth="1.5"/>
        </g>
        {/* Cab wheel */}
        <g className="ht-w4">
          <circle cx="178" cy="94" r="11" fill="none" stroke="#3b82f6" strokeWidth="2.5"/>
          <circle cx="178" cy="94" r="3"  fill="#60a5fa"/>
          <line x1="178" y1="83" x2="178" y2="105" stroke="#3b82f6" strokeWidth="1.5"/>
          <line x1="167" y1="94" x2="189" y2="94"  stroke="#3b82f6" strokeWidth="1.5"/>
        </g>
        {/* Tender wheels */}
        <g className="ht-w1">
          <circle cx="234" cy="94" r="10" fill="none" stroke="rgba(59,130,246,.6)" strokeWidth="2"/>
          <circle cx="234" cy="94" r="3"  fill="rgba(96,165,250,.7)"/>
          <line x1="234" y1="84" x2="234" y2="104" stroke="rgba(59,130,246,.6)" strokeWidth="1.5"/>
          <line x1="224" y1="94" x2="244" y2="94"  stroke="rgba(59,130,246,.6)" strokeWidth="1.5"/>
        </g>
        <g className="ht-w2">
          <circle cx="262" cy="94" r="10" fill="none" stroke="rgba(59,130,246,.6)" strokeWidth="2"/>
          <circle cx="262" cy="94" r="3"  fill="rgba(96,165,250,.7)"/>
          <line x1="262" y1="84" x2="262" y2="104" stroke="rgba(59,130,246,.6)" strokeWidth="1.5"/>
          <line x1="252" y1="94" x2="272" y2="94"  stroke="rgba(59,130,246,.6)" strokeWidth="1.5"/>
        </g>
      </svg>

      {/* Label */}
      <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", color:"rgba(59,130,246,.45)", fontSize:10, fontWeight:700, letterSpacing:2, whiteSpace:"nowrap" }}>BHARATH WAGONS · LIVE</div>
    </div>
  );
}

/* ── Honeycomb Web Canvas for Roles Section ─────────────────────── */
function RolesSmokeCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;

    const sz = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    sz();
    const ro = new ResizeObserver(sz);
    ro.observe(canvas);

    // hexagon helper — draws one hex centered at (cx, cy) with given size
    const hex = (cx, cy, size) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const SIZE  = 36;           // hex cell radius
      const COLS  = Math.ceil(canvas.width  / (SIZE * 1.75)) + 2;
      const ROWS  = Math.ceil(canvas.height / (SIZE * 1.52)) + 2;

      for (let row = -1; row < ROWS; row++) {
        for (let col = -1; col < COLS; col++) {
          const cx = col * SIZE * 1.732 + (row % 2 === 0 ? 0 : SIZE * 0.866);
          const cy = row * SIZE * 1.5;

          // wave pulse — each cell breathes at a slightly different phase
          const phase  = (col * 0.4 + row * 0.6 + t) % (Math.PI * 2);
          const pulse  = 0.5 + 0.5 * Math.sin(phase);          // 0 → 1
          const alpha  = 0.06 + pulse * 0.13;                   // 0.06 → 0.19
          const stroke = 0.4 + pulse * 0.6;                     // stroke width

          // ash / light grey palette — slightly warm
          const g = Math.round(180 + pulse * 40);               // 180 → 220
          const strokeColor = `rgba(${g},${g},${g - 10},${alpha})`;
          const fillColor   = `rgba(${g},${g},${g - 10},${alpha * 0.18})`;

          hex(cx, cy, SIZE - 2);
          ctx.fillStyle   = fillColor;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth   = stroke;
          ctx.stroke();

          // bright centre dot on peak cells
          if (pulse > 0.85) {
            ctx.beginPath();
            ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220,220,215,${(pulse - 0.85) * 1.8})`;
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => { setTimeout(() => setReady(true), 80); }, []);
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const h = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, []);

  const FM = "'Manrope','Inter',system-ui,sans-serif";
  const FI = "'Inter',system-ui,sans-serif";

  const [activeNav, setActiveNav] = useState("");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* highlight active nav link on scroll */
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const sections = ["platform", "features", "analytics", "security"];
    const h = () => {
      const offset = el.scrollTop + 120;
      let current = "";
      sections.forEach(id => {
        const s = document.getElementById(id);
        if (s && s.offsetTop <= offset) current = id;
      });
      setActiveNav(current);
    };
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        @keyframes lp-float     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-12px)} }
        @keyframes lp-pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes lp-blink     { 50%{border-color:transparent} }
        @keyframes lp-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes lp-marquee   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes lp-slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-glow      { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.35)} 50%{box-shadow:0 0 48px rgba(59,130,246,.75)} }
        @keyframes lp-spin      { to{transform:rotate(360deg)} }
        @keyframes lp-rotBorder { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }

        /* Platform — zoom up spring */
        @keyframes plat-zoomUp { 0%{opacity:0;transform:translateY(52px) scale(.88)} 65%{transform:translateY(-5px) scale(1.03)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes plat-headIn { from{opacity:0;transform:translateX(-44px)} to{opacity:1;transform:translateX(0)} }
        /* Features — alternate slide */
        @keyframes feat-slideL { from{opacity:0;transform:translateX(-52px) rotate(-1.5deg)} to{opacity:1;transform:none} }
        @keyframes feat-slideR { from{opacity:0;transform:translateX(52px) rotate(1.5deg)} to{opacity:1;transform:none} }
        @keyframes feat-iconSpin { from{opacity:0;transform:scale(.3) rotate(-120deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        /* Roles — perspective flip */
        @keyframes role-flipIn { from{opacity:0;transform:perspective(700px) rotateY(-28deg) translateY(20px)} to{opacity:1;transform:perspective(700px) rotateY(0) translateY(0)} }
        /* Analytics — fan up */
        @keyframes ai-fanUp { 0%{opacity:0;transform:scale(.78) translateY(40px)} 65%{transform:scale(1.04) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        /* Security — spotlight drop */
        @keyframes sec-drop { from{opacity:0;transform:translateY(-32px) scaleY(.9)} 70%{transform:translateY(6px) scaleY(1.01)} to{opacity:1;transform:none} }
        @keyframes sec-badgePop { 0%{opacity:0;transform:scale(.5) translateY(8px)} 70%{transform:scale(1.14)} 100%{opacity:1;transform:scale(1)} }

        .lp-wrap { overflow-y:auto; height:100vh; scroll-behavior:smooth; background:#020b18; color:#fff; font-family:${FI}; }
        .lp-wrap::-webkit-scrollbar{width:3px} .lp-wrap::-webkit-scrollbar-thumb{background:#1d4ed8;border-radius:3px}

        .btn-p {
          display:inline-flex; align-items:center; justify-content:center; gap:9px;
          padding:13px 30px; border:none; border-radius:13px; cursor:pointer;
          font-size:14px; font-weight:700; color:#fff; font-family:${FI};
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
          box-shadow:0 5px 22px rgba(37,99,235,.4);
          transition:transform .2s cubic-bezier(.34,1.4,.64,1), box-shadow .2s;
        }
        .btn-p:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(37,99,235,.6); }
        .btn-p:active{ transform:translateY(0) scale(.97); }

        .btn-g {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 26px; border:1px solid rgba(59,130,246,.3); border-radius:13px;
          cursor:pointer; font-size:14px; font-weight:600; color:#60a5fa;
          background:rgba(59,130,246,.07); font-family:${FI};
          transition:all .2s ease;
        }
        .btn-g:hover { background:rgba(59,130,246,.15); border-color:#3b82f6; transform:translateY(-2px); }

        .role-card {
          border-radius:22px; padding:30px; position:relative; overflow:hidden; height:100%;
          transition:transform .3s cubic-bezier(.34,1.2,.64,1), box-shadow .3s, border-color .3s;
        }
        .role-card:hover { transform:translateY(-10px) scale(1.015); }

        .feat-card {
          border-radius:18px; padding:26px;
          background:rgba(8,16,32,.85); border:1px solid rgba(30,58,100,.6);
          transition:transform .3s cubic-bezier(.34,1.2,.64,1), border-color .3s, box-shadow .3s;
          display:flex; gap:18px;
        }
        .feat-card:hover { transform:translateY(-6px); border-color:rgba(59,130,246,.35); box-shadow:0 20px 60px rgba(0,0,0,.4); }

        .ai-card {
          border-radius:18px; padding:24px; height:100%; position:relative; overflow:hidden;
          background:rgba(6,13,28,.9); border:1px solid rgba(30,58,100,.55);
          transition:transform .3s cubic-bezier(.34,1.2,.64,1), border-color .3s;
        }
        .ai-card:hover { transform:translateY(-8px); }

        .gtag { display:inline-flex; align-items:center; gap:6px; padding:4px 13px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.4px; background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.22); color:#60a5fa; }
        .gdiv { width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(59,130,246,.2),transparent); }
        .gtext { background:linear-gradient(135deg,#60a5fa,#a78bfa,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .mq-wrap { overflow:hidden; width:100%; }
        .mq-inner { display:flex; gap:32px; width:max-content; animation:lp-marquee 30s linear infinite; }

        @media(max-width:900px){
          .hero-row { flex-direction:column !important; }
          .roles-g   { grid-template-columns:1fr !important; }
          .stats-g   { grid-template-columns:repeat(2,1fr) !important; }
          .ops-g     { grid-template-columns:1fr !important; }
          .ai-g      { grid-template-columns:1fr 1fr !important; }
          .hide-m    { display:none !important; }
        }
        @media(max-width:600px){
          .ai-g { grid-template-columns:1fr !important; }
          .stats-g { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      <div ref={scrollRef} className="lp-wrap">

        {/* ── NAVBAR ───────────────────────────────────────── */}
        <nav style={{ position: "sticky", top: 0, zIndex: 200, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,5vw,60px)", background: scrollY > 30 ? "rgba(2,8,22,.93)" : "transparent", backdropFilter: scrollY > 30 ? "blur(22px)" : "none", borderBottom: scrollY > 30 ? "1px solid rgba(30,58,100,.5)" : "1px solid transparent", transition: "all .3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 0 14px rgba(59,130,246,.4)", animation: "lp-glow 3s ease infinite" }}>🚆</div>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, fontFamily: FM, lineHeight: 1.2 }}>Bharath WAGONS</div>
              <div style={{ color: "#3b82f6", fontSize: 9, fontWeight: 700, letterSpacing: "1.8px" }}>OPERATIONS PLATFORM</div>
            </div>
          </div>
          <div className="hide-m" style={{ display: "flex", gap: 26 }}>
            {[["Platform","platform"],["Features","features"],["Analytics","analytics"],["Security","security"]].map(([l, id]) => {
              const isActive = activeNav === id;
              return (
                <span key={l}
                  onClick={() => scrollTo(id)}
                  style={{ color: isActive ? "#60a5fa" : "#4a6fa5", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "color .2s, font-weight .2s", position: "relative", paddingBottom: 2 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#60a5fa"}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#4a6fa5"; }}
                >
                  {l}
                  {isActive && <span style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius: 2 }} />}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-g" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign In</button>
            <button className="btn-p" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/create-account")}>Get Access</button>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════
            HERO — full screen video
        ═══════════════════════════════════════════════════ */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

          {/* VIDEO */}
          <video autoPlay loop muted playsInline
            poster="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=55"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.35) saturate(.65)", zIndex: 0 }}>
            <source src="https://videos.pexels.com/video-files/4873765/4873765-hd_1920_1080_25fps.mp4" type="video/mp4" />
            <source src="https://www.pexels.com/download/video/3121459/?fps=25.0&h=1080&w=1920" type="video/mp4" />
          </video>

          {/* overlays */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(135deg,rgba(2,8,20,.92) 0%,rgba(4,14,40,.5) 55%,rgba(2,8,20,.9) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(0deg,rgba(2,11,24,1) 0%,transparent 30%,transparent 72%,rgba(2,11,24,.5) 100%)" }} />
          {/* grid */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.025) 1px,transparent 1px)", backgroundSize: "55px 55px" }} />
          {/* scan line */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,.1),transparent)", animation: "lp-scan 9s linear infinite" }} />
          </div>
          {/* particles */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2 }}><Particles n={55} /></div>

          {/* content */}
          <div className="hero-row" style={{ position: "relative", zIndex: 10, width: "100%", padding: "90px clamp(20px,6vw,76px) 110px", display: "flex", alignItems: "center", gap: 56 }}>

            {/* LEFT */}
            <div style={{ flex: 1, maxWidth: 580 }}>
              <div style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateX(-24px)", transition: "all .6s ease", marginBottom: 18 }}>
                <span className="gtag">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "lp-pulse 1.5s infinite", flexShrink: 0 }} />
                  LIVE SYSTEM · Ministry of Railways, Govt. of India
                </span>
              </div>

              <h1 style={{ fontFamily: FM, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-1.5px", fontSize: "clamp(36px,5vw,68px)", marginBottom: 8, opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(28px)", transition: "all .7s .1s ease" }}>
                Railway Command Center
              </h1>
              <h1 style={{ fontFamily: FM, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-1.5px", fontSize: "clamp(36px,5vw,68px)", marginBottom: 22, opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(28px)", transition: "all .7s .2s ease" }}>
                <TypeWriter words={["Wagon Monitoring", "Live Operations", "AI Intelligence", "Fleet Tracking", "Zone Analytics"]} />
              </h1>

              <p style={{ color: "#4a6fa5", fontSize: "clamp(14px,1.5vw,17px)", lineHeight: 1.8, maxWidth: 530, marginBottom: 34, opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(24px)", transition: "all .7s .3s ease" }}>
                Real-time GPS wagon tracking · AI predictive alerts · Enterprise cargo intelligence — built for Indian Railways.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(20px)", transition: "all .7s .4s ease" }}>
                <button className="btn-p" style={{ fontSize: 15, padding: "14px 34px" }} onClick={() => navigate("/login")}>
                  <ShieldOutlinedIcon style={{ fontSize: 17 }} /> Access Platform
                </button>
                <button className="btn-g" onClick={() => navigate("/create-account")}>Request Access →</button>
              </div>

              {/* mini stats bar */}
              <div style={{ display: "flex", gap: 24, marginTop: 44, flexWrap: "wrap", opacity: ready ? 1 : 0, transition: "opacity .7s .55s ease" }}>
                {[["2,400+", "Wagons", "#60a5fa"], ["8", "Zones", "#a78bfa"], ["99.9%", "Uptime", "#34d399"], ["< 2s", "Alerts", "#fbbf24"]].map(([v, l, c]) => (
                  <div key={l} style={{ borderLeft: `2px solid ${c}35`, paddingLeft: 13 }}>
                    <div style={{ color: c, fontSize: 20, fontWeight: 800, fontFamily: FM, lineHeight: 1 }}>{v}</div>
                    <div style={{ color: "#3a5a7c", fontSize: 11, marginTop: 3, fontWeight: 500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>


            {/* RIGHT — Train Animation */}
            <div className="hide-m" style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", opacity: ready ? 1 : 0, transform: ready ? "translate(60px, -60px)" : "translateX(32px)", transition: "all .8s .4s ease" }}>
              <HeroTrainAnimation />
            </div>

          </div>

          {/* scroll cue */}
          <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, animation: "lp-pulse 2.2s infinite" }}>
            <span style={{ color: "#1e3a5f", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>SCROLL</span>
            <div style={{ width: 1, height: 30, background: "linear-gradient(180deg,rgba(59,130,246,.4),transparent)" }} />
          </div>
        </section>

        {/* ── TICKER ───────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(30,58,100,.45)", borderBottom: "1px solid rgba(30,58,100,.45)", background: "rgba(3,12,26,.85)", padding: "12px 0", overflow: "hidden" }}>
          <div className="mq-wrap">
            <div className="mq-inner">
              {[...Array(2)].map((_, ri) =>
                ["🚆 2,400+ Wagons", "📍 NavIC GPS", "🤖 AI Alerts", "🔒 RBAC Auth", "📊 8 Zones", "⚡ Real-Time", "🛡 Secure", "📦 Cargo AI", "🔧 Maintenance", "📈 Analytics"].map((t, i) => (
                  <span key={`${ri}-${i}`} style={{ color: "#1e3a5f", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
                    {t} <span style={{ color: "#111e3a" }}>◆</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            STATS — id: platform
        ═══════════════════════════════════════════════════ */}
        <PlatformVideoSection FM={FM} FI={FI} />

        <div className="gdiv" />

        {/* ═══════════════════════════════════════════════════
            ROLES
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: "64px clamp(20px,6vw,76px)", position: "relative", overflow: "hidden" }} id="roles">
          <RolesSmokeCanvas />
          <div className="roles-g" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
            {[
              { ic: "🏛", role: "Admin",    c: "#3b82f6", bg: "linear-gradient(145deg,rgba(6,16,36,.96),rgba(4,12,28,.92))", border: "rgba(59,130,246,.2)", btnBg: "linear-gradient(135deg,#1d4ed8,#3b82f6)", btnShadow: "rgba(37,99,235,.4)" },
              { ic: "📊", role: "Analyst",  c: "#a855f7", bg: "linear-gradient(145deg,rgba(10,6,36,.96),rgba(8,4,26,.92))",  border: "rgba(139,92,246,.2)",  btnBg: "linear-gradient(135deg,#7c3aed,#a855f7)", btnShadow: "rgba(124,58,237,.4)" },
              { ic: "🚆", role: "Operator", c: "#22c55e", bg: "linear-gradient(145deg,rgba(3,16,10,.96),rgba(2,12,8,.92))",   border: "rgba(34,197,94,.2)",   btnBg: "linear-gradient(135deg,#15803d,#22c55e)", btnShadow: "rgba(34,197,94,.35)" },
            ].map((r, i) => (
              <Fade key={r.role} delay={i * .12}>
                <div style={{
                  background: r.bg, border: `1px solid ${r.border}`, borderRadius: 22,
                  padding: "32px 24px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 20, position: "relative", overflow: "hidden",
                  transition: "transform .3s cubic-bezier(.34,1.2,.64,1), box-shadow .3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,.55), 0 0 40px ${r.c}18`; e.currentTarget.style.borderColor = `${r.c}45`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = r.border; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${r.c},transparent)` }} />
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${r.c}0d,transparent 70%)`, pointerEvents: "none" }} />
                  {/* Icon */}
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: r.btnBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: `0 8px 28px ${r.btnShadow}` }}>
                    {r.ic}
                  </div>
                  {/* Login button */}
                  <button style={{ width: "100%", padding: "13px", border: "none", borderRadius: 12, background: r.btnBg, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 5px 22px ${r.btnShadow}`, fontFamily: FI, transition: "transform .2s, box-shadow .2s" }}
                    onClick={() => navigate("/login")}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                  >
                    {r.role} Login →
                  </button>
                </div>
              </Fade>
            ))}
          </div>
        </section>

        <div className="gdiv" />

        {/* ═══════════════════════════════════════════════════
            FEATURES — id: features
        ═══════════════════════════════════════════════════ */}
        <section id="features" style={{ padding: "88px clamp(20px,6vw,76px)" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="gtag" style={{ marginBottom: 14 }}>CAPABILITIES</span>
            <h2 style={{ fontFamily: FM, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginTop: 14 }}>
              Full-Stack <span className="gtext">Railway Intelligence</span>
            </h2>
          </div></Fade>
          <div className="ops-g" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { ic: "📍", c: "#3b82f6", t: "GPS Tracking", d: "Sub-2s NavIC + GPS dual-mode updates across all 8 zones with live route visualization.", tags: ["NavIC", "Geofencing", "Live Map"] },
              { ic: "🤖", c: "#a855f7", t: "AI Alerts", d: "ML models detect route deviation, cargo anomalies, and mechanical stress before incidents occur.", tags: ["Anomaly Detection", "Auto-Escalation"] },
              { ic: "🔧", c: "#f59e0b", t: "Predictive Maintenance", d: "Sensor-driven failure prediction up to 72h in advance. Cut unplanned downtime by 60%.", tags: ["IoT Sensors", "Failure Forecast"] },
              { ic: "📦", c: "#22c55e", t: "Cargo Intelligence", d: "Weight, temperature, tamper monitoring with automated digital freight manifests.", tags: ["Freight Tracking", "Digital Manifest"] },
              { ic: "📈", c: "#38bdf8", t: "Zone Analytics", d: "KPI dashboards, delay analysis, wagon utilisation reports — real-time network health.", tags: ["KPIs", "Zone Reports"] },
              { ic: "🔒", c: "#ef4444", t: "Enterprise Security", d: "HMAC-SHA256 tokens, RBAC, session auth, full audit trails — government-grade.", tags: ["RBAC", "Audit Logs"] },
            ].map((f, i) => (
              <Fade key={f.t} delay={i % 2 === 0 ? 0 : .1}>
                <div className="feat-card">
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.c}15`, border: `1px solid ${f.c}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0, transition: "transform .3s cubic-bezier(.34,1.4,.64,1)" }}>{f.ic}</div>
                  <div>
                    <h4 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, marginBottom: 7, fontFamily: FM }}>{f.t}</h4>
                    <p style={{ color: "#3a5a7c", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{f.d}</p>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {f.tags.map(t => <span key={t} style={{ background: `${f.c}10`, border: `1px solid ${f.c}22`, borderRadius: 20, padding: "2px 9px", fontSize: 10, color: f.c, fontWeight: 700 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </section>

        <div className="gdiv" />

        {/* ═══════════════════════════════════════════════════
            AI SECTION — id: analytics
        ═══════════════════════════════════════════════════ */}
        <section id="analytics" style={{ padding: "88px clamp(20px,6vw,76px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 360, background: "radial-gradient(ellipse,rgba(124,58,237,.055),transparent 70%)", pointerEvents: "none" }} />
          <Fade><div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="gtag" style={{ background: "rgba(124,58,237,.1)", borderColor: "rgba(124,58,237,.25)", color: "#c084fc", marginBottom: 14 }}>AI ENGINE</span>
            <h2 style={{ fontFamily: FM, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginTop: 14 }}>
              Where AI Meets <span style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Rail Ops</span>
            </h2>
          </div></Fade>
          <div className="ai-g" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {[
              { ic: "🧠", t: "Smart Monitoring", sub: "Always-On", d: "24/7 multivariate analysis — zero manual oversight.", c: "#a855f7", pct: 94 },
              { ic: "🔮", t: "Predictive AI", sub: "72h Forecast", d: "ML regression models predict failure before it happens.", c: "#3b82f6", pct: 87 },
              { ic: "⚡", t: "Instant Alerts", sub: "< 2s Response", d: "Auto-classify and route anomalies to the right team.", c: "#f59e0b", pct: 99 },
              { ic: "📋", t: "Auto Reports", sub: "Zero-Touch", d: "Scheduled zone reports and compliance docs delivered automatically.", c: "#22c55e", pct: 100 },
              { ic: "🗺", t: "Route AI", sub: "Dynamic", d: "Optimise routes using track conditions, congestion, weather.", c: "#38bdf8", pct: 82 },
              { ic: "📊", t: "Data Insights", sub: "Deep Analytics", d: "Cross-zone trends and fleet optimisation recommendations.", c: "#f97316", pct: 91 },
            ].map((a, i) => (
              <Fade key={a.t} delay={(i % 3) * .09}>
                <div className="ai-card">
                  <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle,${a.c}12,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontSize: 26, marginBottom: 12 }}>{a.ic}</div>
                  <div style={{ color: a.c, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 }}>{a.sub}</div>
                  <h4 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, marginBottom: 8, fontFamily: FM }}>{a.t}</h4>
                  <p style={{ color: "#3a5a7c", fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>{a.d}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: "#1e3a5f", fontSize: 10, fontWeight: 600 }}>Accuracy</span>
                    <span style={{ color: a.c, fontSize: 11, fontWeight: 700 }}>{a.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(12,28,60,.8)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${a.pct}%`, background: `linear-gradient(90deg,${a.c}70,${a.c})`, borderRadius: 4, transition: "width 1.2s ease" }} />
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </section>

        <div className="gdiv" />

        {/* ═══════════════════════════════════════════════════
            CTA — id: security
        ═══════════════════════════════════════════════════ */}
        <section id="security" style={{ padding: "88px clamp(20px,6vw,76px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 280, background: "radial-gradient(ellipse,rgba(37,99,235,.07),transparent 70%)", pointerEvents: "none" }} />
          <Fade>
            <div style={{ background: "linear-gradient(135deg,rgba(6,16,36,.96),rgba(4,12,28,.94))", border: "1px solid rgba(59,130,246,.2)", borderRadius: 26, padding: "clamp(36px,5vw,64px) clamp(24px,5vw,56px)", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,.4)" }}>
              <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(99,163,255,.4),transparent)" }} />
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59,130,246,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.022) 1px,transparent 1px)", backgroundSize: "38px 38px", pointerEvents: "none" }} />
              <Particles n={22} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span className="gtag" style={{ marginBottom: 18 }}>GET STARTED</span>
                <h2 style={{ fontFamily: FM, fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1.5px", marginTop: 14, marginBottom: 18 }}>
                  Start Monitoring<br /><span className="gtext">Your Fleet Today</span>
                </h2>
                <p style={{ color: "#3a5a7c", fontSize: 15, maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.75 }}>
                  Submit your access request and get Zone Admin approval within 24 hours.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-p" style={{ fontSize: 15, padding: "15px 38px" }} onClick={() => navigate("/login")}>
                    <ShieldOutlinedIcon style={{ fontSize: 17 }} /> Sign In
                  </button>
                  <button className="btn-g" style={{ padding: "15px 30px" }} onClick={() => navigate("/create-account")}>
                    Request Access →
                  </button>
                </div>
                <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 34, flexWrap: "wrap" }}>
                  {["🔒 @railway.gov.in only", "🛡 RBAC Secured", "📋 Fully Audited", "🏛 Govt. of India"].map(t => (
                    <span key={t} style={{ color: "#1e3a5f", fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid rgba(20,45,80,.5)", padding: "32px clamp(20px,6vw,76px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚆</div>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 12, fontFamily: FM }}>Bharath WAGONS</div>
              <div style={{ color: "#1e3a5f", fontSize: 10 }}>Ministry of Railways, Government of India</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Privacy",null],["Security","security"],["Terms",null],["Contact",null]].map(([l, id]) => (
              <span key={l}
                onClick={() => id && scrollTo(id)}
                style={{ color: "#1e3a5f", fontSize: 12, cursor: id ? "pointer" : "default", transition: "color .2s", fontWeight: 500 }}
                onMouseEnter={e => { if (id) e.currentTarget.style.color = "#60a5fa"; }}
                onMouseLeave={e => e.currentTarget.style.color = "#1e3a5f"}>{l}</span>
            ))}
          </div>
          <div style={{ color: "#111e3a", fontSize: 10 }}>© 2025 · v2.4.1</div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
