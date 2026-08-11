import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export interface ThemeContextValue { theme: Theme; setTheme: (theme: Theme) => void; resolvedTheme: 'dark' | 'light' }
export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
