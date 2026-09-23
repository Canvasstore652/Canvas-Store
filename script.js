/* =========================================================
   CANVAS STORE - FINAL SCRIPT
   Supabase client is created in index.html
   ========================================================= */

let products = [];
let cart = JSON.parse(
  localStorage.getItem("canvas_cart") || "[]"
);

let selectedCategory = "all";


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

  const box = document.getElementById("products");
  const summary = document.getElementById("summary");

  if (!box) {
    console.error("Products container not found.");
    return;
  }

  box.innerHTML =
    '<div class="loading">Loading Canvas Store...</div>';

  try {

    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {

      console.error("Supabase Error:", error);

      box.innerHTML =
        "<div class='loading'>Products load nahi ho rahe.</div>";

      if (summary) {
        summary.textContent = "Unable to load products.";
      }

      return;
    }

    products = data || [];

    window.products = products;

    if (summary) {
      summary.textContent =
        products.length +
        " products available";
    }

    apply();

  } catch (err) {

    console.error("Loading Error:", err);

    box.innerHTML =
      "<div class='loading'>Something went wrong.</div>";
  }
}


/* =========================================================
   APPLY SEARCH + CATEGORY + SORT
   ========================================================= */

function apply() {

  const searchInput =
    document.getElementById("search");

  const sortSelect =
    document.getElementById("sort");

  const query =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

  const sort =
    sortSelect
      ? sortSelect.value
      : "latest";


  let result = [...products];


  /* SEARCH */

  if (query) {

    result = result.filter(function(product) {

      const name =
        String(product.name || "").toLowerCase();

      const category =
        String(product.category || "").toLowerCase();

      const code =
        String(
          product.item_code ||
          product.code ||
          ""
        ).toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query) ||
        code.includes(query)
      );
    });
  }


  /* CATEGORY */

  if (
    selectedCategory &&
    selectedCategory !== "all"
  ) {

    const catName =
      selectedCategory.toLowerCase();

    result = result.filter(function(product) {

      const category =
        String(product.category || "")
          .toLowerCase();

      return category.includes(catName);
    });
  }


  /* SORT */

  if (sort === "low") {

    result.sort(function(a, b) {
      return Number(a.price || 0) -
             Number(b.price || 0);
    });

  } else if (sort === "high") {

    result.sort(function(a, b) {
      return Number(b.price || 0) -
             Number(a.price || 0);
    });

  } else if (sort === "discount") {

    result.sort(function(a, b) {

      const da = getDiscount(a);
      const db = getDiscount(b);

      return db - da;
    });

  } else if (sort === "name") {

    result.sort(function(a, b) {

      return String(a.name || "")
        .localeCompare(
          String(b.name || "")
        );
    });

  } else {

    result.sort(function(a, b) {

      return new Date(b.created_at || 0) -
             new Date(a.created_at || 0);
    });
  }


  renderProducts(result);
}


/* =========================================================
   CATEGORY BUTTON
   ========================================================= */

