import { getEnv } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = "edge";
export async function GET(request: NextRequest) {
const env = getEnv();
const ai = env.AI;
const response = await ai.run("@cf/meta/llama-3.1-70b-instruct", {
messages: [{ role: "user", content: "Hello, how are you?" }],
});
return NextResponse.json(response);
}