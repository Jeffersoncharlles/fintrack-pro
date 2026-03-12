export type TransactionType = 'income' | 'outcome'

export interface Transaction {
  id: string
  description: string
  amountInCents: number
  type: TransactionType
  category: string
  createdAt: string
}

export interface CreateTransactionDTO {
  description: string
  amountInCents: number
  type: TransactionType
  category: string
}

export interface CreateUserFullDTO {
  name: string
  email: string
  password: string
  createdAt: string
  updatedAt: string
}
