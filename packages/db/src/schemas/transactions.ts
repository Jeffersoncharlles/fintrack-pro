import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'outcome',
])

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  description: text('description').notNull(),
  amountInCents: integer('amount_in_cents').notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
