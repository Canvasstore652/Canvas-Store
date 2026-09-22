const products = [

  {
    id: 1,
    name: "Premium Star LED Lamp",
    category: "lamp",
    price: 899,
    oldPrice: 1499,
    type: "lamp"
  },

  {
    id: 2,
    name: "Sliding Panther Showpiece",
    category: "showpiece",
    price: 899,
    oldPrice: 1499,
    type: "panther"
  },

  {
    id: 3,
    name: "Twin Towers Malaysia Showpiece",
    category: "showpiece",
    price: 599,
    oldPrice: 999,
    type: "panther"
  },

  {
    id: 4,
    name: "Premium Decorative Water Fountain",
    category: "showpiece",
    price: 1299,
    oldPrice: 1999,
    type: "panther"
  }

];


let cart = [];


/* SHOW PRODUCTS */

function displayProducts(list = products) {

  const container = document.getElementById("products");

  container.innerHTML = "";

  list.forEach(product => {

    const card = document.createElement("div");

    card.className = "product";

    let visual =
      product.type === "lamp"
        ? `<div class="lamp-icon">★</div>`
        : `<div class="panther-icon"></div>`;

    card.innerHTML = `

      <div class="product-image">

        ${visual}

      </div>

      <div class="product-info">

        <h3>
          ${product.name}
        </h3>

        <p>
          Premium Canvas Store Collection
        </p>

        <span class="price">
          ₹${product.price.toLocaleString("en-IN")}
        </span>

        <span class="old">
          ₹${product.oldPrice.toLocaleString("en-IN")}
        </span>

        <button
          class="add"
          onclick="addToCart(${product.id})"
        >
          ADD
        </button>

      </div>
    `;

    container.appendChild(card);

  });

}


displayProducts();


/* FILTER */

function filterProducts(category, button) {

  document
    .querySelectorAll(".filters button")
    .forEach(btn => btn.classList.remove("active"));

  button.classList.add("active");

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
    products.find(item => item.id === id);

  cart.push(product);

  updateCart();

}


function updateCart() {

  document.getElementById("cartCount").innerText =
    cart.length;

  const container =
    document.getElementById("cartItems");

  container.innerHTML = "";

  let total = 0;

  cart.forEach((product,index) => {

    total += product.price;

    const item =
      document.createElement("div");

    item.className = "cart-item";

    item.innerHTML = `

      <div>

        <strong>
          ${product.name}
        </strong>

        <br>

        ₹${product.price.toLocaleString("en-IN")}

      </div>

      <button
        onclick="removeFromCart(${index})"
      >
        Remove
      </button>

    `;

    container.appendChild(item);

  });

  document.getElementById("cartTotal").innerText =
    "₹" + total.toLocaleString("en-IN");

}


function removeFromCart(index) {

  cart.splice(index,1);

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
    prompt(
      "What are you looking for?"
    );

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