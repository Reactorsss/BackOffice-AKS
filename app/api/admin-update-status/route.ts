import axios from 'axios';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  try {
    const { p_username, p_ip_address } = await req.json();

    if (!p_username ||  !p_ip_address) {
      return new Response(
        JSON.stringify({ error: 'p_username, p_passwordhash, and p_ip_address are required in the body' }),
        { status: 400 }
      );
    }

    const response = await axios.patch(
      `${process.env.NEXT_ENDPOINT_SERVER}/user/admin/update/status`,
      { p_username, p_ip_address },
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
