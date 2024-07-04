import MobileNav from "./../../components/shared/MobileNav";
import Sidebar from "./../../components/shared/Sidebar";
import React from "react";

type LayoutProps = { children: React.ReactNode };

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="root">
      {/* sidebar */}
      <Sidebar/>
      {/* mobile nav */}
      <MobileNav/>
      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
