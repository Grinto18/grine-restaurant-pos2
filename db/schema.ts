import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const posSnapshots = pgTable('pos_snapshots', {
  scope: text('scope').primaryKey(),
  payload: jsonb('payload').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
