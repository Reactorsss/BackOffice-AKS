import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { p_province, p_date_from, p_date_to } = await req.json();

    if (!p_province || !p_date_from || !p_date_to ) {
      return new Response(
        JSON.stringify({ error: 'p_province, p_date_from, and p_date_to are required in the body' }),
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${process.env.NEXT_ENDPOINT_SERVER}/customer/admin/read/dashboard2/v2`,
      { p_province, p_date_from, p_date_to },
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
