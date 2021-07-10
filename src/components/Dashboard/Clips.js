import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Clips({ sel_track, clips }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-sm">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">
            Clips{" "}
            <span className="font-italic text-right text-muted">
              (selected track)
            </span>
          </p>
        </div>

        {clips[sel_track - 1]
          ? clips[sel_track - 1].map((clip, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {clip}
              </p>
            ))
          : null}
      </div>
    </>
  );
}
