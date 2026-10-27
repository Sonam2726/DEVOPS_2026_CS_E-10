import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AuthenticatedLayout.css";

function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="authenticated-layout">
      {sidebarOpen && (
        <button
          className="authenticated-sidebar-overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="authenticated-layout-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        {children || <Outlet />}
      </div>
    </div>
  );
}

export default AuthenticatedLayout;
