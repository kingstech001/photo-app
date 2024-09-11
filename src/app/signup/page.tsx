// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Store the user's name in the metadata
      },
    });

    if (!error) {
      router.push('/login'); // Redirect to login page after successful signup
    } else {
      console.error(error.message);
      setError(error.message);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen text-[12px] md:text-[18px]'>
      <div className='w-[400px] p-6 border-y-2 border-y-orange-500 rounded-lg shadow'>
        <h2 className='font-bold text-5 mb-5'>Sign Up</h2>
        <form onSubmit={handleSignup} className=' space-y-4  mb-2'>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className='block border w-full p-2 text-[12px] rounded-md focus:outline-none border-none bg-gray-200'
          />
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
          <button type="submit" className='bg-orange-500 text-white w-full py-1 rounded-md'>Sign Up</button>
          {error && <p>{error}</p>}
        </form>
      <div className='flex justify-between'>
        <p>Already have an account?</p>
        <Link href='/login' className='hover:text-orange-500 '>Log In</Link>
      </div>
      </div>
    </div>
  );
};

export default Signup;
