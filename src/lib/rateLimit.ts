import { NextResponse } from "next/server";

const requests = new Map<string, { count: number; firstRequest: number }>();

export const rateLimit = (limit: number, interval: number) => {
  return async (req: Request) => {
    // Get IP address from headers
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 0, firstRequest: Date.now() });
    }
    
    const data = requests.get(ip)!;
    
    if (Date.now() - data.firstRequest > interval) {
      // Reset the count every interval
      data.count = 0;
      data.firstRequest = Date.now();
    }
    
    data.count += 1;
    
    if (data.count > limit) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
    
    requests.set(ip, data);
    return null; // Return null if rate limit is not exceeded
  };
};
