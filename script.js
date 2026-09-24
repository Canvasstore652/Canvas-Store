/* =========================================================
   CANVAS STORE - MAIN STORE SCRIPT
   ========================================================= */

let products = [];
let shown = [];
let category = 'all';

let cart = JSON.parse(
  localStorage.getItem('canvas_cart') || '[]'
);


/* =========================================================
   HELPERS
   ========================================================= */

const money = n =>
  '₹' + Number(n || 0).toLocaleString('en-IN');


const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));


function getProductImages(product) {

  let images = [];

  /* New JSONB images column */
  if (Array.isArray(product.images)) {
    images = product.images
      .filter(Boolean)
      .map(x => String(x));
  }

  /* If images was returned as JSON text */
  if (!images.length && typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);

      if (Array.isArray(parsed)) {
        images = parsed
          .filter(Boolean)
          .map(x => String(x));
      }
    } catch (e) {
      /* ignore invalid JSON */
    }
  }

  /* Old single image column */
  if (!images.length && product.image) {
    images.push(String(product.image));
  }

  return [...new Set(images)];
}


function getMainImage(product) {

  const images = getProductImages(product);

  return images[0] || '';
}


/* =========================================================
   CATEGORY
   ========================================================= */

function cat(v) {

  category = v;

  document
    .querySelectorAll('.tabs button')
    .forEach(button => {

      button.classList.toggle(
        'active',
        button.dataset.cat === v
      );

    });

  apply();

  const shopSection =
    document.getElementById('shop');

  if (shopSection) {
    shopSection.scrollIntoView({
      behavior: 'smooth'
    });
  }
}


/* =========================================================
   PRODUCT CATEGORY DETECTION
   ========================================================= */

function kind(v) {

  v = String(v || '').toLowerCase();

  if (
    v.includes('lamp') ||
    v.includes('night lamp')
  ) {
    return 'lamp';
  }

  if (
    v.includes('light') ||
    v.includes('lighting')
  ) {
    return 'lighting';
  }

  if (
    v.includes('showpiece') ||
    v.includes('statue') ||
    v.includes('panther') ||
    v.includes('tower')
  ) {
    return 'showpiece';
  }

  return 'decor';
}


/* =========================================================
   DISCOUNT
   ========================================================= */

function discount(product) {

  const mrp = Number(product.mrp || 0);
  const price = Number(product.price || 0);

  if (mrp > price && mrp > 0) {

    return Math.round(
      ((mrp - price) / mrp) * 100
    );

  }

  return Number(product.discount || 0);
}


/* =========================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================= */

async function load() {

  try {

    const result =
      await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', {
          ascending: false
        });


    if (result.error) {
      throw result.error;
    }


    products = result.data || [];

    apply();

  } catch (error) {

    console.error(
      'Canvas Store products error:',
      error
    );

    const productBox =
      document.getElementById('products');

    if (productBox) {

      productBox.innerHTML = `
        <div class="loading">
          Products could not be loaded.<br>
          Please refresh and try again.
        </div>
      `;

    }

  }

}


/* =========================================================
   SEARCH + FILTER + SORT
   ========================================================= */

