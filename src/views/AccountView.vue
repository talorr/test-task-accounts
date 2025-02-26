<template>
  <div class="accounts">
    <div class="accounts__header">
      <h2>Учётные записи</h2>
      <Button icon="pi pi-plus" @click.stop="addNewAccount" />
    </div>
    <div class="accounts__mark-description">
      <i class="pi pi-question" style="font-size: 1.1rem"></i>
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </div>
    <div class="accounts__table">
      <div class="accounts__table-header accounts__table-row">
        <div>Метки</div>
        <div>Тип записи</div>
        <div>Логин*</div>
        <div>Пароль*</div>
      </div>
      <div class="accounts__table-body">
        <template v-for="account in accounts" :key="account.id">
          <form
            class="accounts__table-row"
            :style="{
              background: account.errorFields?.length ? '#2b2b2b' : '',
              borderRadius: account.errorFields?.length ? '5px' : '',
            }"
          >
            <InputText
              @focusout="validateAccount(account)"
              v-model="account.markInput"
              placeholder="Введите метки"
            />
            <Select
              @change="validatePassword(account)"
              @focusout="validateAccount(account)"
              :options="accountTypes"
              v-model="account.type"
              placeholder="Выберите тип"
            />
            <InputText
              @focusout="validateAccount(account)"
              v-model="account.login"
              placeholder="Введите логин"
            />
            <Password
              autocomplete="current-password"
              :invalid="account.password?.length === 0 && account.type === 'Локальная'"
              placeholder="Введите пароль"
              toggleMask
              :disabled="account.type !== 'Локальная'"
              @focusout="validateAccount(account)"
              v-model="account.password"
            />
            <Button icon="pi pi-trash" @click.stop="removeAccount(account)" />

            <div v-if="account.errorFields?.length" class="accounts__table-row-error">
              <span v-for="(error, index) in account.errorFields" :key="index">{{ error }}</span>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account'

interface Account {
  id?: number
  mark?: string | { text: string }[]
  markInput?: string
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  errorFields?: string[]
  validated?: boolean
}

const accountStore = useAccountStore()
const accountTypes = ['LDAP', 'Локальная']

const validatePassword = (account: Account) => {
  if (account.type === 'LDAP') account.password = null
}

const isMarkOverflow = (mark: string | undefined) => mark && mark.length > 50
const isLoginValid = (login: string) => login.length === 0
const isLoginOverflow = (login: string) => login.length > 100
const isPasswordValid = (password: string | null) => password && password.length === 0
const isPasswordOverflow = (password: string | null) => password && password.length > 100

const parseMarks = (markInput: string | undefined) =>
  markInput
    ?.split(';')
    .map((mark) => ({ text: mark.trim() }))
    .filter((mark) => mark.text) ?? []

const validateAccount = (account: Account) => {
  const errors: string[] = []
  account.errorFields = []

  if (isMarkOverflow(account.markInput)) {
    errors.push('Метка не может превышать 50 символов')
  }

  if (isLoginValid(account.login)) {
    errors.push('Логин обязателен для заполнения')
  }
  if (isLoginOverflow(account.login)) {
    errors.push('Логин не может превышать 100 символов')
  }

  if (account.type === 'Локальная') {
    if (isPasswordValid(account.password)) {
      errors.push('Пароль обязателен для заполнения')
    }
    if (isPasswordOverflow(account.password)) {
      errors.push('Пароль не может превышать 100 символов')
    }
  }

  if (errors.length > 0) {
    account.validated = false
    account.errorFields = errors
  } else {
    account.validated = true
    account.mark = parseMarks(account.markInput) // ✅ Преобразуем метки в массив
    save()
  }
}

const save = async () => {
  accountStore.accounts = accounts.value.map((account) => ({
    ...account,
    mark: parseMarks(account.markInput), // ✅ Сохраняем преобразованные метки
  }))
}

const accounts = ref<Account[]>(JSON.parse(JSON.stringify(accountStore.accounts)))

const addNewAccount = () => {
  const lastAccount = accounts.value?.[accounts.value.length - 1]
  newAccount.id = lastAccount?.id ? lastAccount.id + 1 : 0
  accounts.value.push({ ...newAccount })
}

const removeAccount = (account: Account) => {
  accounts.value.splice(accounts.value.indexOf(account), 1)
  accountStore.removeAccount(account)
}

const newAccount: Account = {
  mark: '',
  type: 'Локальная',
  login: '',
  password: '',
  errorFields: [],
}
</script>

<style lang="scss" scoped>
$background-dark: rgb(43, 43, 43);
$error-color: #ff4f4f;
$input-padding: 12px;

.accounts {
  max-width: 1100px;
}
.accounts__header {
  display: flex;
  padding-top: 50px;
  align-items: center;
  gap: 12px;
}

.accounts__mark-description {
  i {
    border: 1px solid rgba(235, 235, 235, 0.64);
    padding: 8px;
    border-radius: 6px;
    background: #505050;
  }
  margin: 12px 0;
  background: $background-dark;
  display: flex;
  border-radius: 6px;
  padding: 10px;
  align-items: center;
  gap: 12px;
}
.accounts__table {
  &-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: $input-padding;
    border-bottom: 1px solid #e8e8e8;
  }
  &-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 40px;
    align-items: center;
    gap: 12px;
    padding: $input-padding;
    position: relative;
  }
  &-row-error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: $input-padding;
    span {
      color: $error-color;
    }
  }
}
:deep(.p-button) {
  min-height: 40px;
}
:deep(.p-inputtext) {
  width: 100%;
}
</style>
