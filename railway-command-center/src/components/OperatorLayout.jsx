import OperatorSidebar from "./OperatorSidebar";
import OperatorNavbar from "./OperatorNavbar";
import SidebarChatBot from "./SidebarChatBot";
import { useAuth, ALL_PERMISSIONS } from "../context/AuthContext";
import "../styles/global.css";

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
    <div className="page-wrapper">
      <OperatorSidebar />
      <div className="main-area">
        <OperatorNavbar />
        <div className="content-area">
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
      <SidebarChatBot />
    </div>
  );
};

export default OperatorLayout;
