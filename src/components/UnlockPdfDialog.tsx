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

type UnlockPdfDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UnlockPdfDialog({ open, onOpenChange }: UnlockPdfDialogProps) {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const handleDownload = () => {
    if (code.trim()) {
      toast({
        title: "Download Started",
        description: "Your PDF is being downloaded. Your code has been used.",
      });
      // Here you would typically trigger a download
      console.log(`Downloading with code: ${code}`);
      setCode("");
      onOpenChange(false);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid access code.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Unlock Your PDF</DialogTitle>
          <DialogDescription>
            Enter the unique one-time code you received after purchase to download your notes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="access-code"
            placeholder="Enter your access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleDownload}>Download Instantly</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
