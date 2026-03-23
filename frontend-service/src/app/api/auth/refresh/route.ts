import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
        }

        const response = await axios.post(`${BACKEND_API_URL}/api/auth/refresh`, {}, {
            headers: {
                Cookie: `refreshToken=${refreshToken}`
            },
            validateStatus: () => true
        });

        const res = NextResponse.json(response.data, { status: response.status });

        // Forward rotated cookies
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            setCookieHeaders.forEach(cookie => {
                res.headers.append('Set-Cookie', cookie);
            });
        }

        return res;
    } catch (error: any) {
        console.error('Refresh Route Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
