import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_ENDPOINT_SERVER}/customer/read/user/admins`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth': `${process.env.NEXT_HEADERS_AUTHENTICATION}`,
        },
      }
    );

    return NextResponse.json({ data: response.data });
  } catch (error: any) {
    const errorMessage = error.response?.data || { error: error.message };
    const errorStatus = error.response?.status || 500;
    return new Response(JSON.stringify(errorMessage), { status: errorStatus });
  }
}
