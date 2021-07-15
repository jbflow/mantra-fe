import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import Chart from "./Chart.js";
import { CommandsContext } from "../../contexts/CommandsContext";

export default function General({ totalTime, totalCommands }) {
  const { data } = useContext(CommandsContext);
  return (
    <>
      <div className="mt-3 dashboard-card db-xlg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">Overview</p>
        </div>
        <Row>
          <Col>
            <div className="m-3">
              <p>
                Total Speech Time:{" "}
                {new Date(totalTime).toISOString().slice(11, 19)}
              </p>
              <p>Total Spoke Commands: {totalCommands}</p>
              <p>Total Macros:</p>
              <p>Macros Created:</p>
              <p>Macros Deleted:</p>
              <p>Current Open DAW:</p>
              <p>Most Frequent Macro:</p>
              <p>Number of Tracks:</p>
              <p>Number of Devices:</p>
              <p>Number of Clips:</p>
            </div>
          </Col>
          <Col>
            <Chart />
          </Col>
        </Row>
      </div>
    </>
  );
}
