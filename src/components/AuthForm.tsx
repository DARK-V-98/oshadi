'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile, User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type AuthFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.61-3.317-11.28-7.94l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.438 36.323 48 30.652 48 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
)

export default function AuthForm({ open, onOpenChange }: AuthFormProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm">
         <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create a new account to continue.
          </DialogDescription>
        </DialogHeader>
        <div className={cn('relative w-full h-[580px] [transform-style:preserve-3d] transition-transform duration-700', isFlipped && '[transform:rotateY(180deg)]')}>
          {/* Front Side: Sign In */}
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <AuthCard>
              <SignInForm onSignUpClick={() => setIsFlipped(true)} onOpenChange={onOpenChange} />
            </AuthCard>
          </div>

          {/* Back Side: Sign Up */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <AuthCard>
              <SignUpForm onSignInClick={() => setIsFlipped(false)} onOpenChange={onOpenChange} />
            </AuthCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full h-full p-8 rounded-2xl border border-border bg-card shadow-xl text-card-foreground">
        {children}
    </div>
);

const handleUserInFirestore = async (user: User, firestore: any, toast: any) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        const newUser = {
            uid: user.uid,
            name: user.displayName || 'New User',
            email: user.email,
            role: 'user', // Default role
        };
        await setDoc(userDocRef, newUser, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUser,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
        toast({ title: 'Welcome!', description: 'Your profile has been created.' });
    }
};

const SignInForm = ({ onSignUpClick, onOpenChange }: { onSignUpClick: () => void, onOpenChange: (open: boolean) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Service not available' });
      return;
    }
    setIsLoading(true);

    try {
      const userCredential = await signIn(email, password);
      await handleUserInFirestore(userCredential.user, firestore, toast);
      toast({ title: 'Signed in successfully!' });
      onOpenChange(false);
      router.push('/dashboard'); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description: error.code === 'auth/invalid-credential' 
          ? 'Incorrect email or password.' 
          : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Service not available' });
        return;
    }
    setIsGoogleLoading(true);
    try {
        const userCredential = await signInWithGoogle();
        await handleUserInFirestore(userCredential.user, firestore, toast);
        toast({ title: 'Signed in with Google!' });
        onOpenChange(false);
        router.push('/dashboard');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Google Sign-in failed', description: error.message });
    } finally {
        setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-heading">Login</h2>
        <p className="text-muted-foreground">Access your dashboard.</p>
      </div>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
          <LogIn className="mr-2" /> {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
       <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
           {isGoogleLoading ? 'Signing in...' : <><GoogleIcon /> Google</>}
        </Button>

      <div className="mt-auto text-center">
        <p className="text-sm text-muted-foreground">
          No account?{' '}
          <button onClick={onSignUpClick} className="font-semibold underline text-primary hover:text-primary/80">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

const SignUpForm = ({ onSignInClick, onOpenChange }: { onSignInClick: () => void, onOpenChange: (open: boolean) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Firebase not available' });
        return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUser = {
        uid: user.uid,
        name: name,
        email: user.email,
        role: 'user', // Default role
      };

      await setDoc(userDocRef, newUser, { merge: true }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUser,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw permissionError; // re-throw to be caught by outer try-catch
      });
      
      toast({
          title: 'Account created!',
          description: 'You can now sign in.',
      });
      onSignInClick();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-up failed.',
        description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-heading">Sign Up</h2>
        <p className="text-muted-foreground">Create a new account.</p>
      </div>
      <form onSubmit={handleSignUp} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Name</Label>
          <Input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
          <UserPlus className="mr-2" /> {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      <div className="mt-auto text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={onSignInClick} className="font-semibold underline text-primary hover:text-primary/80">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
