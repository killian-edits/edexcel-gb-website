'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { isSupabaseConfigured } from '@/lib/config/env';
import { createClient } from '@/lib/supabase/client';
import { LogIn, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] max-w-md items-center justify-center px-6 py-12">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription className="text-xs">
            Save and revisit your practice calculations and target forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <Alert variant="destructive" title="Authentication Error">
                {error}
              </Alert>
            )}
            {info && (
              <Alert variant="info" title="Configuration Notice">
                {info}
              </Alert>
            )}

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>

            <div className="text-center text-xs text-[#6B6B6B] pt-2">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#0284C7] font-semibold hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

