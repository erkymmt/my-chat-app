import { getEnv } from "@/lib/env";
import { nanoid } from 'nanoid';

export const runtime = 'edge';

// スレッド一覧取得
export async function GET() {
  try {
    const env = getEnv();
    
    // スレッドと最新メッセージを一緒に取得
    const threads = await env.DB.prepare(`
      SELECT 
        t.id,
        t.created_at,
        m.content as last_message
      FROM threads t
      LEFT JOIN messages m ON t.id = m.thread_id
      WHERE m.id IN (
        SELECT MAX(id)
        FROM messages
        GROUP BY thread_id
      )
      ORDER BY t.created_at DESC
    `).all();

    return Response.json(threads.results);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return Response.json(
      { error: 'Failed to fetch threads', details: error.message },
      { status: 500 }
    );
  }
}

// 新規スレッド作成
export async function POST(request: Request) {
  try {
    const env = getEnv();
    const id = nanoid();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const created_at = new Date().toISOString();
    const title = `新規チャット ${new Date().toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    // スレッドを作成
    await env.DB.prepare(
      'INSERT INTO threads (id, title, created_at, user_agent) VALUES (?, ?, ?, ?)'
    ).bind(id, title, created_at, userAgent).run();

    return Response.json({ id });
  } catch (error) {
    console.error('Thread creation error:', error);
    return Response.json(
      { error: 'Failed to create thread', details: error.message },
      { status: 500 }
    );
  }
} 