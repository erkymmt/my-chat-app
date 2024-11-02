import { getEnv } from "@/lib/env";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const env = getEnv();
    const tablesResult = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all<{ name: string }>();
    const tables = tablesResult.results.map(row => row.name);

    const tablesInfo: Record<string, any[]> = {};
    for (const table of tables) {
      const columnsResult = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>();
      tablesInfo[table] = columnsResult.results.map(column => ({
        name: column.name,
        type: column.type,
      }));
    }

    return new Response(JSON.stringify(tablesInfo, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error); // エラーログを追加
    return new Response(JSON.stringify({ error: 'Failed to fetch table information' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}