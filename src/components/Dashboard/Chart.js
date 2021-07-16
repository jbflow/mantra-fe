import React, { useContext, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Row, Col, Button } from "react-bootstrap";

import { UsageContext } from "../../contexts/UsageContext";

const data = [
  { name: "Page A", uv: 5 },
  { name: "Page B", uv: 100 },
  { name: "Page B", uv: 250 },
  { name: "Page B", uv: 25 },
  { name: "Page B", uv: 2 },
];
export default function Chart() {
  const usageData = useContext(UsageContext);
  const [time, setTime] = useState(true);
  const generateData = (type) => {
    let data = [];
    for (let key in usageData.data) {
      if (key === "userId") continue;
      data.push({ date: key, uv: usageData.data[key][type] });
    }
    const length = data.length;
    for (let i = 31; i > length; i--) {
      data.push({ date: null });
    }
    return data;
  };

  return (
    <>
      {time ? (
        <ResponsiveContainer
          className="m-auto pt-3"
          width={"80%"}
          height={"80%"}
        >
          <LineChart data={generateData("time")}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />

            <XAxis
              dataKey="date"
              interval="preserveStart"
              padding={{ top: 10 }}
            />
            <YAxis />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer
          className="m-auto pt-3"
          width={"80%"}
          height={"80%"}
        >
          <LineChart data={generateData("total_commands")}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />

            <XAxis dataKey="date" />
            <YAxis />
          </LineChart>
        </ResponsiveContainer>
      )}

      <Row>
        <Col>
          <center>
            <Button
              onClick={() => {
                setTime(!time);
              }}
            >
              {time ? "Show Commands" : "Show Time"}
            </Button>
          </center>
        </Col>
      </Row>
    </>
  );
}
