import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from '../utils/firebase';
import { loginWithToken, registerUser } from '../utils/services/authService';
import { getMyProfile } from '../utils/services/userService';
import { saveToken, clearToken, saveUserData, getUserData } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: save user data from backend response
  const handleBackendUser = async (data) => {
    const user = data.user || data;
    setUserData(user);
    await saveUserData(user);
  };

  // Sync with backend after Firebase auth
  const syncBackendUser = async (fbUser) => {
    try {
      // 1. Get fresh Firebase ID token
      const idToken = await fbUser.getIdToken(true);
      await saveToken(idToken);

      // 2. Try login first (most users are already registered)
      try {
        const data = await loginWithToken(idToken);
        await handleBackendUser(data);
        return;
      } catch (loginErr) {
        if (loginErr.response?.status === 401) {
          // Expected — fall through to register
        } else {
          throw loginErr;
        }
      }

      // 3. Re-save token
      await saveToken(idToken);

      // 4. User not found — auto-register
      const username = fbUser.displayName?.replace(/\s+/g, '_')
        || fbUser.email?.split('@')[0]
        || `user_${Date.now()}`;

      try {
        const data = await registerUser(
          idToken,
          username,
          fbUser.email,
          fbUser.displayName?.split(' ')[0] || null,
          fbUser.displayName?.split(' ').slice(1).join(' ') || null,
        );
        await handleBackendUser(data);
      } catch (regErr) {
        if (regErr.response?.status === 409) {
          const data = await loginWithToken(idToken);
          await handleBackendUser(data);
        } else {
          throw regErr;
        }
      }
    } catch (err) {
      console.error('Backend sync error:', err?.response?.data || err?.message || err);
      setError(err.response?.data?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncBackendUser(fbUser);
      } else {
        setUserData(null);
        await clearToken();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncBackendUser(result.user);
    } catch (err) {
      const code = err.code;
      if (code === 'auth/user-not-found') setError('ไม่พบบัญชีนี้ในระบบ');
      else if (code === 'auth/wrong-password') setError('รหัสผ่านไม่ถูกต้อง');
      else if (code === 'auth/invalid-credential') setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      else if (code === 'auth/too-many-requests') setError('ลองหลายครั้งเกินไป กรุณารอสักครู่');
      else setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password, username) => {
    setError(null);
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await saveToken(idToken);
      const data = await registerUser(idToken, username, email);
      await handleBackendUser(data);
    } catch (err) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') setError('อีเมลนี้ถูกใช้งานแล้ว');
      else if (code === 'auth/weak-password') setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      else if (err.response?.data?.message) setError(err.response.data.message);
      else setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In: receive Google ID token from expo-auth-session,
  // create Firebase credential, sign in, then sync with backend
  const loginWithGoogle = async (googleIdToken) => {
    setError(null);
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const result = await signInWithCredential(auth, credential);
      await syncBackendUser(result.user);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
    setFirebaseUser(null);
    await clearToken();
  };

  // Lightweight refresh: just GET /users/me — no Firebase re-auth
  const refreshUserData = async () => {
    try {
      const profile = await getMyProfile();
      const user = profile.user || profile;
      setUserData(user);
      await saveUserData(user);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // Fallback: full re-sync via Firebase
      if (firebaseUser) {
        await syncBackendUser(firebaseUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userData,
        loading,
        error,
        isAuthenticated: !!userData,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshUserData,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
