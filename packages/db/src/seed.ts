import { faker } from '@faker-js/faker'
import { db, transactions, users, wallets } from './index'

type TransferTransaction = {
  userId: string
  amountInCents: number
  type: 'income' | 'outcome'
}

const USER_TOTAL = 50
const TRANSACTION_TOTAL = 200
const TRANSACTION_PAIRS = TRANSACTION_TOTAL / 2
const USERS_WITHOUT_TRANSACTIONS = 12

function pickDistinctUsers(userIds: string[]) {
  const sender = faker.helpers.arrayElement(userIds)
  let receiver = faker.helpers.arrayElement(userIds)

  while (receiver === sender) {
    receiver = faker.helpers.arrayElement(userIds)
  }

  return { sender, receiver }
}

const passwordHash = '123124'

async function main() {
  faker.seed(20260312)

  await db.delete(transactions)
  await db.delete(wallets)
  await db.delete(users)

  const createdUsers = await db
    .insert(users)
    .values(
      Array.from({ length: USER_TOTAL }).map((_, index) => ({
        name: faker.name.fullName(),
        email: `user${index + 1}.${faker.datatype.number({ min: 1000, max: 9999 })}@fintrack.dev`,
        passwordHash: passwordHash,
      })),
    )
    .returning({ id: users.id })

  const allUserIds = createdUsers.map((user) => user.id)

  const usersWithoutTransactions = faker.helpers.arrayElements(
    allUserIds,
    USERS_WITHOUT_TRANSACTIONS,
  )
  const usersWithTransactions = allUserIds.filter(
    (id) => !usersWithoutTransactions.includes(id),
  )

  const generatedTransactions: TransferTransaction[] = []

  for (let i = 0; i < TRANSACTION_PAIRS; i++) {
    const { sender, receiver } = pickDistinctUsers(usersWithTransactions)
    const amountInCents = faker.datatype.number({ min: 500, max: 200_000 })
    const transferCode = faker.random.alphaNumeric(8).toUpperCase()
    const transferDate = faker.date.recent(120)

    generatedTransactions.push({
      userId: sender,
      amountInCents,
      type: 'outcome',
    })

    generatedTransactions.push({
      userId: receiver,
      amountInCents,
      type: 'income',
    })

    await db.insert(transactions).values([
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
    ])
  }

  const balances = new Map<string, number>()

  for (const userId of allUserIds) {
    balances.set(userId, faker.datatype.number({ min: 10_000, max: 400_000 }))
  }

  for (const tx of generatedTransactions) {
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

  const walletRows: Array<typeof wallets.$inferInsert> = allUserIds.map(
    (userId) => ({
      userId,
      balanceInCents: Math.max(0, balances.get(userId) ?? 0),
      currency: 'BRL',
    }),
  )

  await db.insert(wallets).values(walletRows)

  console.log('Seed finalizado com sucesso:')
  console.log(`- Usuarios: ${USER_TOTAL}`)
  console.log(`- Transacoes: ${TRANSACTION_TOTAL}`)
  console.log(`- Usuarios sem transacoes: ${usersWithoutTransactions.length}`)
  console.log('- Wallets: 50')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
