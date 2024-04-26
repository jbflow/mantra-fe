import React from 'react'


import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from '../amplifyconfiguration.json';
import stagingConfig from '../amplifyconfiguration-staging.json';
import ContextComposer from "./contexts/ContextComposer";
import App from './App';
import { BrowserRouter } from 'react-router-dom';

if (import.meta.env.VITE_MODE === "dev") {
    Amplify.configure(config);
}
else if (import.meta.env.VITE_MODE === "staging") {
    Amplify.configure(stagingConfig);
}

function Main({ signOut, user }) {
    return (
        <ContextComposer user={user} isMobile={false}>
            <BrowserRouter>
                <App signOut={signOut}>
                </App>
            </BrowserRouter>
        </ContextComposer>
    )
}

export default withAuthenticator(Main, { hideSignUp: true })


