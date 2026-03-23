import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const response = await axios.post(`${BACKEND_API_URL}/api/auth/login`, body, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });

        const res = NextResponse.json(response.data, { status: response.status });

        // Forward Set-Cookie headers
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            setCookieHeaders.forEach(cookie => {
                res.headers.append('Set-Cookie', cookie);
            });
        }

        return res;
    } catch (error: any) {
        console.error('Login Route Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
