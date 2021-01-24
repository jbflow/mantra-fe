import React, { Fragment } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Preferences from "./components/Preferences";
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import LessonBuilder from "./components/LessonBuilder/LessonBuilder";
import BetaArea from "./components/BetaArea";
import NavBar from "./components/NavBar";
import { getWebSocket, getConfigFunction } from "./services/main";

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <NavBar />
        <Route path="/dashboard" component={Dashboard} />
        <Route
          path="/prefs"
          render={() => (
            <Preferences
              ref={(Preferences) => {
                window.Preferences = Preferences;
              }}
            />
          )}
        />
        <Route
          path="/commands"
          render={(props) => (
            <CommandBuilder
              {...props}
              ws={getWebSocket()}
              getConfig={getConfigFunction}
            />
          )}
        />
        <Route path="/lessons" component={LessonBuilder} />
        <Route
          path="/beta"
          render={(props) => (
            <BetaArea
              {...props}
              ws={getWebSocket()}
              getConfig={getConfigFunction}
            />
          )}
        />
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
