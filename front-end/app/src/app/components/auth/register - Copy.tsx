'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'
import CardBox from '../shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Register = () => {
  const router = useRouter()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
 const res = await fetch("/api/register", {
		method: 'POST',
        headers: {
          //'Content-Type': 'application/json'
		  "Content-Type": "text/plain",

        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }
console.log("its rendering...!!!");
      // Redirect after success
      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

          <form onSubmit={handleSubmit}>
            {/* username */}
            <div className='mb-4'>
              <Label htmlFor='username' className='font-medium'>User Name</Label>
              <Input
                id='username'
                type='text'
                placeholder='Enter your username'
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className='mb-4'>
              <Label htmlFor='email' className='font-medium'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className='mb-4'>
              <Label htmlFor='password' className='font-medium'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='Enter your password'
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p className='text-red-500 text-sm mb-3'>{error}</p>
            )}

            {/* Submit */}
            <Button className='w-full' disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>

          {/* Footer */}
          <div className='flex items-center gap-2 justify-center mt-6 flex-wrap'>
            <p className='text-base font-medium text-link dark:text-darklink'>
              Already have an account?
            </p>
            <Link
              href='/auth/login'
              className='text-sm font-medium text-primary hover:text-primaryemphasis'
            >
              Sign In
            </Link>
          </div>
        </CardBox>
      </div>
    </div>
  )
}