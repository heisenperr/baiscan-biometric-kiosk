import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        const response = await axios.post(`${BACKEND_API_URL}/api/auth/logout`, {}, {
            headers: {
                Cookie: refreshToken ? `refreshToken=${refreshToken}` : ''
            },
            validateStatus: () => true
        });

        const res = NextResponse.json({ message: 'Logged out' });

        // Clear cookies
        res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
        res.cookies.set('sb-has-session', '', { maxAge: 0, path: '/' });

        return res;
    } catch (error: any) {
        console.error('Logout Route Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
