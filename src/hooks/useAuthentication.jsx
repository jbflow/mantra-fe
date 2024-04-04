import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import {  Hub } from 'aws-amplify/utils'
import { Button } from 'react-bootstrap'
import { getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth'

/**
 * Handle user authentication and related features.
 *
 * @returns {{
 *   isAuthenticated: boolean,
 *   user: CognitoUser,
 *   error: any,
 *   signIn: function,
 *   signOut: function,
 *   SignInButton: React.Component,
 * }}
 *
 * @see https://aws-amplify.github.io/amplify-js/api/classes/authclass.html
 * @see https://aws-amplify.github.io/amplify-js/api/classes/hubclass.html
 * @see https://aws-amplify.github.io/docs/js/hub#listening-authentication-events
 * @see https://github.com/aws-amplify/amplify-js/blob/master/packages/amazon-cognito-identity-js/src/CognitoUser.js
 */
const useAuthentication = () => {
	const [user, setUser] = useState(null)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [error, setError] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const refreshState = useCallback(() => {
		setIsLoading(true)

		getCurrentUser()
			.then(user => {
				setUser(user)
				setIsAuthenticated(_isAuthenticated(user))
				setError(null)
				setIsLoading(false)
			})
			.catch(err => {
				setUser(null)
				setIsAuthenticated(false)
				if (err === 'not authenticated') {
					setError(null)
				} else {
					setError(err)
				}
				setIsLoading(false)
			})
	}, [])

	// Make sure our state is loaded before first render
	useLayoutEffect(() => {
		refreshState()
	}, [refreshState])

	// Subscribe to auth events
	useEffect(() => {
		const handler = ({ payload }) => {
			switch (payload.event) {
				case 'configured':
				case 'signIn':
				case 'signIn_failure':
				case 'signOut':
					refreshState()
					break

				default:
					break
			}
		}

		Hub.listen('auth', handler)

		return () => {
			Hub.remove('auth', handler)
		}
	}, [refreshState])

	const signIn = useCallback(() => {
		signInWithRedirect({ provider: 'COGNITO' }).catch(err => {
			setError(err)
		})
	}, [])

	const handleSignOut = useCallback(() => {
		signOut()
			.then(_ => refreshState())
			.catch(err => {
				setError(err)
			})
	}, [refreshState])

	const CognitoSignInButton = useCallback(
		({ label = 'Sign In', ...props }) => (
			<Button variant="primary" onClick={signIn} {...props}>
				{label}
			</Button>
		),
		[signIn]
	)

	return {
		isAuthenticated,
		isLoading,
		user,
		error,
		signIn,
		handleSignOut,
		SignInButton: CognitoSignInButton,
	}
}

const _isAuthenticated = user => {
	if (
		!user ||
		!user.signInUserSession ||
		!user.signInUserSession.isValid ||
		!user.signInUserSession.accessToken ||
		!user.signInUserSession.accessToken.getExpiration
	) {
		return false
	}

	const session = user.signInUserSession
	const isValid = session.isValid() || false

	const sessionExpiry = new Date(session.accessToken.getExpiration() * 1000)
	const isExpired = new Date() > sessionExpiry

	return isValid && !isExpired
}

export default useAuthentication