import React from "react";
import Sidebar from "./Sidebar";
import "../styles/home.css";
import OverviewContent from "./OverviewContent";

const Overview = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard--content">
        <OverviewContent />
      </div>
    </div>
  );
};

export default Overview;
