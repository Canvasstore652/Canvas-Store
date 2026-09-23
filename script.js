  SUPABASE_URL,
  SUPABASE_KEY
);

let products = [];
let cart = [];


/* LOAD PRODUCTS FROM SUPABASE */

async function loadProducts() {

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Product loading error:", error);
    return;
  }

  products = data || [];

  displayProducts(products);
}


/* SHOW PRODUCTS */

function displayProducts(list = products) {

  const container = document.getElementById("products");

  if (!container) return;

  container.innerHTML = "";

  list.forEach(product => {

    const card = document.createElement("div");

    card.className = "product";

    const image = product.image
      ? `<img src="${product.image}" alt="${product.name}">`
      : `<div class="panther-icon"></div>`;

    card.innerHTML = `

      <div class="product-image">
        ${image}
      </div>

      <div class="product-info">

        <h3>${product.name}</h3>

        <p>
          Premium Canvas Store Collection
        </p>

        <span class="price">
          ₹${Number(product.price || 0).toLocaleString("en-IN")}
        </span>

        <span class="old">
          ₹${Number(product.mrp || 0).toLocaleString("en-IN")}
        </span>

        <button
          class="add"
          onclick="addToCart('${product.id}')"
        >
          ADD
        </button>

      </div>
    `;

    container.appendChild(card);

  });

}


/* FILTER */

function filterProducts(category, button) {

  document
    .querySelectorAll(".filters button")
    .forEach(btn => btn.classList.remove("active"));

  if (button) {
    button.classList.add("active");
  }

  if (category === "all") {

    displayProducts(products);

  } else {

    displayProducts(
      products.filter(
        product => product.category === category
      )
    );

  }

}


/* CART */

function addToCart(id) {

  const product =
    products.find(item => String(item.id) === String(id));

  if (!product) return;

  cart.push(product);

  updateCart();

}


function updateCart() {

  const count =
    document.getElementById("cartCount");

  if (count) {
    count.innerText = cart.length;
  }

  const container =
    document.getElementById("cartItems");

  if (!container) return;

  container.innerHTML = "";

  let total = 0;

  cart.forEach((product, index) => {

    total += Number(product.price || 0);

    const item =
      document.createElement("div");

    item.className = "cart-item";

    item.innerHTML = `

      <div>

        <strong>
          ${product.name}
        </strong>

        <br>

        ₹${Number(product.price || 0).toLocaleString("en-IN")}

      </div>

      <button
        onclick="removeFromCart(${index})"
      >
        Remove
      </button>

    `;

    container.appendChild(item);

  });

  const totalElement =
    document.getElementById("cartTotal");

  if (totalElement) {

    totalElement.innerText =
      "₹" + total.toLocaleString("en-IN");

  }

}


function removeFromCart(index) {

  cart.splice(index, 1);

  updateCart();

}


function openCart() {

  document
    .getElementById("overlay")
    .classList.add("show");

}


function closeCart() {

  document
    .getElementById("overlay")
    .classList.remove("show");

}


function checkout() {

  if (cart.length === 0) {

    alert("Your bag is empty.");

    return;

  }

  alert(
    "Checkout system is ready to connect with Razorpay."
  );

}


/* NEWSLETTER */

function subscribe(event) {

  event.preventDefault();

  document.getElementById(
    "subscribeMessage"
  ).innerText =
    "Thank you! Welcome to the Canvas Circle.";

}


/* SEARCH */

function openSearch() {

  const search =
    prompt("What are you looking for?");

  if (!search) return;

  const result =
    products.filter(product =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  if (result.length === 0) {

    alert("No products found.");

  } else {

    document
      .getElementById("shop")
      .scrollIntoView();

    displayProducts(result);

  }

}


/* START WEBSITE */

loadProducts();
