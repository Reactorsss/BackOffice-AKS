import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { p_filter } = await req.json();

    if (!p_filter ) {
      return new Response(
        JSON.stringify({ error: 'p_filter are required in the body' }),
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${process.env.NEXT_ENDPOINT_SERVER}/customer/admin/read/dashboard4/v1`,
      { p_filter },
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
