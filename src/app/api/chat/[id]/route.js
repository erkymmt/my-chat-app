export async function GET(request, { params }) {
  const id = params.id  // URLから数字文字を取得
  return new Response(`Hello, ${id}`)
} 