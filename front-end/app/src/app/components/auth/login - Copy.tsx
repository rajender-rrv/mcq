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
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(await res.json());

    if (res.ok) {
      router.push("/");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};