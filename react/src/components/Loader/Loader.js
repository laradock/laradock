import React from "react";
import "./Loader.scss";

const Loader = () => {
  return (
    <div className="spinnerContainer d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
