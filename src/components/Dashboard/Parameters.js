import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Parameters({ sel_track, sel_device, parameters }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-sm">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">
            Parameters{" "}
            <span className="font-italic text-muted">(selected device)</span>
          </p>
        </div>

        {parameters[sel_track - 1]
          ? parameters[sel_track - 1][sel_device - 1]
            ? parameters[sel_track - 1][sel_device - 1].map((parameter, id) => (
                <p className="dashboard-contents m-2" key={id}>
                  {parameter}
                </p>
              ))
            : null
          : null}
      </div>
    </>
  );
}
