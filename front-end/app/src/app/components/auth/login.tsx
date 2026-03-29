"use client";


import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'
import CardBox from '../shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from "react";
import { useRouter } from "next/navigation";

export const Login = () => {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("1234");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/matdash-nextjs/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(await res.json());

    if (res.ok) {
	//localStorage.setItem("user", JSON.stringify(user));
      router.push("/");
    } else {
      alert("Login failed");
    }
  };

  return (
  <div className='h-screen w-full flex justify-center items-center bg-lightprimary'>
        <div className='md:min-w-[450px] min-w-max'>
          <CardBox>
            <div className='flex justify-center mb-4'>
              <FullLogo />
            </div>
            <p className='text-sm text-charcoal text-center mb-6'>
              Your Social Campaigns
            </p>
            <div>
              <div className='mb-2 block'>
                <Label htmlFor='username1' className='font-medium'>
                  Username
                </Label>
              </div>
              <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
            </div>
            <div>
              <div className='mb-2 block'>
                <Label htmlFor='password1' className='font-medium'>
                  Password
                </Label>
              </div>
             <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
      />
            </div>
            <div className='flex flex-wrap gap-6 items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Checkbox id='remember' checked />
                <Label
                  className='text-link font-normal text-sm'
                  htmlFor='remember'>
                  Remember this device
                </Label>
              </div>
              <Link
                href='#'
                className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                Forgot Password ?
              </Link>
            </div>
                  <Button className='w-full' onClick={handleLogin}>Sign In</Button>
				
            <div className='flex items center gap-2 justify-center mt-6 flex-wrap'>
              <p className='text-base font-medium text-link dark:text-darklink'>
                New to Matdash?
              </p>
              <Link
                href='/auth/register'
                className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                Create an account
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
  );
};