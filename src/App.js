import React, { Fragment } from 'react';
import Socket from './components/Socket'
import CommandBuilder from './components/CommandBuilder'

function App() {
  return (
    <Fragment>
      <Socket />
      <CommandBuilder />
    </Fragment>
  )
}

export default App;
