import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Devices({ sel_track, devices }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-sm">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">
            Devices{" "}
            <span className="font-italic text-right text-muted">
              (selected track)
            </span>
          </p>
        </div>
        {devices[sel_track - 1]
          ? devices[sel_track - 1].map((device, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {device}
              </p>
            ))
          : null}
      </div>
    </>
  );
}
