'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push('/photos'); // Redirect to photos page after login
    } else {
      console.error(error.message);
      setError('Invalid login credentials');
    }
  };

  return (
    <div className='flex justify-center items-center h-screen text-[12px] md:text-[18px]'>
      <div className='w-[400px] p-6 border-y-2 border-y-orange-500 rounded-lg shadow'>
        <h2 className='font-bold text-5 mb-5'>Log In</h2>
        <form onSubmit={handleLogin} className='space-y-4 mb-2'>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className='block border w-full p-2 text-[12px] rounded-md focus:outline-none border-none bg-gray-200'
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className='block border w-full p-2 text-[12px] rounded-md focus:outline-none border-none bg-gray-200'
          />
          <button type="submit" className='bg-orange-500 text-white w-full py-1 rounded-md'>Log In</button>
        </form>
        <div className='flex items-center justify-between'>
          <p>Don&apos;t have an account?</p>
          <Link href='/signup' className='hover:text-orange-500'>Sign Up</Link>
        </div>
        {error && <p className='text-red-600 text-[12px]'>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
