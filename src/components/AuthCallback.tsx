import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from email verification
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Email verification failed. Please try again.');
          navigate('/login');
          return;
        }

        if (data.session) {
          // User successfully verified their email
          toast.success('Email verified successfully! You can now login.');
          navigate('/login');
        } else {
          // No session, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        toast.error('An unexpected error occurred. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifying your email...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