function apply() {

  const searchInput =
    document.getElementById('search');

  const sortInput =
    document.getElementById('sort');


  const q =
    (searchInput?.value || '')
      .trim()
      .toLowerCase();


  const sort =
    sortInput?.value || 'latest';


  shown = products.filter(product => {

    const categoryMatch =
      category === 'all' ||
      kind(product.category) === category;


    const searchableText = [

      product.name,
      product.category,
      product.item_code,
      product.id

    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();


    const searchMatch =
      !q ||
      searchableText.includes(q);


    return categoryMatch && searchMatch;

  });


  /* SORT */

  if (sort === 'low') {

    shown.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );

  }


  if (sort === 'high') {

    shown.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );

  }


  if (sort === 'discount') {

    shown.sort(
      (a, b) =>
        discount(b) -
        discount(a)
    );

  }


  if (sort === 'name') {

    shown.sort(
      (a, b) =>
        String(a.name || '')
          .localeCompare(
            String(b.name || '')
          )
    );

  }


  render();

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function render() {

  const productBox =
    document.getElementById('products');

  if (!productBox) return;


  const summary =
    document.getElementById('summary');

  if (summary) {

    summary.textContent =
      `${shown.length} product${
        shown.length === 1 ? '' : 's'
      } available`;

  }


  if (!shown.length) {

    productBox.innerHTML = `
      <div class="loading">
        No products found.
      </div>
    `;

    return;
  }


  productBox.innerHTML = shown.map(product => {

    const d = discount(product);

    const out =
      Number(product.stock ?? 1) <= 0;

    const image =
      getMainImage(product);


    return `

      <article
        class="product-card"
        data-product-id="${esc(product.id)}"
        onclick="openProduct('${esc(product.id)}')"
      >

        <div class="product-image">

          ${
            image

              ? `
                <img
                  src="${esc(image)}"
                  loading="lazy"
                  alt="${esc(
                    product.name ||
                    'Canvas Store Product'
                  )}"
                >
              `

              : `
                <span style="
                  font-size:42px;
                  opacity:.65;
                ">
                  ✨
                </span>
              `
          }


          ${
            d > 0

              ? `
                <span class="discount-badge">
                  ${d}% OFF
                </span>
              `

              : ''
          }


          ${
            out

              ? `
                <span class="out">
                  OUT OF STOCK
                </span>
              `

              : ''
          }

        </div>


        <div class="product-info">

          <div style="
            color:#878787;
            font-size:10px;
            margin-bottom:4px;
          ">
            ${esc(
              product.category ||
              'Home Décor'
            )}
          </div>


          <h3>
            ${esc(
              product.name ||
              'Premium Product'
            )}
          </h3>


          <span
            class="rating"
            style="
              display:inline-block;
              background:#388e3c;
              color:#fff;
              padding:2px 5px;
              font-size:10px;
              border-radius:2px;
              margin-bottom:6px;
            "
          >
            ★ 4.5
          </span>


          <div class="price-row">

            <strong>
              ${money(product.price)}
            </strong>

            ${
              product.mrp

                ? `
                  <del>
                    ${money(product.mrp)}
                  </del>
                `

                : ''
            }

          </div>


          ${
            d > 0

              ? `
                <span class="discount">
                  ${d}% off
                </span>
              `

              : ''
          }


          ${
            product.item_code

              ? `
                <div style="
                  color:#777;
                  font-size:10px;
                  margin-top:4px;
                ">
                  Item Code:
                  ${esc(product.item_code)}
                </div>
              `

              : ''
          }


          ${
            out

              ? `
                <div class="stock"
                  style="color:#d32f2f;">
                  Out of Stock
                </div>
              `

              : `
                <div class="stock">
                  ✓ In Stock
                </div>
              `
          }


          <button
            type="button"
            class="add-cart"
            ${out ? 'disabled' : ''}
            onclick="
              event.stopPropagation();
              add('${esc(product.id)}');
            "
          >
            ${out ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>


          <button
            type="button"
            class="buy"
            ${out ? 'disabled' : ''}
            onclick="
              event.stopPropagation();
              buy('${esc(product.id)}');
            "
            style="
              width:100%;
              height:34px;
              border:0;
              background:#fb641b;
              color:#fff;
              font-size:12px;
              font-weight:700;
              margin-top:7px;
              cursor:pointer;
            "
          >
            BUY NOW
          </button>

        </div>

      </article>

    `;

  }).join('');

}


/* =========================================================
   OPEN PRODUCT DETAIL PAGE
   ========================================================= */

function openProduct(id) {

  if (!id) return;

  window.location.href =
    'product.html?id=' +
    encodeURIComponent(id);

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function add(id) {

  const product =
    products.find(
      x => String(x.id) === String(id)
    );


  if (
    !product ||
    Number(product.stock ?? 1) <= 0
  ) {

    return;

  }


  const existing =
    cart.find(
      x => String(x.id) === String(id)
    );


  if (existing) {

    existing.qty++;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price:
        Number(product.price || 0),

      image:
        getMainImage(product),

      qty: 1

    });

  }


  save();

  update();

  toast('Added to cart ✓');

}


/* =========================================================
   BUY NOW
   ========================================================= */

