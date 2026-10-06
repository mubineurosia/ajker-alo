-- Run the full file in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_ajker_alo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  slug text not null unique check (char_length(slug) between 1 and 180),
  category text not null,
  excerpt text not null default '',
  content text not null,
  cover_image text,
  image_alt text,
  author text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_ajker_alo_admin() to anon, authenticated;

create index if not exists posts_published_order on public.posts (published_at desc) where is_published = true;
alter table public.posts enable row level security;
alter table public.admins enable row level security;

drop policy if exists "published or admin can read posts" on public.posts;
create policy "published or admin can read posts" on public.posts for select
  using (is_published = true or public.is_ajker_alo_admin());
drop policy if exists "admin can insert posts" on public.posts;
create policy "admin can insert posts" on public.posts for insert
  with check (public.is_ajker_alo_admin());
drop policy if exists "admin can update posts" on public.posts;
create policy "admin can update posts" on public.posts for update
  using (public.is_ajker_alo_admin()) with check (public.is_ajker_alo_admin());
drop policy if exists "admin can delete posts" on public.posts;
create policy "admin can delete posts" on public.posts for delete
  using (public.is_ajker_alo_admin());
drop policy if exists "admin can read own admin row" on public.admins;
create policy "admin can read own admin row" on public.admins for select
  using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "public can view news photos" on storage.objects;
create policy "public can view news photos" on storage.objects for select
  using (bucket_id = 'post-images');
drop policy if exists "admin can upload news photos" on storage.objects;
create policy "admin can upload news photos" on storage.objects for insert
  with check (bucket_id = 'post-images' and public.is_ajker_alo_admin());
drop policy if exists "admin can update news photos" on storage.objects;
create policy "admin can update news photos" on storage.objects for update
  using (bucket_id = 'post-images' and public.is_ajker_alo_admin())
  with check (bucket_id = 'post-images' and public.is_ajker_alo_admin());
drop policy if exists "admin can delete news photos" on storage.objects;
create policy "admin can delete news photos" on storage.objects for delete
  using (bucket_id = 'post-images' and public.is_ajker_alo_admin());

-- Create your first admin account in Authentication → Users, then run this:
-- insert into public.admins (user_id) values ('PASTE_AUTH_USER_UUID_HERE');

-- Sample published content so the current homepage style stays populated at launch.
insert into public.posts (title, slug, category, excerpt, content, cover_image, image_alt, author, is_published, published_at)
values
('সবুজের সমারোহে নতুন সম্ভাবনা, মাঠে মাঠে কৃষকের ব্যস্ততা','sobujer-somarohe-notun-sombhabona','বাংলাদেশ','প্রকৃতির সঙ্গে তাল মিলিয়ে এগিয়ে চলেছে গ্রামের জীবন। নতুন ফসল ঘিরে আশাবাদী কৃষক, বদলে যাচ্ছে এলাকার অর্থনীতি।','প্রকৃতির সঙ্গে তাল মিলিয়ে এগিয়ে চলেছে গ্রামের জীবন। নতুন ফসল ঘিরে আশাবাদী কৃষক, বদলে যাচ্ছে এলাকার অর্থনীতি।','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1100&q=85','সবুজ ধানক্ষেতের বিস্তৃত দৃশ্য','নিজস্ব প্রতিবেদক',true,now()),
('জনগণের প্রত্যাশা পূরণে সমন্বিত উদ্যোগ জরুরি','jonogoner-protasha-purone-uddog','রাজনীতি','বিশেষজ্ঞরা বলছেন, টেকসই উন্নয়নে পরিকল্পনার পাশাপাশি দরকার কার্যকর বাস্তবায়ন।','বিশেষজ্ঞরা বলছেন, টেকসই উন্নয়নে পরিকল্পনার পাশাপাশি দরকার কার্যকর বাস্তবায়ন।',null,null,'নিজস্ব প্রতিবেদক',true,now()-interval '1 hour'),
('বায়ুদূষণ কমাতে ঢাকায় নতুন কর্মপরিকল্পনা','bayudushon-komate-dhakay-porikolpona','বাংলাদেশ','পরিবেশ রক্ষায় নগরজুড়ে সমন্বিত উদ্যোগের কথা জানিয়েছেন সংশ্লিষ্টরা।','পরিবেশ রক্ষায় নগরজুড়ে সমন্বিত উদ্যোগের কথা জানিয়েছেন সংশ্লিষ্টরা।','https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80','শহরের ব্যস্ত সড়ক','নিজস্ব প্রতিবেদক',true,now()-interval '2 hours'),
('পাঠাগারকেন্দ্রিক উদ্যোগে বই পড়ায় ফিরছে তরুণেরা','pathagarkendrik-udjog','শিক্ষা','জেলা শহরে বই পড়ার আগ্রহ বাড়াতে নতুন পাঠচক্র ও পাঠাগার উদ্যোগ নিচ্ছেন তরুণেরা।','জেলা শহরে বই পড়ার আগ্রহ বাড়াতে নতুন পাঠচক্র ও পাঠাগার উদ্যোগ নিচ্ছেন তরুণেরা।','https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80','বইয়ের তাক','নিজস্ব প্রতিবেদক',true,now()-interval '3 hours'),
('ডিজিটাল দক্ষতা বাড়াতে তরুণদের জন্য নতুন প্রশিক্ষণ','digital-dokkhotay-notun-proshikkhon','প্রযুক্তি','দেশের বিভিন্ন জেলায় শুরু হচ্ছে হাতে-কলমে শেখার কর্মসূচি।','দেশের বিভিন্ন জেলায় শুরু হচ্ছে হাতে-কলমে শেখার কর্মসূচি।','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80','শিক্ষার্থীরা কম্পিউটারে কাজ করছে','নিজস্ব প্রতিবেদক',true,now()-interval '4 hours'),
('শেষ ওভারের রোমাঞ্চে জয় বাংলাদেশের','shesh-overer-romanche-bangladesh','খেলা','দর্শকভরা গ্যালারিতে দারুণ এক ম্যাচ উপহার দিল দুই দল।','দর্শকভরা গ্যালারিতে দারুণ এক ম্যাচ উপহার দিল দুই দল।','https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80','স্টেডিয়ামে ক্রিকেট খেলা','নিজস্ব প্রতিবেদক',true,now()-interval '5 hours'),
('ব্যস্ত দিনের খাবারে পুষ্টি রাখবেন যেভাবে','byasto-diner-khabare-pushti','জীবনযাপন','সহজ কিছু অভ্যাসে প্রতিদিনের খাদ্যতালিকা হোক আরও স্বাস্থ্যকর।','সহজ কিছু অভ্যাসে প্রতিদিনের খাদ্যতালিকা হোক আরও স্বাস্থ্যকর।','https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80','সুস্বাদু স্বাস্থ্যকর খাবার','নিজস্ব প্রতিবেদক',true,now()-interval '6 hours'),
('নতুনদের জন্য ৫টি জরুরি কর্মক্ষেত্রের দক্ষতা','notunder-kormokhettrer-dokkota','চাকরি','কাজের বাজারে এগিয়ে থাকতে যেসব দক্ষতা কাজে দেবে।','কাজের বাজারে এগিয়ে থাকতে যেসব দক্ষতা কাজে দেবে।','https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80','কর্মস্থলে তরুণ পেশাজীবী','নিজস্ব প্রতিবেদক',true,now()-interval '7 hours')
on conflict (slug) do nothing;
