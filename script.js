let products=[],
shown=[],
category='all',
cart=JSON.parse(localStorage.getItem('canvas_cart')||'[]');

const money=n=>'₹'+Number(n||0).toLocaleString('en-IN');

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));

function cat(v){
  category=v;
  document.querySelectorAll('.tabs button')
    .forEach(b=>b.classList.toggle('active',b.dataset.cat===v));

  apply();

  document.getElementById('shop')
    .scrollIntoView({behavior:'smooth'});
}

function kind(v){
  v=String(v||'').toLowerCase();

  if(v.includes('lamp')) return 'lamp';
  if(v.includes('light')) return 'lighting';
  if(v.includes('showpiece')||v.includes('statue')) return 'showpiece';

  return 'decor';
}

function discount(p){
  return Number(p.mrp)>Number(p.price)
    ? Math.round((Number(p.mrp)-Number(p.price))/Number(p.mrp)*100)
    : Number(p.discount||0);
}

async function load(){

  try{

    let r=await supabaseClient
      .from('products')
      .select('*')
      .order('created_at',{ascending:false});

    if(r.error) throw r.error;

    products=r.data||[];

    apply();

  }catch(e){

    console.error(e);

    document.getElementById('products').innerHTML=
      '<div class="loading">Products could not be loaded. Refresh and try again.</div>';
  }
}

function apply(){

  let q=(document.getElementById('search')?.value||'').toLowerCase();

  let s=document.getElementById('sort')?.value||'latest';

  shown=products.filter(p=>
    (category==='all'||kind(p.category)===category)&&
    (!q||`${p.name} ${p.category} ${p.item_code}`
      .toLowerCase()
      .includes(q))
  );

  if(s==='low')
    shown.sort((a,b)=>a.price-b.price);

  if(s==='high')
    shown.sort((a,b)=>b.price-a.price);

  if(s==='discount')
    shown.sort((a,b)=>discount(b)-discount(a));

  if(s==='name')
    shown.sort((a,b)=>String(a.name).localeCompare(String(b.name)));

  render();
}

function render(){

  let el=document.getElementById('products');

  document.getElementById('summary').textContent=
    `${shown.length} product${shown.length===1?'':'s'} available`;

  if(!shown.length){

    el.innerHTML='<div class="loading">No products found.</div>';

    return;
  }

  el.innerHTML=shown.map(p=>{

    let d=discount(p);

    let out=Number(p.stock??1)<=0;

    return `
      <article class="card">

        <div class="pic">

          ${
            p.image
            ? `<img src="${esc(p.image)}" loading="lazy" alt="${esc(p.name)}">`
            : '✨'
          }

          ${
            d
            ? `<span class="badge">${d}% OFF</span>`
            : ''
          }

          ${
            out
            ? '<span class="out">OUT OF STOCK</span>'
            : ''
          }

        </div>

        <div class="body">

          <div class="cat">
            ${esc(p.category||'Home Décor')}
          </div>

          <div class="title">
            ${esc(p.name||'Premium Product')}
          </div>

          <span class="rating">
            ★ 4.5
          </span>

          <div>

            <span class="price">
              ${money(p.price)}
            </span>

            ${
              p.mrp
              ? `<span class="mrp">${money(p.mrp)}</span>`
              : ''
            }

            ${
              d
              ? `<span class="off">${d}% off</span>`
              : ''
            }

          </div>

          <button
            class="add"
            ${out?'disabled':''}
            onclick="add('${esc(p.id)}')"
          >
            ${out?'OUT OF STOCK':'ADD TO CART'}
          </button>

          <button
            class="buy"
            ${out?'disabled':''}
            onclick="buy('${esc(p.id)}')"
          >
            BUY NOW
          </button>

        </div>

      </article>
    `;

  }).join('');
}

function add(id){

  let p=products.find(x=>String(x.id)===String(id));

  if(!p||Number(p.stock??1)<=0) return;

  let i=cart.find(x=>String(x.id)===String(id));

  i
    ? i.qty++
    : cart.push({
        id:p.id,
        name:p.name,
        price:Number(p.price||0),
        image:p.image||'',
        qty:1
      });

  save();

  update();

  toast('Added to cart ✓');
}

function buy(id){

  add(id);

  openCart();
}

function save(){

  localStorage.setItem(
    'canvas_cart',
    JSON.stringify(cart)
  );
}

function update(){

  document.getElementById('count').textContent=
    cart.reduce((a,x)=>a+x.qty,0);

  let total=
    cart.reduce((a,x)=>a+x.price*x.qty,0);

  document.getElementById('total').textContent=
    money(total);

  document.getElementById('items').innerHTML=
    cart.map(x=>`

      <div class="item">

        <img
          class="thumb"
          src="${esc(x.image)}"
        >

        <div class="info">

          <b>${esc(x.name)}</b>

          <strong>
            ${money(x.price)}
          </strong>

          <div>

            <button
              onclick="qty('${esc(x.id)}',-1)"
            >
              −
            </button>

            ${x.qty}

            <button
              onclick="qty('${esc(x.id)}',1)"
            >
              +
            </button>

          </div>

          <button
            class="remove"
            onclick="removeItem('${esc(x.id)}')"
          >
            Remove
          </button>

        </div>

      </div>

    `).join('');

  document.getElementById('empty').style.display=
    cart.length?'none':'block';
}

function qty(id,d){

  let x=cart.find(
    i=>String(i.id)===String(id)
  );

  if(!x) return;

  x.qty+=d;

  if(x.qty<1){

    cart=cart.filter(
      i=>String(i.id)!==String(id)
    );

  }

  save();

  update();
}

function removeItem(id){

  cart=cart.filter(
    i=>String(i.id)!==String(id)
  );

  save();

  update();
}

function openCart(){

  document.getElementById('overlay')
    .classList.add('show');

  update();
}

function closeCart(e){

  if(!e||e.target.id==='overlay'){

    document.getElementById('overlay')
      .classList.remove('show');

  }
}

function shop(){

  document.getElementById('shop')
    .scrollIntoView({behavior:'smooth'});
}


/* CHECKOUT */

function checkout(){

  if(!cart.length){

    return toast('Your cart is empty');

  }

  window.location.href='checkout.html';
}


function toast(t){

  let x=document.getElementById('toast');

  x.textContent=t;

  x.classList.add('show');

  clearTimeout(window.tt);

  window.tt=setTimeout(
    ()=>x.classList.remove('show'),
    1600
  );
}

load();

update();
