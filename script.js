document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'lavelle_cart';
  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');

  function formatRupiah(num) {
    return 'Rp' + Number(num).toLocaleString('id-ID');
  }

  function renderCart() {
    if (cartCountEl) {
      cartCountEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<li class="list-group-item text-muted text-center py-3">Keranjang masih kosong.</li>';
      cartTotalEl.textContent = 'Rp0';
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
      li.innerHTML = `
        <div>
          <div class="fw-semibold small">${item.name}</div>
          <small class="text-muted">${item.qty} x ${formatRupiah(item.price)}</small>
        </div>
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" data-dec="${index}">-</button>
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" data-inc="${index}">+</button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2 ms-1" data-remove="${index}">&times;</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });

    cartTotalEl.textContent = formatRupiah(total);
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  document.addEventListener('click', (e) => {
    const orderBtn = e.target.closest('.btn-order');
    if (orderBtn) {
      const name = orderBtn.dataset.name;
      const price = parseInt(orderBtn.dataset.price, 10);
      const existing = cart.find(item => item.name === name);

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      saveCart();
      const modalEl = document.getElementById('cartModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    }

    if (e.target.dataset.remove !== undefined) {
      cart.splice(parseInt(e.target.dataset.remove, 10), 1);
      saveCart();
    } else if (e.target.dataset.inc !== undefined) {
      cart[parseInt(e.target.dataset.inc, 10)].qty += 1;
      saveCart();
    } else if (e.target.dataset.dec !== undefined) {
      const idx = parseInt(e.target.dataset.dec, 10);
      if (cart[idx].qty > 1) {
        cart[idx].qty -= 1;
      } else {
        cart.splice(idx, 1);
      }
      saveCart();
    }
  });

  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    cart = [];
    saveCart();
  });

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) return;
    window.location.href = 'kontak.html';
  });

  // Filter kategori di halaman menu.html
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'btn-cocoa'));
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.add('btn-outline-cocoa'));
      btn.classList.remove('btn-outline-cocoa');
      btn.classList.add('active', 'btn-cocoa');

      const category = btn.dataset.filter;
      document.querySelectorAll('.menu-item').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Form konfirmasi pesanan di kontak.html
  const orderForm = document.getElementById('orderForm');
  const summaryBox = document.getElementById('checkoutSummary');
  if (summaryBox) {
    if (cart.length === 0) {
      summaryBox.innerHTML = '<p class="text-muted small mb-0">Belum ada item di keranjang. Silakan pilih kue dari halaman Beranda atau Menu.</p>';
    } else {
      let total = 0;
      let html = '<ul class="list-group list-group-flush mb-2">';
      cart.forEach(item => {
        total += item.price * item.qty;
        html += `<li class="list-group-item bg-transparent d-flex justify-content-between px-0 py-1 small">
          <span>${item.name} (${item.qty}x)</span>
          <span class="fw-semibold">${formatRupiah(item.price * item.qty)}</span>
        </li>`;
      });
      html += `</ul><div class="d-flex justify-content-between fw-bold border-top pt-2">
        <span>Total</span><span class="text-cocoa">${formatRupiah(total)}</span>
      </div>`;
      summaryBox.innerHTML = html;
    }
  }

  orderForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('custName').value;
    const tanggal = document.getElementById('custDate').value;
    const alertEl = document.getElementById('orderAlert');
    alertEl.className = 'alert alert-success mt-3';
    alertEl.textContent = `Terima kasih, ${nama}! Pesanan Anda untuk tanggal ${tanggal} telah dicatat. Tim Lavelle Cakes akan segera menghubungi via WhatsApp.`;
    cart = [];
    saveCart();
    orderForm.reset();
  });

  renderCart();
});
