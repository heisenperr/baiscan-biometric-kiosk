import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');

        const response = await axios.get(`${BACKEND_API_URL}/api/auth/me`, {
            headers: {
                Authorization: authHeader || ''
            },
            validateStatus: () => true
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('Me Route Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
