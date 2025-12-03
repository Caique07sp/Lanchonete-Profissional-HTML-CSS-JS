const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
const cart = document.getElementById("cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsList = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout");
const closeCartBtn = document.getElementById("close-cart");
const cartIcon = document.getElementById("cart-icon");
const cartCount = document.getElementById("cart-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const menuItems = document.querySelectorAll(".menu-item");


let cartItems = [];

// 🔹 Carregar carrinho salvo
const savedCart = localStorage.getItem("cartItems");
if (savedCart) {
    cartItems = JSON.parse(savedCart);
    updateCart();
}

function updateCart() {
    cartItemsList.innerHTML = "";
    let total = 0;
    let count = 0;

    cartItems.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} x${item.qty} - R$ ${(item.price * item.qty).toFixed(2)}
            <span onclick="decreaseItem('${item.name}')" style="cursor:pointer; color:blue; margin-left:10px;">➖</span>
            <span onclick="removeItem('${item.name}')" style="cursor:pointer; color:red; margin-left:10px;">❌</span>
        `;
        cartItemsList.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = count; // atualiza badge
}

// Abrir/fechar menu mobile
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

// Adicionar produtos
const addButtons = document.querySelectorAll(".add-to-cart");

addButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const category = btn.dataset.category;
        addToCart(name, price, category);
        animateToCart(btn);
    });
});

function addToCart(name, price, category) {
    const existing = cartItems.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cartItems.push({ name, price, qty: 1, category });
    }
    updateCart();
    showToast(`${name} adicionado ao carrinho!`);
}
// Clique no ícone abre carrinho
cartIcon.addEventListener("click", openCart);

function updateCart() {
    cartItemsList.innerHTML = "";
    let total = 0;
    let count = 0;

    cartItems.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <span>${item.name} x${item.qty}</span>
          <span>
            R$ ${(item.price * item.qty).toFixed(2)}
            <button class="decrease" data-name="${item.name}" title="Diminuir">➖</button>
            <button class="remove" data-name="${item.name}" title="Remover">❌</button>
          </span>
        `;
        cartItemsList.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = count;

    // 🔹 Salva no LocalStorage
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Delegação de eventos para os botões do carrinho
cartItemsList.addEventListener("click", (e) => {
    const btn = e.target;
    const name = btn.dataset.name;
    if (!name) return;

    if (btn.classList.contains("decrease")) {
        decreaseItem(name);
    } else if (btn.classList.contains("remove")) {
        removeItem(name);
    }
});

function decreaseItem(name) {
    const item = cartItems.find(i => i.name === name);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
        cartItems = cartItems.filter(i => i.name !== name);
    }
    updateCart();
}

function removeItem(name) {
    cartItems = cartItems.filter(item => item.name !== name);
    updateCart();
}

// Abrir carrinho
function openCart() {
    cart.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.classList.add("menu-open");
    cartIcon.style.display = "none"; // esconde o ícone
}



// Fechar carrinho
function closeCart() {
    cart.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    cartIcon.style.display = "block"; // mostra o ícone de novo

}

cartOverlay.addEventListener("click", closeCart);
closeCartBtn.addEventListener("click", closeCart);

// Checkout pelo WhatsApp

