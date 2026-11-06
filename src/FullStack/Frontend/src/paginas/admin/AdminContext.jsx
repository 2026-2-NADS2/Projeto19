
import { createContext, useContext } from 'react'

export const AdminContext = createContext(null)

export function useAdmin() {
  const contexto = useContext(AdminContext)

  if (!contexto) {
    throw new Error(
      'useAdmin deve ser utilizado dentro do AdminContext.Provider'
    )
  }

  return contexto
}
