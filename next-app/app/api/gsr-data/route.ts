import { NextResponse } from 'next/server';

const PI_API_URL = process.env.PI_API_URL;

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!PI_API_URL) {
        return NextResponse.json(
            { error: 'PI_API_URL is not configured in the env' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(PI_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from Pi: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        const errorMsg = (error instanceof Error) ? error.message : 'An unknown error occured';
        console.error("BFF Error:", errorMsg);

        return NextResponse.json(
            { error: 'Sensor is offline or unreachable' },
            { status: 502 }
        );
    }
}


