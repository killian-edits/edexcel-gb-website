'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { isSupabaseConfigured } from '@/lib/config/env';
import { createClient } from '@/lib/supabase/client';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setInfo('Authentication backend (Supabase) is not yet configured with production keys. Database features run in local demonstration mode.');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError('Unable to initialize client connection.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] max-w-md items-center justify-center px-6 py-12">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">Create a student account</CardTitle>
          <CardDescription className="text-xs">
            Track exam progression and store practice mark calculations securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="success" title="Account created">
              Please check your email for the confirmation link to complete registration.
            </Alert>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <Alert variant="destructive" title="Registration Error">
                  {error}
                </Alert>
              )}
              {info && (
                <Alert variant="info" title="Configuration Notice">
                  {info}
                </Alert>
              )}

              <Input
                label="Full name or pseudonym"
                type="text"
                placeholder="Candidate 1024"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <Input
                label="Email address"
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" className="w-full" isLoading={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Register Account
              </Button>

              <div className="text-center text-xs text-[#6B6B6B] pt-2">
                Already registered?{' '}
                <Link href="/login" className="text-[#0284C7] font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

