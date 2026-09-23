function removeItem(id){cart=cart.filter(i=>String(i.id)!==String(id));save();update()}
function openCart(){document.getElementById('overlay').classList.add('show');update()}function closeCart(e){if(!e||e.target.id==='overlay')document.getElementById('overlay').classList.remove('show')}
function shop(){document.getElementById('shop').scrollIntoView({behavior:'smooth'})}function checkout(){if(!cart.length)return toast('Your cart is empty');alert('Checkout is ready for payment integration.')}function toast(t){let x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove('show'),1600)}
load();update();
document.addEventListener("click", function(e) {
  const card = e.target.closest(".product-card");

  if (!card) return;
  if (e.target.closest("button, a, input, select")) return;

  const id = card.dataset.productId || card.dataset.id;

  if (id) {
    window.location.href =
      "product.html?id=" + encodeURIComponent(id);
  }
});
