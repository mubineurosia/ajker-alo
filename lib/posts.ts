import { getSupabase } from "@/lib/supabase";

export type Post = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  image_alt: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  updated_at?: string;
};

const image = (id: string, width = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const demoPosts: Post[] = [
  { title:"সবুজের সমারোহে নতুন সম্ভাবনা, মাঠে মাঠে কৃষকের ব্যস্ততা", slug:"sobujer-somarohe-notun-sombhabona", category:"বাংলাদেশ", excerpt:"প্রকৃতির সঙ্গে তাল মিলিয়ে এগিয়ে চলেছে গ্রামের জীবন। নতুন ফসল ঘিরে আশাবাদী কৃষক, বদলে যাচ্ছে এলাকার অর্থনীতি।", content:"প্রকৃতির সঙ্গে তাল মিলিয়ে এগিয়ে চলেছে গ্রামের জীবন। নতুন ফসল ঘিরে আশাবাদী কৃষক, বদলে যাচ্ছে এলাকার অর্থনীতি।", cover_image:image("photo-1500382017468-9049fed747ef",1100), image_alt:"সবুজ ধানক্ষেতের বিস্তৃত দৃশ্য", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T09:00:00+06:00" },
  { title:"জনগণের প্রত্যাশা পূরণে সমন্বিত উদ্যোগ জরুরি", slug:"jonogoner-protasha-purone-uddog", category:"রাজনীতি", excerpt:"বিশেষজ্ঞরা বলছেন, টেকসই উন্নয়নে পরিকল্পনার পাশাপাশি দরকার কার্যকর বাস্তবায়ন।", content:"বিশেষজ্ঞরা বলছেন, টেকসই উন্নয়নে পরিকল্পনার পাশাপাশি দরকার কার্যকর বাস্তবায়ন।", cover_image:null, image_alt:null, author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T08:00:00+06:00" },
  { title:"বায়ুদূষণ কমাতে ঢাকায় নতুন কর্মপরিকল্পনা", slug:"bayudushon-komate-dhakay-porikolpona", category:"বাংলাদেশ", excerpt:"পরিবেশ রক্ষায় নগরজুড়ে সমন্বিত উদ্যোগের কথা জানিয়েছেন সংশ্লিষ্টরা।", content:"পরিবেশ রক্ষায় নগরজুড়ে সমন্বিত উদ্যোগের কথা জানিয়েছেন সংশ্লিষ্টরা।", cover_image:image("photo-1519501025264-65ba15a82390"), image_alt:"শহরের ব্যস্ত সড়ক", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T07:00:00+06:00" },
  { title:"পাঠাগারকেন্দ্রিক উদ্যোগে বই পড়ায় ফিরছে তরুণেরা", slug:"pathagarkendrik-udjog", category:"শিক্ষা", excerpt:"জেলা শহরে বই পড়ার আগ্রহ বাড়াতে নতুন পাঠচক্র ও পাঠাগার উদ্যোগ নিচ্ছেন তরুণেরা।", content:"জেলা শহরে বই পড়ার আগ্রহ বাড়াতে নতুন পাঠচক্র ও পাঠাগার উদ্যোগ নিচ্ছেন তরুণেরা।", cover_image:image("photo-1507842217343-583bb7270b66"), image_alt:"বইয়ের তাক", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T06:00:00+06:00" },
  { title:"ডিজিটাল দক্ষতা বাড়াতে তরুণদের জন্য নতুন প্রশিক্ষণ", slug:"digital-dokkhotay-notun-proshikkhon", category:"প্রযুক্তি", excerpt:"দেশের বিভিন্ন জেলায় শুরু হচ্ছে হাতে-কলমে শেখার কর্মসূচি।", content:"দেশের বিভিন্ন জেলায় শুরু হচ্ছে হাতে-কলমে শেখার কর্মসূচি।", cover_image:image("photo-1516321318423-f06f85e504b3"), image_alt:"শিক্ষার্থীরা কম্পিউটারে কাজ করছে", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T05:00:00+06:00" },
  { title:"শেষ ওভারের রোমাঞ্চে জয় বাংলাদেশের", slug:"shesh-overer-romanche-bangladesh", category:"খেলা", excerpt:"দর্শকভরা গ্যালারিতে দারুণ এক ম্যাচ উপহার দিল দুই দল।", content:"দর্শকভরা গ্যালারিতে দারুণ এক ম্যাচ উপহার দিল দুই দল।", cover_image:image("photo-1540747913346-19e32dc3e97e"), image_alt:"স্টেডিয়ামে ক্রিকেট খেলা", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T04:00:00+06:00" },
  { title:"ব্যস্ত দিনের খাবারে পুষ্টি রাখবেন যেভাবে", slug:"byasto-diner-khabare-pushti", category:"জীবনযাপন", excerpt:"সহজ কিছু অভ্যাসে প্রতিদিনের খাদ্যতালিকা হোক আরও স্বাস্থ্যকর।", content:"সহজ কিছু অভ্যাসে প্রতিদিনের খাদ্যতালিকা হোক আরও স্বাস্থ্যকর।", cover_image:image("photo-1498837167922-ddd27525d352"), image_alt:"সুস্বাদু স্বাস্থ্যকর খাবার", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T03:00:00+06:00" },
  { title:"নতুনদের জন্য ৫টি জরুরি কর্মক্ষেত্রের দক্ষতা", slug:"notunder-kormokhettrer-dokkota", category:"চাকরি", excerpt:"কাজের বাজারে এগিয়ে থাকতে যেসব দক্ষতা কাজে দেবে।", content:"কাজের বাজারে এগিয়ে থাকতে যেসব দক্ষতা কাজে দেবে।", cover_image:image("photo-1516321497487-e288fb19713f"), image_alt:"কর্মস্থলে তরুণ পেশাজীবী", author:"নিজস্ব প্রতিবেদক", is_published:true, published_at:"2026-10-06T02:00:00+06:00" },
];

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = getSupabase();
  if (!supabase) return demoPosts;
  const { data, error } = await supabase.from("posts").select("id,title,slug,category,excerpt,content,cover_image,image_alt,author,is_published,published_at,updated_at").eq("is_published", true).order("published_at", { ascending:false }).limit(30);
  if (error) return demoPosts;
  if (!data) return [];
  return data as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabase();
  if (!supabase) return demoPosts.find(post => post.slug === slug) || null;
  const { data, error } = await supabase.from("posts").select("id,title,slug,category,excerpt,content,cover_image,image_alt,author,is_published,published_at,updated_at").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error || !data) return null;
  return data as Post;
}
