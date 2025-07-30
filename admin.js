// Konfigurasi Firebase (sama dengan di app.js)
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
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productTitleInput = document.getElementById('productTitle');
const productDescriptionInput = document.getElementById('productDescription');
const shopeeLinkInput = document.getElementById('shopeeLink');
const waNumberInput = document.getElementById('waNumber');
const imageInputsContainer = document.getElementById('imageInputs');
const addImageBtn = document.getElementById('addImageBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const productListContainer = document.getElementById('productList');

// Tambah input gambar
addImageBtn.addEventListener('click', () => {
    const imageCount = document.querySelectorAll('.image-input').length;
    if (imageCount >= 5) {
        alert('Maksimal 5 gambar per produk');
        return;
    }
    
    const imageInput = document.createElement('div');
    imageInput.className = 'image-input';
    imageInput.innerHTML = `
        <input type="url" class="imageUrl" placeholder="https://example.com/image.jpg">
        <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
    `;
    
    imageInputsContainer.appendChild(imageInput);
    
    // Tambahkan event listener untuk tombol hapus
    imageInput.querySelector('.remove-image-btn').addEventListener('click', () => {
        imageInput.remove();
    });
});

// Reset form
resetFormBtn.addEventListener('click', resetForm);

function resetForm() {
    productForm.reset();
    productIdInput.value = '';
    imageInputsContainer.innerHTML = `
        <div class="image-input">
            <input type="url" class="imageUrl" placeholder="https://example.com/image1.jpg">
            <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Tambahkan event listener untuk tombol hapus yang baru
    document.querySelector('.remove-image-btn').addEventListener('click', function() {
        this.parentElement.remove();
    });
}

// Submit form
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Kumpulkan URL gambar
    const imageUrls = [];
    document.querySelectorAll('.imageUrl').forEach(input => {
        if (input.value.trim() !== '') {
            imageUrls.push(input.value.trim());
        }
    });
    
    if (imageUrls.length === 0) {
        alert('Harap masukkan minimal 1 gambar produk');
        return;
    }
    
    // Buat objek produk
    const product = {
        title: productTitleInput.value.trim(),
        description: productDescriptionInput.value.trim(),
        shopeeLink: shopeeLinkInput.value.trim(),
        waNumber: waNumberInput.value.trim(),
        images: imageUrls,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Simpan ke Firebase
    const productId = productIdInput.value;
    if (productId) {
        // Update produk yang ada
        database.ref(`products/${productId}`).update(product)
            .then(() => {
                alert('Produk berhasil diperbarui!');
                resetForm();
                fetchProducts();
            })
            .catch(error => {
                console.error('Error updating product: ', error);
                alert('Gagal memperbarui produk');
            });
    } else {
        // Tambah produk baru
        database.ref('products').push(product)
            .then(() => {
                alert('Produk berhasil ditambahkan!');
                resetForm();
                fetchProducts();
            })
            .catch(error => {
                console.error('Error adding product: ', error);
                alert('Gagal menambahkan produk');
            });
    }
});

// Ambil data produk untuk ditampilkan di list
function fetchProducts() {
    database.ref('products').once('value', (snapshot) => {
        const products = snapshot.val();
        productListContainer.innerHTML = '';
        
        if (products) {
            Object.keys(products).forEach(key => {
                const product = products[key];
                const firstImage = product.images ? product.images[0] : '';
                
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-actions">
                        <button class="edit-btn" data-id="${key}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${key}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                productListContainer.appendChild(productItem);
            });
            
            // Tambahkan event listener untuk tombol edit dan hapus
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editProduct(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
            });
        } else {
            productListContainer.innerHTML = '<p>Tidak ada produk yang tersedia.</p>';
        }
    });
}

// Edit produk
function editProduct(productId) {
    database.ref(`products/${productId}`).once('value', (snapshot) => {
        const product = snapshot.val();
        
        if (product) {
            productIdInput.value = productId;
            productTitleInput.value = product.title || '';
            productDescriptionInput.value = product.description || '';
            shopeeLinkInput.value = product.shopeeLink || '';
            waNumberInput.value = product.waNumber || '';
            
            // Set gambar
            imageInputsContainer.innerHTML = '';
            if (product.images && product.images.length > 0) {
                product.images.forEach((imageUrl, index) => {
                    const imageInput = document.createElement('div');
                    imageInput.className = 'image-input';
                    imageInput.innerHTML = `
                        <input type="url" class="imageUrl" value="${imageUrl}" placeholder="https://example.com/image${index + 1}.jpg">
                        <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
                    `;
                    
                    imageInputsContainer.appendChild(imageInput);
                    
                    // Tambahkan event listener untuk tombol hapus
                    imageInput.querySelector('.remove-image-btn').addEventListener('click', () => {
                        imageInput.remove();
                    });
                });
            } else {
                imageInputsContainer.innerHTML = `
                    <div class="image-input">
                        <input type="url" class="imageUrl" placeholder="https://example.com/image1.jpg">
                        <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
                    </div>
                `;
                
                // Tambahkan event listener untuk tombol hapus yang baru
                document.querySelector('.remove-image-btn').addEventListener('click', function() {
                    this.parentElement.remove();
                });
            }
            
            // Scroll ke form
            document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Hapus produk
function deleteProduct(productId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        database.ref(`products/${productId}`).remove()
            .then(() => {
                alert('Produk berhasil dihapus!');
                fetchProducts();
            })
            .catch(error => {
                console.error('Error deleting product: ', error);
                alert('Gagal menghapus produk');
            });
    }
}

// Load produk saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Inisialisasi tombol hapus untuk input gambar pertama
    document.querySelector('.remove-image-btn').addEventListener('click', function() {
        this.parentElement.remove();
    });
});