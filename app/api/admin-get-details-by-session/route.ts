import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const p_session_token = searchParams.get('p_session_token');

    if (!p_session_token) {
      return new Response(
        JSON.stringify({ error: 'p_session_token is required as a query parameter' }),
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${process.env.NEXT_ENDPOINT_SERVER}/user/read/admins/by/session`,
      {
        params: { p_session_token },
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
