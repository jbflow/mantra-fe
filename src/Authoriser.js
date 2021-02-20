import { Auth, Hub } from 'aws-amplify'
import config from "./amplify-config";
import App from './App';
import useAuthentication from './hooks/useAuthentication';
Hub.listen(/.*/, ({ channel, payload }) =>
	console.debug(`[hub::${channel}::${payload.event}]`, payload)
)
// https://aws-amplify.github.io/docs/js/authentication#manual-setup
Auth.configure({
	region: config.cognito.REGION,
	userPoolId: config.cognito.USER_POOL_ID,
	userPoolWebClientId: config.cognito.APP_CLIENT_ID,

	// Cognito Hosted UI configuration
	oauth: {
		domain: 'dbs-talkback.auth.eu-west-2.amazoncognito.com',
		scope: [
			'phone',
			'email',
			'openid',
			'aws.cognito.signin.user.admin',
			'profile',
		],
		redirectSignIn: `${document.location.origin}/callback`,
		redirectSignOut: `${document.location.origin}/signout`,
		userPoolId: config.cognito.USER_POOL_ID,
		responseType: 'code',
	},
})

const Authoriser = () => {
	const {
		isAuthenticated,
		isLoading,
		// user,
		// error,
		// signIn,
		signOut,
		SignInButton
	} = useAuthentication();
	return !isLoading && (
		isAuthenticated ? (
			<>
				<App signOut={signOut} />
			</>
		) : <SignInButton />
	)
};
export default Authoriser;
