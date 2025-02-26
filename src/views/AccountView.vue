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
              @blur="validateAccount()"
              v-model="account.markInput"
              placeholder="Введите метки"
              :invalid="
                !!account?.markInput &&
                (account?.markInput?.length === 0 || account?.markInput?.length > 50)
              "
            />
            <Select
              @change="validatePassword(account)"
              @focusout="validateAccount()"
              :options="accountTypes"
              v-model="account.type"
              placeholder="Выберите тип"
            />
            <InputText
              @blur="validateAccount()"
              v-model="account.login"
              placeholder="Введите логин"
              :invalid="
                (account.login?.length === 0 && account?.invalid) || account.login?.length > 100
              "
            />

            <Password
              autocomplete="current-password"
              :invalid="
                (account.password?.length === 0 &&
                  account.type === 'Локальная' &&
                  account?.invalid) ||
                (!!account.password && account.password?.length > 100)
              "
              placeholder="Введите пароль"
              toggleMask
              :disabled="account.type !== 'Локальная'"
              @blur="validateAccount()"
              v-model="account.password"
            />
            <Button icon="pi pi-trash" @click="removeAccount(account)" />
          </form>
        </template>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { ref, nextTick } from 'vue'
// Импортируем тип с ключевым словом 'type'
import { useAccountStore } from '@/stores/account'

const toast = useToast()

interface Account {
  id?: number
  mark?: string | { text: string }[] | string[]
  markInput?: string
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  errorFields?: number[]
  invalid?: boolean
}

const accountStore = useAccountStore()
const accountTypes = ['LDAP', 'Локальная']

const validatePassword = (account: Account) => {
  if (account.type === 'LDAP') account.password = null
}

const fieldNotEmpty = (fieldValue: string | null) => {
  return fieldValue?.length === 0
}

const isMarkOverflow = (mark: string | undefined) => mark && mark?.length > 50
const isLoginOverflow = (login: string) => login?.length > 100
const isPasswordOverflow = (password: string | null) => password && password?.length > 100

const parseMarks = (markInput: string | undefined) => markInput?.split(';') ?? []

const triggerToast = (
  message: string,
  severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined = 'error',
) => {
  toast.add({
    severity: severity,
    summary: 'Предупреждение',
    detail: message,
    life: 3000,
  })
}

const validateAccount = () => {
  let errors: number = 0

  accounts.value.forEach((account: Account) => {
    account.errorFields = []
    let errorsAccount: number = 0
    if (isMarkOverflow(account.markInput)) {
      errorsAccount++
      triggerToast('Метка не может превышать 50 символов')
    }
    if (fieldNotEmpty(account.login)) {
      errorsAccount++
      triggerToast('Логин обязателен для заполнения')
    }
    if (isLoginOverflow(account.login)) {
      errorsAccount++
      triggerToast('Логин не может превышать 100 символов')
    }

    if (account.type === 'Локальная') {
      if (fieldNotEmpty(account.password)) {
        errorsAccount++
        triggerToast('Пароль обязателен для заполнения')
      }
      if (isPasswordOverflow(account.password)) {
        errorsAccount++
        triggerToast('Пароль не может превышать 100 символов')
      }
    }
    console.log(errors)
    if (errorsAccount > 0) {
      account.invalid = true
      account.errorFields = [errorsAccount]
      errors += errorsAccount
    } else {
      account.invalid = false
      account.mark = parseMarks(account.markInput)
    }
  })

  if (errors === 0) save()
}

const save = async () => {
  let i = 0
  accountStore.accounts = accounts.value
    .filter((account) => !account.invalid)
    .map((account) => {
      account.id = i
      i++
      return {
        ...account,
        mark: parseMarks(account.markInput),
      }
    })
}

const accounts = ref<Account[]>(JSON.parse(JSON.stringify(accountStore.accounts)))

const addNewAccount = () => {
  const hasUnsavedAccount = accounts.value.some((account) => account.invalid || account.id === -1)
  if (hasUnsavedAccount) {
    triggerToast('Завершите редактирование текущей записи', 'warn')
    return
  }

  accounts.value.push({ ...newAccount })
  nextTick(() => {})
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
  id: -1,
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
