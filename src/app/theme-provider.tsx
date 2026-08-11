import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('vertwo-theme') as Theme | null) ?? 'dark')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => resolveTheme(theme))
  const apply = useCallback((value: Theme) => {
    const resolved = resolveTheme(value)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    setResolvedTheme(resolved)
  }, [])
  const setTheme = useCallback((value: Theme) => { setThemeState(value); localStorage.setItem('vertwo-theme', value); apply(value) }, [apply])
  useEffect(() => {
    apply(theme)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (): void => { if (theme === 'system') apply(theme) }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [apply, theme])
  return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>
}
