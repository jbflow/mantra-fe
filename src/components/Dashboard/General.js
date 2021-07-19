import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import Chart from "./Chart.js";
import { CommandsContext } from "../../contexts/CommandsContext";

export default function General({ totalTime, totalCommands }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-xlg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">
            Usage <span className="text-muted">(This Period)</span>
          </p>
        </div>
        <Chart />
      </div>
    </>
  );
}