function cat(category) {

  selectedCategory =
    String(category || "all")
      .toLowerCase();

  /* Active tab */

  document
    .querySelectorAll(".tabs button")
    .forEach(function(button) {

      const buttonCat =
        String(
          button.dataset.cat || ""
        ).toLowerCase();

      button.classList.toggle(
        "active",
        buttonCat === selectedCategory
      );
    });

  apply();

  const shop =
    document.getElementById("shop");

  if (shop) {
    shop.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* =========================================================
   DISCOUNT
   ========================================================= */

function getDiscount(product) {

  const price =
    Number(product.price || 0);

  const mrp =
    Number(product.mrp || 0);

  if (product.discount) {
    return Number(product.discount);
  }

  if (mrp > price && price > 0) {

    return Math.round(
      ((mrp - price) / mrp) * 100
    );
  }

  return 0;
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(list) {

  const box =
    document.getElementById("products");

  if (!box) return;


  if (!list.length) {

    box.innerHTML = `
      <div class="loading">
        No products found.
      </div>
    `;

    return;
  }


  box.innerHTML =
    list.map(function(product) {

      const price =
        Number(product.price || 0);

      const mrp =
        Number(product.mrp || 0);

      const discount =
        getDiscount(product);

      const image =
        product.image ||
        "https://via.placeholder.com/400x400?text=Canvas+Store";


      /*
         Stock:
         If stock is explicitly 0 or false,
         show Out of Stock.
      */

      const outOfStock =
        product.stock === 0 ||
        product.stock === false ||
        String(product.stock).toLowerCase() ===
        "out of stock";


      return `

        <article
          class="product-card"
          data-product-id="${escapeHTML(product.id)}"
        >

          <div class="product-image">

            ${
              discount > 0
                ? `
                  <span class="discount-badge">
                    ${discount}% OFF
                  </span>
                `
                : ""
            }

            <img
              src="${escapeHTML(image)}"
              alt="${escapeHTML(product.name || "Product")}"
              loading="lazy"
            >

          </div>


          <div class="product-info">

            <h3>
              ${escapeHTML(
                product.name ||
                "Canvas Store Product"
              )}
            </h3>


            <div class="price-row">

              <strong>
                ₹${price.toLocaleString("en-IN")}
              </strong>

              ${
                mrp > price
                  ? `
                    <del>
                      ₹${mrp.toLocaleString("en-IN")}
                    </del>
                  `
                  : ""
              }

            </div>


            ${
              discount > 0
                ? `
                  <span class="discount">
                    ${discount}% OFF
                  </span>
                `
                : ""
            }


            <div class="stock">

              ${
                outOfStock
                  ? "Out of Stock"
                  : "In Stock"
              }

            </div>


            <button
              class="add-cart"
              data-add-cart="${escapeHTML(product.id)}"
              ${outOfStock ? "disabled" : ""}
            >
              ${
                outOfStock
                  ? "Out of Stock"
                  : "Add to Cart"
              }
            </button>

          </div>

        </article>

      `;

    }).join("");
}


/* =========================================================
   PRODUCT CARD CLICK
   ========================================================= */

document.addEventListener(
  "click",
  function(event) {

    /* Add to cart button */

    const addButton =
      event.target.closest(
        "[data-add-cart]"
      );

    if (addButton) {

      event.preventDefault();
      event.stopPropagation();

      addToCart(
        addButton.dataset.addCart
      );

      return;
    }


    /* Product card */

    const card =
      event.target.closest(
        ".product-card"
      );

    if (!card) return;


    /*
       Don't open product page if
       user clicked a button/link.
    */

    if (
      event.target.closest(
        "button, a, input, select, textarea"
      )
    ) {
      return;
    }


    const id =
      card.dataset.productId;

    if (!id) return;


    window.location.href =
      "product.html?id=" +
      encodeURIComponent(id);
  }
);


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(id) {

  const product =
    products.find(function(item) {

      return String(item.id) ===
             String(id);

    });


  if (!product) {

    console.error(
      "Product not found:",
      id
    );

    return;
  }


  const existing =
    cart.find(function(item) {

      return String(item.id) ===
             String(id);

    });


  if (existing) {

    existing.qty =
      Number(existing.qty || 0) + 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(
        product.price || 0
      ),

      mrp: Number(
        product.mrp || 0
      ),

      image:
        product.image || "",

      qty: 1
    });
  }


  saveCart();
  updateCart();

  toast("Added to cart");
}


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

function removeItem(id) {

  cart =
    cart.filter(function(item) {

      return String(item.id) !==
             String(id);

    });

  saveCart();
  updateCart();
}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart() {

  localStorage.setItem(
    "canvas_cart",
    JSON.stringify(cart)
  );
}


/* =========================================================
   UPDATE CART
   ========================================================= */

function updateCart() {

  const count =
    cart.reduce(
      function(total, item) {

        return total +
          Number(item.qty || 0);

      },
      0
    );


  const countElement =
    document.getElementById("count");

  if (countElement) {
    countElement.textContent =
      count;
  }


  const items =
    document.getElementById("items");

  const empty =
    document.getElementById("empty");

  const totalElement =
    document.getElementById("total");


  if (!items) return;


  if (!cart.length) {

    items.innerHTML = "";

    if (empty) {
      empty.style.display = "block";
    }

    if (totalElement) {
      totalElement.textContent =
        "₹0";
    }

    return;
  }


  if (empty) {
    empty.style.display = "none";
  }


  let total = 0;


  items.innerHTML =
    cart.map(function(item) {

      const itemTotal =
        Number(item.price || 0) *
        Number(item.qty || 0);

      total += itemTotal;


      return `

        <div class="cart-item">

          <img
            src="${escapeHTML(item.image || "")}"
            alt="${escapeHTML(item.name)}"
          >

          <div>

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <p>
              ₹${Number(item.price || 0)
                .toLocaleString("en-IN")}
              × ${item.qty}
            </p>

            <button
              onclick="removeItem('${escapeHTML(item.id)}')"
            >
              Remove
            </button>

          </div>

        </div>

      `;

    }).join("");


  if (totalElement) {

    totalElement.textContent =
      "₹" +
      total.toLocaleString("en-IN");
  }
}


/* =========================================================
   OPEN CART
   ========================================================= */

function openCart() {

  const overlay =
    document.getElementById("overlay");

  if (overlay) {

    overlay.classList.add("show");
  }

  updateCart();
}


/* =========================================================
   CLOSE CART
   ========================================================= */

function closeCart(event) {

  const overlay =
    document.getElementById("overlay");

  if (!overlay) return;


  if (
    !event ||
    event.target === overlay
  ) {

    overlay.classList.remove(
      "show"
    );
  }
}


/* =========================================================
   SHOP
   ========================================================= */

function shop() {

  const section =
    document.getElementById("shop");

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}


/* =========================================================
   CHECKOUT
   ========================================================= */

function checkout() {

  if (!cart.length) {

    toast(
      "Your cart is empty"
    );

    return;
  }


  alert(
    "Checkout is ready for payment integration."
  );
}


/* =========================================================
   SEARCH
   ========================================================= */

document.addEventListener(
  "input",
  function(event) {

    if (
      event.target &&
      event.target.id === "search"
    ) {

      apply();
    }
  }
);


/* =========================================================
   TOAST
   ========================================================= */

function toast(message) {

  const element =
    document.getElementById("toast");

  if (!element) return;


  element.textContent =
    message;

  element.classList.add(
    "show"
  );


  clearTimeout(
    window.canvasToastTimer
  );


  window.canvasToastTimer =
    setTimeout(
      function() {

        element.classList.remove(
          "show"
        );

      },
      1600
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadProducts();

    updateCart();

  }
);
