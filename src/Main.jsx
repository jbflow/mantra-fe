import React from 'react'


import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from '../amplifyconfiguration.json';
import ContextComposer from "./contexts/ContextComposer";
import App from './App';
import { BrowserRouter } from 'react-router-dom';
Amplify.configure(config);

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


