import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const response = await axios.post(`${BACKEND_API_URL}/api/calibration/tare`, {}, {
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {})
            },
            timeout: 30000,
            validateStatus: () => true
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('Tare Proxy Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
