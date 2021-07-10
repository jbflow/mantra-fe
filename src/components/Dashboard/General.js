import React from "react";
import { Container, Table } from "react-bootstrap";

export default function General({ totalTime, totalCommands }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-xlg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">Overview</p>
        </div>
        <p>
          Total speech time: {new Date(totalTime).toISOString().slice(11, 19)}
        </p>
        <p> Total commands used: {totalCommands}</p>
      </div>
    </>
  );
}
