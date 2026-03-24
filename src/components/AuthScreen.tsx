import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, Shield, Chrome, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, { displayName });
        
        // Create user doc
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          photoURL: null,
          createdAt: Timestamp.now(),
          role: 'user',
          hasCompletedOnboarding: false
        }, { merge: true });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-wellness-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl shadow-wellness-ink/5 border border-wellness-ink/5"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-wellness-ink text-white rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-wellness-ink/20">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-serif text-wellness-ink mb-2">
            {isLogin ? 'Welcome Back' : 'Join DermScan'}
          </h2>
          <p className="text-wellness-ink/40 text-sm font-medium">
            {isLogin ? 'Sign in to continue your care' : 'Create an account for skin health'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-wellness-ink/30 group-focus-within:text-wellness-accent transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-wellness-bg border-2 border-transparent focus:border-wellness-accent focus:bg-white rounded-2xl outline-none transition-all font-medium text-wellness-ink placeholder:text-wellness-ink/20"
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-wellness-ink/30 group-focus-within:text-wellness-accent transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-wellness-bg border-2 border-transparent focus:border-wellness-accent focus:bg-white rounded-2xl outline-none transition-all font-medium text-wellness-ink placeholder:text-wellness-ink/20"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-wellness-ink/30 group-focus-within:text-wellness-accent transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-14 py-5 bg-wellness-bg border-2 border-transparent focus:border-wellness-accent focus:bg-white rounded-2xl outline-none transition-all font-medium text-wellness-ink placeholder:text-wellness-ink/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-wellness-ink/30 hover:text-wellness-ink transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-wellness-ink text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-wellness-ink/90 transition-all shadow-xl shadow-wellness-ink/20 disabled:opacity-50 group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-wellness-ink/5" />
          <span className="text-wellness-ink/20 text-xs font-bold uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-wellness-ink/5" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-5 bg-white border-2 border-wellness-ink/5 text-wellness-ink rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-bg transition-all disabled:opacity-50"
        >
          <Chrome size={20} className="text-wellness-accent" />
          Google Account
        </button>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-wellness-ink/40 font-bold text-sm hover:text-wellness-ink transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-wellness-accent underline underline-offset-4">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
