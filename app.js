// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAwNsZFIlbkdce8z74HxEHPRmu2X26J3yo",
    authDomain: "dbismi.firebaseapp.com",
    databaseURL: "https://dbismi-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dbismi",
    storageBucket: "dbismi.firebasestorage.app",
    messagingSenderId: "327228156495",
    appId: "1:327228156495:web:6f2c144f7af40610f7183a"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const productsContainer = document.getElementById('products');
const productModal = document.getElementById('productModal');
const modalMainImage = document.getElementById('modalMainImage');
const thumbnailsContainer = document.getElementById('thumbnails');
const modalProductTitle = document.getElementById('modalProductTitle');
const modalProductDescription = document.getElementById('modalProductDescription');
const shopeeBtn = document.getElementById('shopeeBtn');
const waBtn = document.getElementById('waBtn');
const closeModal = document.querySelector('.close');

// Ambil data produk dari Firebase
function fetchProducts() {
    database.ref('products').once('value', (snapshot) => {
        const products = snapshot.val();
        if (products) {
            renderProducts(products);
        } else {
            productsContainer.innerHTML = '<p class="no-products">Tidak ada produk yang tersedia saat ini.</p>';
        }
    });
}

// Render produk ke halaman
function renderProducts(products) {
    productsContainer.innerHTML = '';
    
    Object.keys(products).forEach(key => {
        const product = products[key];
        const firstImage = product.images ? product.images[0] : 'https://via.placeholder.com/300';
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = key;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${firstImage}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
            </div>
        `;
        
        productCard.addEventListener('click', () => openProductModal(key, product));
        productsContainer.appendChild(productCard);
    });
}

// Buka modal produk
function openProductModal(productId, product) {
    modalProductTitle.textContent = product.title;
    modalProductDescription.textContent = product.description;
    shopeeBtn.href = product.shopeeLink || '#';
    waBtn.href = `https://wa.me/${product.waNumber}?text=Saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.title)}`;
    
    // Set gambar utama dan thumbnail
    thumbnailsContainer.innerHTML = '';
    if (product.images && product.images.length > 0) {
        modalMainImage.src = product.images[0];
        
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            
            const img = document.createElement('img');
            img.src = image;
            img.alt = `Thumbnail ${index + 1}`;
            
            thumbnail.appendChild(img);
            thumbnail.addEventListener('click', () => {
                modalMainImage.src = image;
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else {
        modalMainImage.src = 'https://via.placeholder.com/500';
    }
    
    productModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Tutup modal
closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Tutup modal ketika klik di luar konten
window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Load produk saat halaman dimuat
window.addEventListener('DOMContentLoaded', fetchProducts);
// Tambahkan kode ini ke file app.js yang sudah ada

// DOM Elements baru
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const bannerSlidesContainer = document.getElementById('bannerSlides');
const slideDotsContainer = document.getElementById('slideDots');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');

// Banner Slider Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

function startSlider() {
    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }, 5000); // Ganti slide setiap 5 detik
}

function updateSlider() {
    // Update slide position
    document.querySelector('.slides-container').style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetSliderTimer();
}

function resetSliderTimer() {
    clearInterval(slideInterval);
    startSlider();
}

// Event listeners untuk tombol slider
document.getElementById('prevSlide').addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    resetSliderTimer();
});

document.getElementById('nextSlide').addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    resetSliderTimer();
});

// Event listeners untuk dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
});

// Mulai slider saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    startSlider();
});
// Variabel global
let allProducts = [];
let visibleProducts = 8; // Jumlah produk awal yang ditampilkan
const productsPerLoad = 4; // Jumlah produk tambahan saat klik Show More

// Fungsi fetchProducts diubah menjadi:
function fetchProducts() {
    database.ref('products').once('value', (snapshot) => {
        const products = snapshot.val();
        if (products) {
            // Simpan semua produk di variabel global
            allProducts = Object.entries(products).map(([id, product]) => ({ id, ...product }));
            renderProducts();
        } else {
            productsContainer.innerHTML = '<p class="no-products">Tidak ada produk yang tersedia saat ini.</p>';
        }
    });
}

// Fungsi renderProducts baru:
function renderProducts() {
    productsContainer.innerHTML = '';
    
    // Tampilkan hanya produk yang terlihat
    const productsToShow = allProducts.slice(0, visibleProducts);
    
    productsToShow.forEach(product => {
        const firstImage = product.images ? product.images[0] : 'https://via.placeholder.com/300';
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${firstImage}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
            </div>
        `;
        
        productCard.addEventListener('click', () => openProductModal(product.id, product));
        productsContainer.appendChild(productCard);
    });
    
    // Sembunyikan tombol jika semua produk sudah ditampilkan
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (visibleProducts >= allProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

// Fungsi untuk menangani Show More
document.getElementById('loadMoreBtn').addEventListener('click', function() {
    // Animasi klik
    this.classList.add('clicked');
    setTimeout(() => this.classList.remove('clicked'), 500);
    
    // Tambah jumlah produk yang terlihat
    visibleProducts += productsPerLoad;
    
    // Render ulang produk
    renderProducts();
    
    // Scroll halus ke produk baru
    const lastProduct = document.querySelector('.product-card:last-child');
    if (lastProduct) {
        lastProduct.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Fungsi searchProducts diubah untuk mendukung Show More:
function searchProducts(query) {
    const filtered = allProducts.filter(product => {
        const searchText = `${product.title} ${product.description}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    // Reset visible products saat pencarian
    visibleProducts = 8;
    
    // Simpan hasil pencarian di allProducts
    allProducts = filtered;
    renderProducts();
}

// Load produk saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    // Fungsi lainnya tetap sama...
});