import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Tracks({ tracks }) {
  return (
    <>
      <div className="mt-3 dashboard-card db-sm">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">Tracks</p>
        </div>

        {tracks
          ? tracks.map((track, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {track}
              </p>
            ))
          : null}
      </div>
    </>
  );
}
