import { Link, useLocation } from "react-router-dom";
import "./ContextualNavigation.css";

function ContextualNavigation({ label, fallbackPath, fallbackLabel }) {
  const location = useLocation();
  const previous = location.state?.from;
  const destination =
    previous?.pathname && previous.pathname !== location.pathname
      ? { pathname: previous.pathname, search: previous.search || "" }
      : fallbackPath;

  return (
    <nav className="contextual-navigation" aria-label="Breadcrumb">
      <Link to={destination}>{previous?.label || fallbackLabel}</Link>
      <span aria-hidden="true">/</span>
      <span>{label}</span>
    </nav>
  );
}

export default ContextualNavigation;
