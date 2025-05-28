import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface GoogleSignInButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function GoogleSignInButton({ 
  variant = 'outline', 
  className = '',
  fullWidth = true,
  isLoading = false
}: GoogleSignInButtonProps) {
  const { toast } = useToast();
  
  const handleSignIn = async () => {
    try {
      // This is a placeholder for actual Google sign-in
      // Replace with your own authentication logic
      toast({
        title: "Feature coming soon",
        description: "Google Sign-In integration will be available soon.",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={`${className} ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2`}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg 
          viewBox="0 0 24 24" 
          width="18" 
          height="18" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" fill="currentColor"></path>
          </g>
        </svg>
      )}
      Sign in with Google
    </Button>
  );
}