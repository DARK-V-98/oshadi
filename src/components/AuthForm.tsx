'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, setDoc } from 'firebase/firestore';

type AuthFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthForm({ open, onOpenChange }: AuthFormProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm">
        <div className={cn('relative w-full h-[550px] [transform-style:preserve-3d] transition-transform duration-700', isFlipped && '[transform:rotateY(180deg)]')}>
          {/* Front Side: Sign In */}
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <AuthCard>
              <SignInForm onSignUpClick={() => setIsFlipped(true)} onOpenChange={onOpenChange} />
            </AuthCard>
          </div>

          {/* Back Side: Sign Up */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <AuthCard>
              <SignUpForm onSignInClick={() => setIsFlipped(false)} />
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

const SignInForm = ({ onSignUpClick, onOpenChange }: { onSignUpClick: () => void, onOpenChange: (open: boolean) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast({ title: 'Signed in successfully!' });
      onOpenChange(false);
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-heading">Login</h2>
        <p className="text-muted-foreground">Access your admin dashboard.</p>
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
        <Button type="submit" className="w-full">
          <LogIn className="mr-2" /> Sign In
        </Button>
      </form>
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

const SignUpForm = ({ onSignInClick }: { onSignInClick: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Database not available' });
        return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'user', // Default role
      });

      toast({
        title: 'Account created!',
        description: 'You can now sign in.',
      });
      onSignInClick(); // Flip back to sign-in form
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-heading">Sign Up</h2>
        <p className="text-muted-foreground">Create a new admin account.</p>
      </div>
      <form onSubmit={handleSignUp} className="space-y-4">
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
        <Button type="submit" className="w-full">
          <UserPlus className="mr-2" /> Create Account
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
