import { LoaderCircle, Mail, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const signUpWithPassword = useAuthStore((state) => state.signUpWithPassword);
  const signInWithPassword = useAuthStore((state) => state.signInWithPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("error"))
      toast.error("ورود ناموفق بود؛ دوباره تلاش کنید");
  }, []);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      if (isSignUp) {
        await signUpWithPassword(email, password);
        toast.success("ثبت نام موفق! اکنون وارد شوید");
        setIsSignUp(false);
        setPassword("");
      } else {
        await signInWithPassword(email, password);
        toast.success("خوش آمدید!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isSignUp
            ? "ثبت نام ناموفق"
            : "ورود ناموفق",
      );
    }
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="absolute right-[-10%] top-[-20%] size-140 rounded-full bg-gold-400/10 blur-3xl" />
      <Card className="relative w-full max-w-md p-7 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="نشان ورتو فایننس"
            className="size-12 rounded-2xl"
          />
          <div>
            <h1 className="text-xl font-extrabold">ورتو فایننس</h1>
            <p className="text-xs text-slate-500">مدیریت مالی، ساده و روشن</p>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold">
          {isSignUp ? "ثبت نام" : "ورود به حساب"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isSignUp ? "حساب جدید ایجاد کنید" : "به حساب خود وارد شوید"}
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-3">
          <Button
            variant={!isSignUp ? "primary" : "ghost"}
            className="flex-1"
            onClick={() => {
              setIsSignUp(false);
              setPassword("");
            }}
          >
            ورود
          </Button>
          <Button
            variant={isSignUp ? "primary" : "ghost"}
            className="flex-1"
            onClick={() => {
              setIsSignUp(true);
              setPassword("");
            }}
          >
            ثبت نام
          </Button>
        </div>

        <form
          className="mt-7 space-y-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <FormField label="نشانی ایمیل" htmlFor="email">
            <div className="relative">
              <Mail className="absolute right-3 top-3 size-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="pr-10"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </FormField>

          <FormField label="رمز عبور" htmlFor="password">
            <div className="relative">
              <Lock className="absolute right-3 top-3 size-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="pr-10"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>
          </FormField>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <LoaderCircle className="size-4 animate-spin" />}
            {isSignUp ? "ثبت نام" : "ورود"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-6 text-slate-500">
          با ورود، شرایط استفاده و سیاست حریم خصوصی را می‌پذیرید.
        </p>
      </Card>
    </main>
  );
}
