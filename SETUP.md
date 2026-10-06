# আজকের আলো — অ্যাডমিন ও backend সেটআপ

হোমপেজের বর্তমান ডিজাইন অপরিবর্তিত রেখে সংবাদ Supabase database থেকে দেখানো হয়। `/admin.html` থেকে অনুমোদিত সম্পাদক সংবাদ যোগ, সম্পাদনা, খসড়া/প্রকাশ এবং মুছে ফেলতে পারবেন। GitHub-এর `main` branch-এ পরিবর্তন push হলে Vercel স্বয়ংক্রিয়ভাবে সাইট deploy করে।

## প্রথমবার চালু করা

1. Supabase-এ একটি project তৈরি করুন।
2. Dashboard-এর **SQL Editor**-এ `supabase/schema.sql`-এর সব SQL চালান। এতে সংবাদ টেবিল, access policies, public ছবি রাখার bucket এবং বর্তমান homepage-এর প্রাথমিক নমুনা খবর তৈরি হবে।
3. **Project Settings → API** থেকে Project URL ও anon/public key নিয়ে `supabase-config.js`-এ বসান:

   ```js
   window.AJKER_ALO_SUPABASE = {
     url: "https://YOUR_PROJECT.supabase.co",
     anonKey: "YOUR_PUBLIC_ANON_KEY"
   };
   ```

   `service_role` key এখানে দেবেন না। এটি গোপন admin key এবং browser-এ রাখা যাবে না।
4. **Authentication → Users → Add user** থেকে নিজের email ও password দিয়ে admin account তৈরি করুন। Supabase email confirmation চাইলে নিজের inbox থেকে confirm করুন।
5. ওই account-এর UUID নিয়ে SQL Editor-এ চালান:

   ```sql
   insert into public.admins (user_id) values ('YOUR_AUTH_USER_UUID');
   ```

6. `supabase-config.js` commit করে GitHub `main`-এ push করুন। Vercel deploy শেষ হলে `https://ajker-alo.vercel.app/admin.html` খুলে login করুন।

## Admin panel-এ

- শিরোনাম, বিভাগ, লেখক, সংক্ষিপ্ত পরিচিতি ও সম্পূর্ণ লেখা যোগ করা যায়।
- ছবি URL দেওয়া যায় অথবা সর্বোচ্চ ৫ MB-এর JPG, PNG, WebP ছবি আপলোড করা যায়।
- খসড়া public সাইটে দেখা যায় না। প্রকাশিত সংবাদ হোমপেজে সর্বশেষ প্রকাশের সময় অনুযায়ী দেখা যায়।
- শিরোনাম থেকে সংবাদ URL স্বয়ংক্রিয়ভাবে তৈরি হয়। প্রতিটি সংবাদের আলাদা বিস্তারিত পেজ থাকে।

Public visitor শুধু প্রকাশিত সংবাদ পড়তে পারে। `admins` table-এ যাদের account UUID আছে, কেবল তারাই সংবাদ সম্পাদনা বা মুছতে পারে।
