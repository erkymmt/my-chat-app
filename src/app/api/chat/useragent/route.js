export async function GET(request) {
  const userAgent = request.headers.get('user-agent')
  return new Response(`chat: ${userAgent}`)
} 