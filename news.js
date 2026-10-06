(() => {
  const db = window.ajkerAloSupabase;
  if (!db) return;

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const safeImage = value => {
    try {
      const url = new URL(value, location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  const linkTo = post => `article.html?slug=${encodeURIComponent(post.slug)}`;
  const dateLabel = post => post.published_at
    ? new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.published_at))
    : "এখনই প্রকাশিত";
  const setImage = (image, post) => {
    const url = safeImage(post.cover_image);
    if (url) image.src = url;
    image.alt = post.image_alt || post.title || "সংবাদ ছবি";
  };
  const linkedTitle = (post, className = "") => `<a class="${className}" href="${linkTo(post)}">${escapeHtml(post.title)}</a>`;

  function render(posts) {
    if (!posts.length) {
      document.querySelector(".lead-grid")?.classList.add("backend-empty");
      return;
    }
    document.querySelector(".lead-grid")?.classList.remove("backend-empty");
    const [lead, ...rest] = posts;
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.innerHTML = `<a href="${linkTo(lead)}" class="hero-link"><img class="hero-img" src="${safeImage(lead.cover_image)}" alt="${escapeHtml(lead.image_alt || lead.title)}"><div class="section-label">${escapeHtml(lead.category)}</div><h1>${escapeHtml(lead.title)}</h1><p>${escapeHtml(lead.excerpt || "")}</p><div class="meta">${dateLabel(lead)}${lead.author ? ` · ${escapeHtml(lead.author)}` : ""}</div></a>`;
    }
    const side = document.querySelector(".side-leads");
    if (side) side.innerHTML = rest.slice(0, 3).map((post, i) => `<article class="story ${i === 1 && post.cover_image ? "photo-story" : ""}">${i === 1 && post.cover_image ? `<div><div class="section-label">${escapeHtml(post.category)}</div><h2>${linkedTitle(post)}</h2><div class="meta">${dateLabel(post)}</div></div><img src="${safeImage(post.cover_image)}" alt="${escapeHtml(post.image_alt || post.title)}">` : `<div class="section-label">${escapeHtml(post.category)}</div><h2>${linkedTitle(post)}</h2><p>${escapeHtml(post.excerpt || "")}</p><div class="meta">${dateLabel(post)}</div>`}</article>`).join("");

    const ranked = document.querySelectorAll(".most-read .ranked");
    posts.slice(0, 5).forEach((post, i) => {
      if (!ranked[i]) return;
      ranked[i].innerHTML = `<b>${i + 1}</b><p>${linkedTitle(post)}</p>`;
    });
    ranked.forEach((row, i) => { if (i >= Math.min(posts.length, 5)) row.remove(); });

    const latest = document.querySelector(".latest-grid");
    if (latest) latest.innerHTML = posts.slice(0, 8).map(post => `<article class="card"><a href="${linkTo(post)}"><img src="${safeImage(post.cover_image)}" alt="${escapeHtml(post.image_alt || post.title)}"><div class="tag">${escapeHtml(post.category)}</div><h3>${escapeHtml(post.title)}</h3></a><p>${escapeHtml(post.excerpt || "")}</p><div class="meta">${dateLabel(post)}</div></article>`).join("");

    const belowSections = [...document.querySelectorAll(".below > section")];
    const categories = ["বাংলাদেশ", "বিশ্ব"];
    belowSections.forEach((section, i) => {
      const categoryPosts = posts.filter(post => post.category === categories[i]).slice(0, 3);
      section.querySelectorAll(".brief").forEach(row => row.remove());
      categoryPosts.forEach(post => {
        const row = document.createElement("article");
        row.className = "brief";
        row.innerHTML = `<a href="${linkTo(post)}"><img src="${safeImage(post.cover_image)}" alt="${escapeHtml(post.image_alt || post.title)}"></a><div><h3>${linkedTitle(post)}</h3><small>${escapeHtml(post.category)} · ${dateLabel(post)}</small></div>`;
        section.append(row);
      });
    });
  }

  db.from("posts").select("id,title,slug,category,excerpt,content,cover_image,image_alt,author,published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(30)
    .then(({ data, error }) => {
      if (error) { console.error("News could not be loaded", error.message); return; }
      render(data || []);
    });
})();
