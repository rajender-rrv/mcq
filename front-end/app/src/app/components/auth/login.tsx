"use client";

import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo';
import CardBox from '../shared/CardBox';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from "react";
import { useRouter } from "next/navigation";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch("/matdash-nextjs/api/login", {
        method: "POST",
        headers: {
          //"Content-Type": "application/json",
		 "Content-Type": "text/plain",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

		console.log(data);

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        router.push("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
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

          {/* EMAIL */}
          <div className='mb-4'>
            <Label className='font-medium'>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* PASSWORD */}
          <div className='mb-4'>
            <Label className='font-medium'>Password.</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className='flex flex-wrap gap-6 items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <Checkbox id='remember' />
              <Label className='text-sm'>Remember this device</Label>
            </div>

            <Link href='#' className='text-sm text-primary'>
              Forgot Password?
            </Link>
          </div>

          <Button
            className='w-full'
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className='flex gap-2 justify-center mt-6 flex-wrap'>
            <p className='text-base'>New to Matdash?</p>
            <Link href='/auth/register' className='text-primary'>
              Create an account
            </Link>
          </div>
        </CardBox>
      </div>
    </div>
  );
};