const STORAGE_KEY = "teluguMovieUpdatesPosts";
const placeholderImage = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80";

const samplePosts = [
  {
    id: "sample-1",
    title: "Welcome to Telugu Movie Updates",
    category: "Movie News",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85",
    text: "Your destination for Telugu cinema news, upcoming movie announcements, posters, teasers and trailers. Add your own latest update using the editor below.",
    date: new Date().toISOString()
  },
  {
    id: "sample-2",
    title: "Track upcoming Telugu movie releases",
    category: "Release Date",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abcd?auto=format&fit=crop&w=1000&q=85",
    text: "Publish confirmed release-date announcements here. Always verify dates with official production-house or distributor announcements before posting.",
    date: new Date().toISOString()
  },
  {
    id: "sample-3",
    title: "Teasers, trailers and first looks",
    category: "Teaser / Trailer",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=85",
    text: "Share official promotional updates and include the source link in your article text when possible.",
    date: new Date().toISOString()
  }
];

const grid = document.getElementById("updatesGrid");
const template = document.getElementById("postTemplate");
const emptyState = document.getElementById("emptyState");
const form = document.getElementById("postForm");
const titleInput = document.getElementById("postTitle");
const categoryInput = document.getElementById("postCategory");
const imageInput = document.getElementById("postImage");
const imageFileInput = document.getElementById("postImageFile");
const textInput = document.getElementById("postText");
const idInput = document.getElementById("postId");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEdit");

function loadPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : samplePosts;
  } catch (error) {
    console.error("Could not load saved posts:", error);
    return samplePosts;
  }
}

let posts = loadPosts();

function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    alert("Browser storage is full. Try using a smaller image.");
    console.error(error);
  }
}

function renderPosts() {
  grid.innerHTML = "";
  emptyState.hidden = posts.length !== 0;

  [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(post => {
    const card = template.content.firstElementChild.cloneNode(true);
    const img = card.querySelector(".card-image");
    img.src = post.image || placeholderImage;
    img.alt = post.title;
    img.onerror = () => { img.src = placeholderImage; };
    card.querySelector(".category-tag").textContent = post.category;
    card.querySelector(".card-title").textContent = post.title;
    card.querySelector(".card-text").textContent = post.text;
    card.querySelector("time").textContent = new Date(post.date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });

    card.querySelector(".edit-btn").addEventListener("click", () => startEdit(post.id));
    card.querySelector(".delete-btn").addEventListener("click", () => deletePost(post.id));
    grid.appendChild(card);
  });
}

function resetForm() {
  form.reset();
  idInput.value = "";
  saveButton.textContent = "Publish Update";
  cancelEditButton.hidden = true;
}

function startEdit(id) {
  const post = posts.find(item => item.id === id);
  if (!post) return;
  idInput.value = post.id;
  titleInput.value = post.title;
  categoryInput.value = post.category;
  imageInput.value = post.image && post.image.startsWith("data:") ? "" : (post.image || "");
  textInput.value = post.text;
  saveButton.textContent = "Save Changes";
  cancelEditButton.hidden = false;
  document.getElementById("editor").scrollIntoView({ behavior: "smooth" });
}

function deletePost(id) {
  if (!confirm("Delete this movie update?")) return;
  posts = posts.filter(post => post.id !== id);
  savePosts();
  renderPosts();
  if (idInput.value === id) resetForm();
}

function readUploadedImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Please select an image file."));
    if (file.size > 700 * 1024) return reject(new Error("Please choose an image smaller than 700 KB, or use an image URL."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const text = textInput.value.trim();
  if (!title || !text) return;

  try {
    const uploadedImage = await readUploadedImage(imageFileInput.files[0]);
    const existing = posts.find(post => post.id === idInput.value);
    const image = uploadedImage || imageInput.value.trim() || (existing && existing.image) || placeholderImage;
    const postData = {
      id: existing ? existing.id : (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title,
      category: categoryInput.value,
      image,
      text,
      date: new Date().toISOString()
    };

    if (existing) {
      posts = posts.map(post => post.id === existing.id ? postData : post);
    } else {
      posts.push(postData);
    }

    savePosts();
    renderPosts();
    resetForm();
    document.getElementById("latest").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert(error.message);
  }
});

cancelEditButton.addEventListener("click", resetForm);
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});

renderPosts();
