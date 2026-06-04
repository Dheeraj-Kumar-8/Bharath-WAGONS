import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/global.css";

const DashboardLayout = ({ children, title, sub }) => (
  <div className="page-wrapper">
    <Sidebar />
    <div className="main-area">
      <Navbar />
      <div className="content-area">
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
);

export default DashboardLayout;
