import React, { Fragment } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Preferences from "./components/Preferences";
import CommandBuilder from "./components/CommandBuilder";
import LessonBuilder from "./components/LessonBuilder";
import BetaArea from "./components/BetaArea";
import NavBar from "./components/NavBar";
import "./services/main";

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <NavBar />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/prefs" component={Preferences} />
        <Route path="/commands" component={CommandBuilder} />
        <Route path="/lessons" component={LessonBuilder} />
        <Route path="/beta" component={BetaArea} />
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
