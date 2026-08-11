import { CheckCircle2, LoaderCircle, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const sendOtp = useAuthStore((state) => state.sendOtp)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => { if (window.location.hash.includes('error')) toast.error('ورود ناموفق بود؛ دوباره تلاش کنید') }, [])
  if (user) return <Navigate to="/" replace />
  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    try { await sendOtp(email); setSent(true) } catch (error) { toast.error(error instanceof Error ? error.message : 'ارسال لینک ورود ناموفق بود') }
  }
  return <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10"><div className="absolute right-[-10%] top-[-20%] size-[35rem] rounded-full bg-gold-400/10 blur-3xl" /><Card className="relative w-full max-w-md p-7 sm:p-9"><div className="mb-8 flex items-center gap-3"><img src="/logo.svg" alt="نشان ورتو فایننس" className="size-12 rounded-2xl" /><div><h1 className="text-xl font-extrabold">ورتو فایننس</h1><p className="text-xs text-slate-500">مدیریت مالی، ساده و روشن</p></div></div>{sent ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto mb-4 size-12 text-emerald-500" /><h2 className="text-xl font-bold">ایمیل‌تان را بررسی کنید</h2><p className="mt-2 text-sm leading-7 text-slate-500">لینک ورود برای <span dir="ltr">{email}</span> ارسال شد. با باز کردن آن وارد حساب می‌شوید.</p><Button className="mt-6" variant="ghost" onClick={() => setSent(false)}>تغییر ایمیل</Button></div> : <><h2 className="text-2xl font-extrabold">ورود به حساب</h2><p className="mt-2 text-sm text-slate-500">بدون رمز عبور، با لینک امن ایمیل وارد شوید.</p><form className="mt-7 space-y-5" onSubmit={(event) => void submit(event)}><FormField label="نشانی ایمیل" htmlFor="email"><div className="relative"><Mail className="absolute right-3 top-3 size-5 text-slate-400" /><Input id="email" type="email" dir="ltr" className="pr-10" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></FormField><Button type="submit" className="w-full" disabled={loading}>{loading && <LoaderCircle className="size-4 animate-spin" />}ارسال لینک ورود</Button></form><p className="mt-6 text-center text-xs leading-6 text-slate-500">با ورود، شرایط استفاده و سیاست حریم خصوصی را می‌پذیرید.</p></>}</Card></main>
}
