// Next JS related
import Head from 'next/head';
import { useRouter } from 'next/router';

// Firebase related
import { useAuthState } from 'react-firebase-hooks/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth, firebase } from '../lib/firebaseApp';
import { uiConfig } from '../lib/firebaseApp';

export default function Login() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();

    if (loading) return <>Loading...</>
    else if (error) return <div>{error}</div>
    else if (user) {
        // user is already logged in, redirect to home page
        router.push('/');
    }

    const authConfig = uiConfig(firebase);

    return (
        <>
            <Head>
                <title>LogIn</title>
            </Head>
            <StyledFirebaseAuth uiConfig={authConfig} firebaseAuth={auth} />
        </>
    )
}