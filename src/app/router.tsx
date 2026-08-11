import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app-layout'
import { ProtectedRoute } from './protected-route'
import { useFinanceSync } from '@/hooks/use-finance-sync'
import { LoadingState } from '@/components/ui/status'
import { useAuthStore } from '@/store/auth-store'

const DashboardPage = lazy(() => import('@/pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const GoldPage = lazy(() => import('@/pages/gold-page').then((module) => ({ default: module.GoldPage })))
const InstallmentsPage = lazy(() => import('@/pages/installments-page').then((module) => ({ default: module.InstallmentsPage })))
const LoginPage = lazy(() => import('@/pages/login-page').then((module) => ({ default: module.LoginPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })))
const TransactionsPage = lazy(() => import('@/pages/transactions-page').then((module) => ({ default: module.TransactionsPage })))

function Bootstrap({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)
  useEffect(() => { let cleanup: (() => void) | undefined; void initialize().then((unsubscribe) => { cleanup = unsubscribe }); return () => cleanup?.() }, [initialize])
  return children
}

function SyncedLayout() {
  useFinanceSync()
  return <AppLayout />
}

export function AppRouter() {
  return <BrowserRouter><Bootstrap><Suspense fallback={<main className="grid min-h-48 place-items-center"><LoadingState /></main>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<SyncedLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="transactions" element={<TransactionsPage />} />
      <Route path="installments" element={<InstallmentsPage />} />
      <Route path="gold" element={<GoldPage />} />
    </Route></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense></Bootstrap></BrowserRouter>
}
