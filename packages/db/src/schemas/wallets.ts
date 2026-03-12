import { integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const currencyEnum = pgEnum('currency_type', [
  'BRL',
  'USD',
  'EUR',
  'GBP',
])

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  balanceInCents: integer('balance_in_cents').default(0).notNull(),
  currency: currencyEnum('currency').default('BRL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