checkoutBtn.addEventListener("click", () => {
    if (cartItems.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    // mostra o formulário
    document.getElementById("checkout-form").style.display = "block";
});


checkoutBtn.addEventListener("click", () => {
    if (cartItems.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    document.getElementById("custom-alert").style.display = "flex";
});



document.getElementById("cancel-order").addEventListener("click", () => {
    document.getElementById("custom-alert").style.display = "none";
});

document.getElementById("send-order").addEventListener("click", () => {
    const nome = document.getElementById("nome").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const pagamento = document.getElementById("pagamento").value;

    if (!nome || !endereco || !pagamento) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // 🔹 monta a mensagem apenas uma vez
    let message = "Olá! Gostaria de fazer o pedido:\n\n";
    let total = 0;
    let hasLanche = false;
    let hasBebida = false;

    cartItems.forEach(item => {
        total += item.price * item.qty;
        message += `${item.name} x${item.qty} - R$ ${(item.price * item.qty).toFixed(2)}\n`;

        if (["carne", "frango", "veggie"].includes(item.category)) hasLanche = true;
        if (item.category === "bebida") hasBebida = true;
    });

    // desconto combo
    let discount = 0;
    if (hasLanche && hasBebida) {
        discount = total * 0.10;
        message += `Desconto Combo: - R$ ${discount.toFixed(2)}\n`;
        total -= discount;
    }

    message += `\nTotal: R$ ${total.toFixed(2)}\n`;
    message += `Nome: ${nome}\nEndereço: ${endereco}\nPagamento: ${pagamento}`;

    const whatsappURL = `https://wa.me/5519989469124?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");

    // fecha alert após enviar
    document.getElementById("custom-alert").style.display = "none";
});


function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);

    // Remove após animação
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


function animateToCart(btn) {
    const productImg = btn.closest(".menu-item").querySelector("img");
    const cartIcon = document.getElementById("cart-icon");

    // pega posição da imagem e do ícone
    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // cria clone da imagem
    const flyingImg = productImg.cloneNode(true);
    flyingImg.style.position = "fixed";
    flyingImg.style.left = imgRect.left + "px";
    flyingImg.style.top = imgRect.top + "px";
    flyingImg.style.width = imgRect.width + "px";
    flyingImg.style.height = imgRect.height + "px";
    flyingImg.style.transition = "all 0.8s ease-in-out";
    flyingImg.style.zIndex = 5000;
    document.body.appendChild(flyingImg);

    // força reflow para aplicar transição
    requestAnimationFrame(() => {
        flyingImg.style.left = cartRect.left + "px";
        flyingImg.style.top = cartRect.top + "px";
        flyingImg.style.width = "30px";
        flyingImg.style.height = "30px";
        flyingImg.style.opacity = "0.5";
    });

    // remove clone após animação
    setTimeout(() => {
        flyingImg.remove();
    }, 900);
}
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;

    menuItems.forEach(item => {
      const categories = item.dataset.category.split(" ");
      if (category === "all" || categories.includes(category)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});

// 🔹 Mostrar “Mais vendidos” por padrão
document.querySelector(".filter-btn[data-category='mais-vendidos']").click();
function updateCart() {
    cartItemsList.innerHTML = "";
    let total = 0;
    let count = 0;

    let hasLanche = false;
    let hasBebida = false;

    cartItems.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        if (["carne", "frango", "veggie"].includes(item.category)) hasLanche = true;
        if (item.category === "bebida") hasBebida = true;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>
        R$ ${(item.price * item.qty).toFixed(2)}
        <button class="decrease" data-name="${item.name}" title="Diminuir">➖</button>
        <button class="remove" data-name="${item.name}" title="Remover">❌</button>
      </span>
    `;
        cartItemsList.appendChild(li);
    });

    // aplica desconto se tiver combo
    let discount = 0;
    if (hasLanche && hasBebida) {
        discount = total * 0.10; // 10% de desconto
        total -= discount;

        const discountLi = document.createElement("li");
        discountLi.style.color = "green";
        discountLi.innerHTML = `Desconto Combo: - R$ ${discount.toFixed(2)}`;
        cartItemsList.appendChild(discountLi);
    }

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = count;

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

/// Função para verificar se já aceitou cookies
function checkCookies() {
  const banner = document.getElementById("cookie-banner");
  const accepted = localStorage.getItem("cookiesAccepted");

  if (accepted === "true") {
    banner.style.display = "none"; // não mostra mais
  } else {
    banner.style.display = "flex"; // mostra até aceitar
  }
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", checkCookies);

// Botão de aceitar
document.getElementById("accept-cookies").addEventListener("click", () => {
  localStorage.setItem("cookiesAccepted", "true");
  document.getElementById("cookie-banner").style.display = "none";
});