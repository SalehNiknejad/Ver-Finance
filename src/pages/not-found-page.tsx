import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return <main className="grid min-h-dvh place-items-center p-6 text-center"><div><p className="text-7xl font-black text-gold-400">۴۰۴</p><h1 className="mt-4 text-2xl font-bold">این صفحه پیدا نشد</h1><p className="mt-2 text-slate-500">نشانی واردشده در ورتو فایننس وجود ندارد.</p><Link to="/"><Button className="mt-6">بازگشت به خانه</Button></Link></div></main>
}
