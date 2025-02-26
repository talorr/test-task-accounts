import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

interface Account {
  id?: number
  mark?: string | { text: string }[]
  markInput?: string
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  errorFields?: string[]
}

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: useLocalStorage<Account[]>('accounts', [
      {
        id: 0,
        mark: 'Account 1',
        type: 'LDAP',
        login: 'user1',
        password: '',
        errorFields: [],
      },
      {
        id: 1,
        mark: 'Account 2',
        type: 'Локальная',
        login: 'user2',
        password: 'password1',
        errorFields: [],
      },
    ]),
  }),
  getters: {
    getAccounts: (state) => state.accounts,
  },
  actions: {
    addAccount(account: Account) {
      this.accounts.push(account)
    },
    removeAccount(account: Account) {
      this.accounts.splice(this.accounts.indexOf(account), 1)
    },
    updateAccount(account: Account) {
      const index = this.accounts.indexOf(account)
      if (index > -1) {
        this.accounts.splice(index, 1, account)
      }
    },
  },
})
