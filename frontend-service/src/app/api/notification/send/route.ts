import { NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get('authorization');
        
        const response = await axios.post(`${BACKEND_API_URL}/api/notification/send`, body, {
            headers: { 
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
                // Forward the HttpOnly cookie for auth if it exists
                'Cookie': req.headers.get('cookie') || ''
            },
            validateStatus: () => true
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error('Notification Route Error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
