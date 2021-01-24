import React, { Component } from "react";
import LessonActions from "./LessonActions";
import "../../styles/App.css";

export default class LessonBuilder extends Component {
  render() {
    return (
      <div className="rowC">
        <LessonActions />
      </div>
    );
  }
}
