let products = [];
let cart = JSON.parse(localStorage.getItem("canvas_cart") || "[]");

const SUPABASE_URL = "https://prywmsmpnyvoskmnkckm.supabase.co";
const SUPABASE_KEY = "sb_publishable_QWiT8eswERtvNgrHAxQZFw_SB8aHgMg";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ---------- LOAD PRODUCTS ---------- */

async function loadProducts() {
  const container =
    document.getElementById("products") ||
    document.getElementById("productGrid") ||
    document.querySelector(".products-grid") ||
    document.querySelector(".products");

  if (!container) {
    console.error("Product container not found");
    return;
  }

  container.innerHTML = "<p>Loading products...</p>";

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    container.innerHTML =
      "<p>Products load nahi ho rahe. Please refresh.</p>";
    return;
  }

  products = data || [];
  window.products = products;

  displayProducts(products);
}

/* ---------- DISPLAY PRODUCTS ---------- */

function displayProducts(list) {
  const container =
    document.getElementById("products") ||
    document.getElementById("productGrid") ||
    document.querySelector(".products-grid") ||
    document.querySelector(".products");

  if (!container) return;

  if (!list.length) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  container.innerHTML = list.map(product => {

    const price = Number(product.price || 0);
    const mrp = Number(product.mrp || 0);

    let discount = product.discount;

    if (!discount && mrp > price) {
      discount = Math.round(((mrp - price) / mrp) * 100);
    }

    const image =
      product.image ||
      "https://via.placeholder.com/400x400?text=Canvas+Store";

    const stock =
      product.stock === false
        ? "Out of Stock"
        : "In Stock";

    return `
      <div class="product-card"
           data-product-id="${product.id}">

        <div class="product-image">
          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(product.name || "Product")}"
            loading="lazy"
          >
        </div>

        <div class="product-info">

          <h3 class="product-name">
            ${escapeHtml(product.name || "Canvas Store Product")}
          </h3>

          <div class="product-price">
            <strong>₹${price.toLocaleString("en-IN")}</strong>

            ${
              mrp > price
                ? `<span class="old-price">
                     ₹${mrp.toLocaleString("en-IN")}
                   </span>`
                : ""
            }
          </div>

          ${
            discount
              ? `<span class="discount">${discount}% OFF</span>`
              : ""
          }

          <p class="stock">
            ${stock}
          </p>

          <button
            class="add-cart"
            onclick="addToCart('${product.id}')"
            ${product.stock === false ? "disabled" : ""}
          >
            Add to Cart
          </button>

        </div>
      </div>
    `;
  }).join("");
}

/* ---------- PRODUCT CLICK ---------- */

document.addEventListener("click", function(e) {

  const card = e.target.closest(".product-card");

  if (!card) return;

  if (
    e.target.closest(
      "button, a, input, select, textarea"
    )
  ) {
    return;
  }

  const id =
    card.dataset.productId ||
    card.dataset.id;

  if (id) {
    window.location.href =
      "product.html?id=" +
      encodeURIComponent(id);
  }
});

/* ---------- CART ---------- */

function addToCart(id) {

  const product = products.find(
    p => String(p.id) === String(id)
  );

  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      mrp: Number(product.mrp || 0),
      image: product.image || "",
      qty: 1
    });
  }

  save();
  update();

  if (typeof toast === "function") {
    toast("Added to cart");
  }
}

function removeItem(id) {
  cart = cart.filter(
    item => String(item.id) !== String(id)
  );

  save();
  update();
}

function save() {
  localStorage.setItem(
    "canvas_cart",
    JSON.stringify(cart)
  );
}

function update() {

  const count = cart.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const cartCount =
    document.querySelector(".cart-count") ||
    document.querySelector("#cartCount") ||
    document.querySelector(".cart-badge");

  if (cartCount) {
    cartCount.textContent = count;
  }

  const cartItems =
    document.getElementById("cartItems");

  if (cartItems) {

    if (!cart.length) {
      cartItems.innerHTML =
        "<p>Your cart is empty.</p>";
      return;
    }

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">

        <img
          src="${escapeHtml(item.image || "")}"
          alt="${escapeHtml(item.name)}"
        >

        <div>
          <strong>
            ${escapeHtml(item.name)}
          </strong>

          <p>
            ₹${Number(item.price).toLocaleString("en-IN")}
            × ${item.qty}
          </p>

          <button
            onclick="removeItem('${item.id}')"
          >
            Remove
          </button>
        </div>

      </div>
    `).join("");
  }
}

/* ---------- CART DRAWER ---------- */

function openCart() {

  const overlay =
    document.getElementById("overlay");

  if (overlay) {
    overlay.classList.add("show");
  }

  update();
}

function closeCart(e) {

  const overlay =
    document.getElementById("overlay");

  if (!overlay) return;

  if (!e || e.target === overlay) {
    overlay.classList.remove("show");
  }
}

/* ---------- SHOP ---------- */

function shop() {

  const section =
    document.getElementById("shop");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}

/* ---------- CHECKOUT ---------- */

function checkout() {

  if (!cart.length) {

    if (typeof toast === "function") {
      toast("Your cart is empty");
    }

    return;
  }

  alert(
    "Checkout is ready for payment integration."
  );
}

/* ---------- TOAST ---------- */

function toast(message) {

  const element =
    document.getElementById("toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.canvasToast);

  window.canvasToast = setTimeout(() => {
    element.classList.remove("show");
  }, 1600);
}

/* ---------- SEARCH ---------- */

function searchProducts(value) {

  const query =
    String(value || "")
      .trim()
      .toLowerCase();

  if (!query) {
    displayProducts(products);
    return;
  }

  const filtered = products.filter(product => {

    const name =
      String(product.name || "")
        .toLowerCase();

    const category =
      String(product.category || "")
        .toLowerCase();

    const code =
      String(product.code || "")
        .toLowerCase();

    return (
      name.includes(query) ||
      category.includes(query) ||
      code.includes(query)
    );
  });

  displayProducts(filtered);
}

/* ---------- CATEGORY ---------- */

function filterCategory(category) {

  if (!category || category === "all") {
    displayProducts(products);
    return;
  }

  const filtered = products.filter(product =>
    String(product.category || "")
      .toLowerCase()
      .includes(String(category).toLowerCase())
  );

  displayProducts(filtered);
}

/* ---------- HTML SECURITY ---------- */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- START ---------- */

document.addEventListener("DOMContentLoaded", function() {

  loadProducts();
  update();

});