function buy(id) {

  const product =
    products.find(
      x => String(x.id) === String(id)
    );


  if (
    !product ||
    Number(product.stock ?? 1) <= 0
  ) {

    return;

  }


  const existing =
    cart.find(
      x => String(x.id) === String(id)
    );


  if (!existing) {

    cart.push({

      id: product.id,

      name: product.name,

      price:
        Number(product.price || 0),

      image:
        getMainImage(product),

      qty: 1

    });

  }


  save();

  update();


  /* Directly open checkout */
  window.location.href =
    'checkout.html';

}


/* =========================================================
   SAVE CART
   ========================================================= */

function save() {

  localStorage.setItem(
    'canvas_cart',
    JSON.stringify(cart)
  );

}


/* =========================================================
   UPDATE CART
   ========================================================= */

function update() {

  const count =
    document.getElementById('count');

  const totalElement =
    document.getElementById('total');

  const itemsElement =
    document.getElementById('items');

  const emptyElement =
    document.getElementById('empty');


  const quantity =
    cart.reduce(
      (total, item) =>
        total + Number(item.qty || 0),
      0
    );


  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
        Number(item.qty || 0),
      0
    );


  if (count) {
    count.textContent = quantity;
  }


  if (totalElement) {
    totalElement.textContent =
      money(subtotal);
  }


  if (itemsElement) {

    itemsElement.innerHTML =
      cart.map(item => `

        <div class="cart-item">

          ${
            item.image

              ? `
                <img
                  src="${esc(item.image)}"
                  alt="${esc(item.name)}"
                >
              `

              : `
                <div style="
                  width:70px;
                  height:70px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  background:#f5f5f5;
                  font-size:28px;
                ">
                  ✨
                </div>
              `
          }


          <div style="flex:1;">

            <strong>
              ${esc(item.name)}
            </strong>


            <p>
              ${money(item.price)}
            </p>


            <div>

              <button
                type="button"
                onclick="
                  qty(
                    '${esc(item.id)}',
                    -1
                  )
                "
              >
                −
              </button>


              <span style="
                margin:0 8px;
                font-weight:700;
              ">
                ${item.qty}
              </span>


              <button
                type="button"
                onclick="
                  qty(
                    '${esc(item.id)}',
                    1
                  )
                "
              >
                +
              </button>

            </div>


            <button
              type="button"
              onclick="
                removeItem(
                  '${esc(item.id)}'
                )
              "
            >
              Remove
            </button>

          </div>

        </div>

      `).join('');

  }


  if (emptyElement) {

    emptyElement.style.display =
      cart.length ? 'none' : 'block';

  }

}


/* =========================================================
   QUANTITY
   ========================================================= */

function qty(id, change) {

  const item =
    cart.find(
      x => String(x.id) === String(id)
    );


  if (!item) return;


  item.qty += change;


  if (item.qty < 1) {

    cart =
      cart.filter(
        x => String(x.id) !== String(id)
      );

  }


  save();

  update();

}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeItem(id) {

  cart =
    cart.filter(
      x => String(x.id) !== String(id)
    );


  save();

  update();

}


/* =========================================================
   CART OPEN / CLOSE
   ========================================================= */

function openCart() {

  const overlay =
    document.getElementById('overlay');

  if (!overlay) return;

  overlay.classList.add('show');

  update();

}


function closeCart(event) {

  if (
    !event ||
    event.target?.id === 'overlay'
  ) {

    const overlay =
      document.getElementById('overlay');

    if (overlay) {
      overlay.classList.remove('show');
    }

  }

}


/* =========================================================
   SHOP SCROLL
   ========================================================= */

function shop() {

  const section =
    document.getElementById('shop');

  if (section) {

    section.scrollIntoView({
      behavior: 'smooth'
    });

  }

}


/* =========================================================
   CHECKOUT
   ========================================================= */

function checkout() {

  if (!cart.length) {

    toast('Your cart is empty');

    return;

  }


  window.location.href =
    'checkout.html';

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(message) {

  const element =
    document.getElementById('toast');

  if (!element) return;


  element.textContent = message;

  element.classList.add('show');

  clearTimeout(window.canvasToastTimer);


  window.canvasToastTimer =
    setTimeout(() => {

      element.classList.remove('show');

    }, 1600);

}


/* =========================================================
   INITIALIZE
   ========================================================= */

load();

update();
