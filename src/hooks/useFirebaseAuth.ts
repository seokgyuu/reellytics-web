import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const auth = getAuth();

function useFirebaseAuth() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.idToken) {
      const credential = GoogleAuthProvider.credential(session.idToken);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('Firebase 사용자 인증 성공');
        })
        .catch((error) => {
          console.error('Firebase 사용자 인증 실패:', error);
        });
    }
  }, [session]);
}

export default useFirebaseAuth;
