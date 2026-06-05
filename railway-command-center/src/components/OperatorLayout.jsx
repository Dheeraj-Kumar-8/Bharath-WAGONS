import OperatorSidebar from "./OperatorSidebar";
import OperatorNavbar from "./OperatorNavbar";
import "../styles/global.css";

const OperatorLayout = ({ children, title, sub, alertCount }) => (
  <div className="page-wrapper">
    <OperatorSidebar />
    <div className="main-area">
      <OperatorNavbar title={title} sub={sub} alertCount={alertCount} />
      <div className="content-area">
        {children}
      </div>
    </div>
  </div>
);

export default OperatorLayout;
