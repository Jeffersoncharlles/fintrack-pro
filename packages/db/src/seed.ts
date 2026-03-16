import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { db, transactions, users, wallets } from './index'

const RANDOM_USER_TOTAL = 50
const RANDOM_TRANSACTION_TOTAL = 200
const RANDOM_TRANSACTION_PAIRS = RANDOM_TRANSACTION_TOTAL / 2
const USERS_WITHOUT_TRANSACTIONS = 12

const SEED_1_EMAIL = 'user.seed@fintrack.dev'
const SEED_2_EMAIL = 'user.seed2@fintrack.dev'
const SEED_3_EMAIL = 'user.seed3@fintrack.dev'

const SEED_YEAR_TO_DATE_TRANSACTIONS = 160
const SEED_CURRENT_MONTH_TRANSACTIONS = 20

function pickDistinctUsers(userIds: string[]) {
  const sender = faker.helpers.arrayElement(userIds)
  let receiver = faker.helpers.arrayElement(userIds)

  while (receiver === sender) {
    receiver = faker.helpers.arrayElement(userIds)
  }

  return { sender, receiver }
}

function randomDateBetween(start: Date, end: Date) {
  return new Date(
    faker.datatype.number({
      min: start.getTime(),
      max: end.getTime(),
    }),
  )
}

function buildSeedTransactions({
  userId,
  total,
  monthCount,
  now,
  favorIncome,
}: {
  userId: string
  total: number
  monthCount: number
  now: Date
  favorIncome: boolean
}): Array<typeof transactions.$inferInsert> {
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfPreviousMonth = new Date(startOfMonth.getTime() - 1)

  const yearBeforeCurrentMonth = Math.max(total - monthCount, 0)

  const rows: Array<typeof transactions.$inferInsert> = []

  const buildAmount = (isIncome: boolean) => {
    if (favorIncome) {
      return isIncome
        ? faker.datatype.number({ min: 4_000, max: 16_000 })
        : faker.datatype.number({ min: 1_500, max: 9_000 })
    }

    return isIncome
      ? faker.datatype.number({ min: 1_500, max: 8_000 })
      : faker.datatype.number({ min: 4_000, max: 18_000 })
  }

  for (let i = 0; i < yearBeforeCurrentMonth; i++) {
    const isIncome = i % 2 === 0
    rows.push({
      userId,
      description: `Movimento anual #${String(i + 1).padStart(3, '0')}`,
      amountInCents: buildAmount(isIncome),
      type: isIncome ? 'income' : 'outcome',
      category: 'transfer',
      createdAt: randomDateBetween(startOfYear, endOfPreviousMonth),
    })
  }

  for (let i = 0; i < monthCount; i++) {
    const isIncome = i % 2 === 0
    rows.push({
      userId,
      description: `Movimento do mes #${String(i + 1).padStart(3, '0')}`,
      amountInCents: buildAmount(isIncome),
      type: isIncome ? 'income' : 'outcome',
      category: 'transfer',
      createdAt: randomDateBetween(startOfMonth, now),
    })
  }

  return rows
}

