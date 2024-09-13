'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

const ConfirmEmail = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token'); // Get token from URL query params
      if (!token) {
        setError('Invalid or missing confirmation token.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        type: 'signup',
        token,
        email: searchParams.get('email') || '', // Get email from URL query params
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setLoading(false);
        router.push('/login'); // Redirect to login page after confirmation
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
        <p>Confirming your email, please wait...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>Your email has been confirmed! Redirecting to login...</p>
      )}
    </div>
  );
};

export default ConfirmEmail;
