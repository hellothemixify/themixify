import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Serves supabase/schema.sql as plain text, for local setup only.
 *
 * It exists so the schema can be loaded into the Supabase SQL editor exactly as
 * written, without a copy-paste step that could truncate or re-encode it. The
 * route refuses to run outside development, so the file is never exposed by a
 * deployed build.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }

  try {
    const file = path.join(process.cwd(), 'supabase', 'schema.sql')
    const sql = await readFile(file, 'utf8')

    return new Response(sql, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('Could not read supabase/schema.sql', { status: 500 })
  }
}
