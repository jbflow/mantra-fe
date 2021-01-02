import React, { Fragment } from 'react';
import Socket from './components/Socket'
import CommandBuilder from './components/CommandBuilder'

function App() {
  console.log('test redeploy');
  return (
    <Fragment>
      <Socket />
      <CommandBuilder />
    </Fragment>
  )
}

export default App;
