import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const response = await axios.get(`${BACKEND_API_URL}/api/calibration/HX711`, {
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {})
            },
            validateStatus: () => true
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('HX711 Calibration Get Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get('authorization');
        const response = await axios.post(`${BACKEND_API_URL}/api/calibration`, body, {
            headers: { 
                'Content-Type': 'application/json',
                ...(authHeader ? { Authorization: authHeader } : {})
            },
            validateStatus: () => true
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('HX711 Calibration Save Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