async function main() {
  faker.seed(20260312)
  const now = new Date()

  await db.delete(transactions)
  await db.delete(wallets)
  await db.delete(users)
  const passwordHash = await bcrypt.hash('012345', 10)

  const januaryAccountCreationDate = new Date(
    now.getFullYear(),
    0,
    8,
    10,
    30,
    0,
  )

  const seedUsers = await db
    .insert(users)
    .values([
      {
        name: 'User Seed',
        email: SEED_1_EMAIL,
        passwordHash: passwordHash,
      },
      {
        name: 'User Seed 2',
        email: SEED_2_EMAIL,
        passwordHash: passwordHash,
      },
      {
        name: 'User Seed 3',
        email: SEED_3_EMAIL,
        passwordHash: passwordHash,
        createdAt: januaryAccountCreationDate,
        updatedAt: januaryAccountCreationDate,
      },
    ])
    .returning({
      id: users.id,
      email: users.email,
    })

  const seed1 = seedUsers.find((user) => user.email === SEED_1_EMAIL)
  const seed2 = seedUsers.find((user) => user.email === SEED_2_EMAIL)
  const seed3 = seedUsers.find((user) => user.email === SEED_3_EMAIL)

  if (!seed1 || !seed2 || !seed3) {
    throw new Error('Nao foi possivel criar os usuarios seed obrigatorios.')
  }

  const createdUsers = await db
    .insert(users)
    .values(
      Array.from({ length: RANDOM_USER_TOTAL }).map((_, index) => ({
        name: faker.name.fullName(),
        email: `user${index + 1}.${faker.datatype.number({ min: 1000, max: 9999 })}@fintrack.dev`,
        passwordHash: passwordHash,
      })),
    )
    .returning({ id: users.id })

  const randomUserIds = createdUsers.map((user) => user.id)
  const allUserIds = [seed1.id, seed2.id, seed3.id, ...randomUserIds]

  const usersWithoutTransactions = faker.helpers.arrayElements(
    randomUserIds,
    USERS_WITHOUT_TRANSACTIONS,
  )
  const usersWithTransactions = randomUserIds.filter(
    (id) => !usersWithoutTransactions.includes(id),
  )

  const transactionRows: Array<typeof transactions.$inferInsert> = []

  for (let i = 0; i < RANDOM_TRANSACTION_PAIRS; i++) {
    const { sender, receiver } = pickDistinctUsers(usersWithTransactions)
    const amountInCents = faker.datatype.number({ min: 500, max: 200_000 })
    const transferCode = faker.random.alphaNumeric(8).toUpperCase()
    const transferDate = faker.date.recent(120)

    transactionRows.push(
      {
        userId: sender,
        description: `Transferencia enviada #${transferCode}`,
        amountInCents,
        type: 'outcome',
        category: 'transfer',
        createdAt: transferDate,
      },
      {
        userId: receiver,
        description: `Transferencia recebida #${transferCode}`,
        amountInCents,
        type: 'income',
        category: 'transfer',
        createdAt: transferDate,
      },
    )
  }

  const seed1Transactions = buildSeedTransactions({
    userId: seed1.id,
    total: SEED_YEAR_TO_DATE_TRANSACTIONS,
    monthCount: SEED_CURRENT_MONTH_TRANSACTIONS,
    now,
    favorIncome: true,
  })

  const seed2Transactions = buildSeedTransactions({
    userId: seed2.id,
    total: SEED_YEAR_TO_DATE_TRANSACTIONS,
    monthCount: SEED_CURRENT_MONTH_TRANSACTIONS,
    now,
    favorIncome: false,
  })

  transactionRows.push(...seed1Transactions, ...seed2Transactions)

  await db.insert(transactions).values(transactionRows)

  const balances = new Map<string, number>()

  for (const userId of allUserIds) {
    balances.set(userId, faker.datatype.number({ min: 10_000, max: 400_000 }))
  }

  for (const tx of transactionRows) {
    const current = balances.get(tx.userId) ?? 0
    balances.set(
      tx.userId,
      tx.type === 'income'
        ? current + tx.amountInCents
        : current - tx.amountInCents,
    )
  }

  for (const userId of usersWithoutTransactions) {
    balances.set(userId, faker.datatype.number({ min: 50_000, max: 800_000 }))
  }

  balances.set(seed1.id, Math.max(150_000, balances.get(seed1.id) ?? 0))
  balances.set(seed2.id, 0)
  balances.set(seed3.id, 0)

  const walletRows: Array<typeof wallets.$inferInsert> = allUserIds.map(
    (userId) => ({
      userId,
      pixKey: userId === seed3.id ? null : faker.datatype.uuid(),
      balanceInCents: Math.max(0, balances.get(userId) ?? 0),
      currency: 'BRL',
    }),
  )

  await db.insert(wallets).values(walletRows)

  console.log('Seed finalizado com sucesso:')
  console.log(`- Usuarios totais: ${allUserIds.length}`)
  console.log(`- Transacoes totais: ${transactionRows.length}`)
  console.log(
    `- ${SEED_1_EMAIL}: ${seed1Transactions.length} transacoes (20 no mes atual), saldo positivo`,
  )
  console.log(
    `- ${SEED_2_EMAIL}: ${seed2Transactions.length} transacoes (20 no mes atual), saldo zerado`,
  )
  console.log(`- ${SEED_3_EMAIL}: sem transacoes e sem pixKey`)
  console.log(`- Usuarios sem transacoes: ${usersWithoutTransactions.length}`)
  console.log(`- Wallets: ${walletRows.length}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
