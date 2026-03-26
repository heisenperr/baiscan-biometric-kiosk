import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await axios.get(`${BACKEND_API_URL}/api/calibration/live`, {
            validateStatus: () => true
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('Live Calibration Proxy Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
