import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug:string }> };

export async function generateMetadata({params}:PageProps) {
  const {slug}=await params;
  const post=await getPostBySlug(slug);
  return post?{title:`${post.title} | আজকের আলো`,description:post.excerpt}:{title:"সংবাদ | আজকের আলো"};
}

export default async function ArticlePage({params}:PageProps) {
  const {slug}=await params;
  const post=await getPostBySlug(slug);
  if(!post) notFound();
  const date=post.published_at?new Intl.DateTimeFormat("bn-BD",{dateStyle:"long",timeStyle:"short",timeZone:"Asia/Dhaka"}).format(new Date(post.published_at)):"";
  return <><header className="article-head"><div className="article-wrap"><Link href="/" className="article-brand">আজকের আলো<small>সত্যের পথে, মানুষের পাশে</small></Link><Link href="/" className="back-link">← হোমপেজে ফিরুন</Link></div></header><main className="article-wrap article-page"><article><div className="section-label">{post.category}</div><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p><div className="meta">{date}{post.author?` · ${post.author}`:""}</div>{post.cover_image&&<img className="article-cover" src={post.cover_image} alt={post.image_alt||post.title}/>}<div className="article-body">{post.content.split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></article></main><footer className="article-footer"><div className="article-wrap">© ২০২৬ আজকের আলো · সর্বস্বত্ব সংরক্ষিত</div></footer></>;
}
