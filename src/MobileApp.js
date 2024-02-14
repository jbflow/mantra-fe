import React, { useContext, useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import StatusBar from "./components/StatusBar";
import NavBar from "./components/NavBar";
import { Route } from "react-router-dom/cjs/react-router-dom.min";
import AccountManagement from "./components/AccountManagement";
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import CommandTesting from "./components/CommandTesting";
function MobileApp({ signOut }) {
  return (
    <>
      <TopBar/>
    </>
  );
}

export default MobileApp;
