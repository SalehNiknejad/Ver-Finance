begin;

create or replace function public.seed_finance_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  month_start date := date_trunc('month', now())::date;
begin
  insert into public.user_settings (user_id, gold_price_per_gram, theme)
  values (new.id, 7500000, 'dark')
  on conflict (user_id) do nothing;

  insert into public.transactions (user_id, type, title, amount, occurred_at, notes)
  values
    (new.id, 'income', 'حقوق ثابت', 42000000, month_start + interval '12 hours', 'داده اولیه قابل ویرایش'),
    (new.id, 'expense', 'هزینه‌های ماهانه', 8000000, month_start + interval '4 days 12 hours', 'داده اولیه قابل ویرایش');

  insert into public.installment_plans (user_id, title, total_amount, installment_amount, total_installments, paid_installments, start_date, due_day)
  values (new.id, 'قسط خودرو', 150000000, 30000000, 5, 0, month_start + 14, 15);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_finance on auth.users;
create trigger on_auth_user_created_seed_finance
  after insert on auth.users
  for each row execute function public.seed_finance_user();

commit;
