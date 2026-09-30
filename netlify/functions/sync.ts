import type { Config } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { posSnapshots } from '../../db/schema.js';

const allowed = new Set(['orders','products','categories','tables','customers','inventory','settings','shifts']);
export default async (request: Request) => {
  try {
    const url = new URL(request.url); const scope = url.searchParams.get('scope') || '';
    if (!allowed.has(scope)) return Response.json({ message: 'Collection invalide' }, { status: 400 });
    if (request.method === 'GET') {
      const [row] = await db.select().from(posSnapshots).where(eq(posSnapshots.scope, scope));
      return Response.json(row?.payload ?? null);
    }
    if (request.method === 'PUT') {
      const payload = await request.json();
      await db.insert(posSnapshots).values({ scope, payload, updatedAt: new Date() }).onConflictDoUpdate({ target: posSnapshots.scope, set: { payload, updatedAt: new Date() } });
      return Response.json({ saved: true });
    }
    return Response.json({ message: 'Méthode non autorisée' }, { status: 405 });
  } catch { return Response.json({ message: 'Synchronisation temporairement indisponible' }, { status: 503 }); }
};
export const config: Config = { path: '/api/sync' };
