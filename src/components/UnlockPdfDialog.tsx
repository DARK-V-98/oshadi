"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"

type UnlockPdfDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UnlockPdfDialog({ open, onOpenChange }: UnlockPdfDialogProps) {
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleUnlock = () => {
    // This is just a placeholder logic.
    // In a real app, you would check if the user is logged in.
    const isLoggedIn = true; // Replace with actual auth check

    if (!isLoggedIn) {
        toast({
            title: "Authentication Required",
            description: "Please log in or create an account to unlock notes.",
            variant: "destructive"
        });
        onOpenChange(false); // Close this dialog
        // Here you would trigger your main login modal
    } else {
        // If logged in, redirect to dashboard where they can bind the key
        router.push('/dashboard');
        toast({
            title: "Redirecting to Dashboard",
            description: "Please bind your key in the user dashboard.",
        });
        onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Access Your Notes</DialogTitle>
          <DialogDescription>
            To unlock and download your purchased notes, please log in to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
                After logging in, you can enter your one-time key in your personal dashboard to access the PDF files.
            </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleUnlock}>Login to Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
