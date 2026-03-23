import { NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/api';

export async function GET(request: Request) {
    const targetUrl = `${BACKEND_API_URL}/api/auth/me`;

    const headers = new Headers(request.headers);
    headers.delete('host');

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: headers,
            cache: 'no-store',
        });

        const data = await response.blob();
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Me Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error (Proxy)' }, { status: 500 });
    }
}
