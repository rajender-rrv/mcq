"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import CardBox from "../shared/CardBox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Register = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= HANDLE CHANGE =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // ✅ SUCCESS MESSAGE
      setSuccess("Registration successful!");

      // ✅ CLEAR FORM
      setForm({
        username: "",
        email: "",
        password: "",
      });

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="h-screen w-full flex justify-center items-center bg-lightprimary">
      <div className="md:min-w-[450px] min-w-max">
        <CardBox>
          <div className="flex justify-center mb-4">
            <FullLogo />
          </div>

          <p className="text-sm text-charcoal text-center mb-6">
            Your Social Campaigns
          </p>

          {/* ✅ ERROR ALERT */}
          {error && (
            <div
              className="flex flex-col gap-2 p-4 text-sm bg-lighterror dark:bg-lighterror text-error border border-error rounded-md mb-4"
              role="alert"
            >
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ✅ SUCCESS ALERT */}
          {success && (
            <div
              className="flex flex-col gap-2 p-4 text-sm bg-lightsuccess dark:bg-lightsuccess text-success border border-success rounded-md mb-4"
              role="alert"
            >
              <span className="font-medium">
                {success}{" "}
                <Link
                  href="/auth/login"
                  className="underline font-semibold ml-1"
                >
                  Click here to Sign In
                </Link>
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <Label htmlFor="username">User Name</Label>
              <Input
                id="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              className="w-full"
              disabled={loading || !!success}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex justify-center mt-6 gap-2">
            <p>Already have an account?</p>
            <Link href="/auth/login">Sign In</Link>
          </div>
        </CardBox>
      </div>
    </div>
  );
};