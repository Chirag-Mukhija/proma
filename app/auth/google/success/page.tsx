'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const user = searchParams.get('user');

        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', decodeURIComponent(user));
            router.push('/dashboard');
        } else {
            // Fallback if no token
            router.push('/auth');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="max-w-md w-full glass-effect">
                <CardHeader>
                    <CardTitle className="text-center">Authenticating...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </CardContent>
            </Card>
        </div>
    );
}
