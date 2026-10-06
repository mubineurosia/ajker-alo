(() => {
  const db = window.ajkerAloSupabase;
  const $ = selector => document.querySelector(selector);
  const show = (node, yes = true) => node.classList.toggle("hidden", !yes);
  const setMessage = (node, text) => { node.textContent = text; show(node, Boolean(text)); };
  const escapeHtml = value => String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const fileSlug = text => text.normalize("NFKC").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 100) || `news-${Date.now()}`;
  const categoryList = ["বাংলাদেশ","রাজনীতি","বিশ্ব","বাণিজ্য","মতামত","খেলা","বিনোদন","চাকরি","জীবনযাপন","শিক্ষা","প্রযুক্তি","পরিবেশ"];
  const loginPanel = $("#loginPanel"), setupPanel = $("#setupPanel"), adminApp = $("#adminApp");
  let posts = [];

  if (!db) { show(setupPanel); return; }

  async function sessionChanged(session) {
    show(loginPanel, !session);
    show(adminApp, Boolean(session));
    show($("#logoutBtn"), Boolean(session));
    $("#userEmail").textContent = session?.user?.email || "";
    if (session) {
      const { data, error } = await db.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (error || !data) {
        await db.auth.signOut();
        setMessage($("#loginError"), "এই অ্যাকাউন্টে সম্পাদক অনুমতি নেই।");
        return;
      }
      await loadPosts();
    }
  }

  async function loadPosts() {
    const { data, error } = await db.from("posts").select("id,title,slug,category,excerpt,content,cover_image,image_alt,author,is_published,published_at,updated_at").order("updated_at", { ascending:false }).limit(100);
    if (error) { setMessage($("#appError"), `খবর লোড করা যায়নি: ${error.message}`); return; }
    setMessage($("#appError"), ""); posts = data || []; renderList();
  }

  function renderList() {
    $("#postCount").textContent = `${posts.length}টি সংবাদ`;
    if (!posts.length) { $("#postList").innerHTML = '<div class="empty">এখনও কোনো সংবাদ নেই। “নতুন সংবাদ” দিয়ে শুরু করুন।</div>'; return; }
    $("#postList").innerHTML = posts.map(post => `<article class="post-row"><img src="${escapeHtml(post.cover_image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=220&q=75")}" alt=""><div><h3>${escapeHtml(post.title)}<span class="badge ${post.is_published ? "live" : ""}">${post.is_published ? "প্রকাশিত" : "খসড়া"}</span></h3><small>${escapeHtml(post.category)} · /${escapeHtml(post.slug)} · ${new Intl.DateTimeFormat("bn-BD", { dateStyle:"medium" }).format(new Date(post.updated_at || Date.now()))}</small></div><div class="row-actions"><button class="btn" data-edit="${escapeHtml(post.id)}">সম্পাদনা</button><button class="btn danger" data-delete="${escapeHtml(post.id)}">মুছুন</button></div></article>`).join("");
    $("#postList").querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => editPost(button.dataset.edit)));
    $("#postList").querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => deletePost(button.dataset.delete)));
  }

  function resetForm() {
    $("#postForm").reset(); $("#postId").value = ""; $("#imageUrl").value = "";
    $("#editorHeading").textContent = "নতুন সংবাদ"; $("#saveBtn").textContent = "সংরক্ষণ করুন"; show($("#editor"), false); setMessage($("#saveStatus"), "");
  }
  function editPost(id) {
    const post = posts.find(item => item.id === id); if (!post) return;
    $("#postId").value = post.id; $("#title").value = post.title; $("#category").value = post.categoryList?.[0] || post.category;
    $("#author").value = post.author || ""; $("#excerpt").value = post.excerpt || ""; $("#content").value = post.content || "";
    $("#imageUrl").value = post.cover_image || ""; $("#imageAlt").value = post.image_alt || ""; $("#publish").checked = post.is_published;
    $("#editorHeading").textContent = "সংবাদ সম্পাদনা"; $("#saveBtn").textContent = "পরিবর্তন সংরক্ষণ"; show($("#editor")); $("#editor").scrollIntoView({ behavior:"smooth", block:"start" });
  }
  async function deletePost(id) {
    const post = posts.find(item => item.id === id); if (!post || !confirm(`“${post.title}” সংবাদটি মুছে ফেলবেন?`)) return;
    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) { setMessage($("#appError"), `মুছতে পারিনি: ${error.message}`); return; }
    await loadPosts(); setMessage($("#appNotice"), "সংবাদটি মুছে ফেলা হয়েছে।");
  }

  async function uploadImage(file) {
    if (!file) return $("#imageUrl").value.trim();
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) throw new Error("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।");
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await db.storage.from("post-images").upload(path, file, { upsert:false, contentType:file.type });
    if (error) throw error;
    return db.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault(); setMessage($("#loginError"), "");
    const { error } = await db.auth.signInWithPassword({ email:$("#email").value.trim(), password:$("#password").value });
    if (error) setMessage($("#loginError"), `লগইন হয়নি: ${error.message}`);
  });
  $("#logoutBtn").addEventListener("click", async () => { await db.auth.signOut(); });
  $("#newPostBtn").addEventListener("click", () => { resetForm(); show($("#editor")); $("#editor").scrollIntoView({ behavior:"smooth", block:"start" }); });
  $("#cancelBtn").addEventListener("click", resetForm);
  $("#title").addEventListener("input", () => { if (!$("#postId").value) $("#slugPreview").textContent = fileSlug($("#title").value); });
  $("#postForm").addEventListener("submit", async event => {
    event.preventDefault(); setMessage($("#appError"), ""); setMessage($("#saveStatus"), "সংরক্ষণ হচ্ছে…"); $("#saveBtn").disabled = true;
    try {
      const id = $("#postId").value || null;
      const current = posts.find(item => item.id === id);
      const image = await uploadImage($("#imageFile").files[0]);
      const payload = {
        title:$("#title").value.trim(), slug:fileSlug($("#title").value), category:categoryList.includes($("#category").value) ? $("#category").value : "বাংলাদেশ",
        author:$("#author").value.trim() || null, excerpt:$("#excerpt").value.trim(), content:$("#content").value.trim(),
        cover_image:image || current?.cover_image || null, image_alt:$("#imageAlt").value.trim() || null, is_published:$("#publish").checked,
        published_at:$("#publish").checked ? (current?.published_at || new Date().toISOString()) : null,
        updated_at:new Date().toISOString()
      };
      const { error } = id ? await db.from("posts").update(payload).eq("id", id) : await db.from("posts").insert(payload);
      if (error) throw error;
      resetForm(); await loadPosts(); setMessage($("#appNotice"), "সংবাদ সংরক্ষণ হয়েছে। প্রকাশিত হলে হোমপেজে দেখা যাবে।");
    } catch (error) { setMessage($("#appError"), `সংরক্ষণ হয়নি: ${error.message}`); setMessage($("#saveStatus"), ""); }
    finally { $("#saveBtn").disabled = false; }
  });

  db.auth.getSession().then(({ data }) => sessionChanged(data.session));
  db.auth.onAuthStateChange((_event, session) => { setTimeout(() => sessionChanged(session), 0); });
})();
