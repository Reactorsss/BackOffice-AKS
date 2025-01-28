import axios from 'axios';
import { NextResponse } from 'next/server';

// Define the list of whitelisted IPs or domains
const WHITELISTED_IPS = ['206.201.3.220', '::1']; // Replace with actual IP addresses
const WHITELISTED_DOMAINS = ['yourdomain.com']; // Optional, for domains

export async function GET(req: Request) {
  try {
    // Extract the client's IP address
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    
    // Check if the IP is in the whitelist
    if (clientIp && !WHITELISTED_IPS.includes(clientIp)) {
        
      return new Response(
        JSON.stringify({ error: 'Your IP is not whitelisted' }),
        { status: 403 }
      );
    }

    // Alternatively, check for a custom header (e.g., API key or domain)
    const origin = req.headers.get('origin');
    if (origin && !WHITELISTED_DOMAINS.some(domain => origin.includes(domain))) {
      return new Response(
        JSON.stringify({ error: 'Your domain is not whitelisted' }),
        { status: 403 }
      );
    }

    // Make the API call if the request passes the whitelist checks
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
