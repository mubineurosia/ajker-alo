(() => {
  const db = window.ajkerAloSupabase;
  const root = document.querySelector("#articleContent");
  const escapeHtml = value => String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  if (!db || !root) {
    root.innerHTML = '<p class="article-message">সংবাদ দেখাতে backend সেটআপ সম্পূর্ণ করতে হবে।</p>';
    return;
  }
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) { root.innerHTML = '<p class="article-message">এই সংবাদের ঠিকানা সঠিক নয়।</p>'; return; }
  db.from("posts").select("title,category,excerpt,content,cover_image,image_alt,author,published_at").eq("slug", slug).eq("is_published", true).maybeSingle().then(({ data, error }) => {
    if (error || !data) { root.innerHTML = '<p class="article-message">সংবাদটি পাওয়া যায়নি।</p>'; return; }
    document.title = `${data.title} | আজকের আলো`;
    const date = data.published_at ? new Intl.DateTimeFormat("bn-BD", { dateStyle:"long", timeStyle:"short" }).format(new Date(data.published_at)) : "";
    const paragraphs = (data.content || "").split(/\n\s*\n/).filter(Boolean).map(p => `<p>${escapeHtml(p).replace(/\n/g,"<br>")}</p>`).join("");
    root.innerHTML = `<div class="section-label">${escapeHtml(data.category)}</div><h1>${escapeHtml(data.title)}</h1><p class="article-excerpt">${escapeHtml(data.excerpt)}</p><div class="meta">${date}${data.author ? ` · ${escapeHtml(data.author)}` : ""}</div>${data.cover_image ? `<img class="article-cover" src="${escapeHtml(data.cover_image)}" alt="${escapeHtml(data.image_alt || data.title)}">` : ""}<div class="article-body">${paragraphs}</div>`;
  });
})();
