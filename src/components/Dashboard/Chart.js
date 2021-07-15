import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Page A", uv: 5 },
  { name: "Page B", uv: 100 },
  { name: "Page B", uv: 250 },
  { name: "Page B", uv: 25 },
  { name: "Page B", uv: 2 },
];
export default function Chart() {
  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="uv" stroke="#8884d8" />

          <XAxis dataKey="name" />
          <YAxis />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
