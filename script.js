// User Authentication Functions
let currentUser = null;

function showRegister() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
    document.getElementById('login-error').textContent = '';
}

function showLogin() {
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-error').textContent = '';
}

function logout() {
    currentUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('login-form').reset();
    document.getElementById('item-form').reset();
    document.getElementById('items-tbody').innerHTML = '';
}

// Initialize users in localStorage if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Initialize items in localStorage if not exists
if (!localStorage.getItem('items')) {
    localStorage.setItem('items', JSON.stringify([]));
}

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('logged-in-user').textContent = user.username;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('login-error').textContent = '';
        loadItems();
    } else {
        document.getElementById('login-error').textContent = 'Invalid username or password';
    }
});

// Registration Form Submission
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        document.getElementById('register-error').textContent = 'Passwords do not match';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const userExists = users.some(u => u.username === username);
    
    if (userExists) {
        document.getElementById('register-error').textContent = 'Username already exists';
        return;
    }
    
    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('register-form').reset();
    document.getElementById('register-error').textContent = '';
    showLogin();
    document.getElementById('login-error').textContent = 'Registration successful. Please login.';
});

// CRUD Operations for Items
function loadItems() {
    const items = JSON.parse(localStorage.getItem('items'));
    const userItems = items.filter(item => item.user === currentUser.username);
    const tbody = document.getElementById('items-tbody');
    tbody.innerHTML = '';
    
    userItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>
                <button onclick="editItem(${item.id})" class="action-btn edit-btn">Edit</button>
                <button onclick="deleteItem(${item.id})" class="action-btn delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getNextId() {
    const items = JSON.parse(localStorage.getItem('items'));
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

document.getElementById('item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    
    let items = JSON.parse(localStorage.getItem('items'));
    
    if (id) {
        // Update existing item
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { 
                id: parseInt(id), 
                name, 
                description, 
                user: currentUser.username 
            };
        }
    } else {
        // Add new item
        const newItem = {
            id: getNextId(),
            name,
            description,
            user: currentUser.username
        };
        items.push(newItem);
    }
    
    localStorage.setItem('items', JSON.stringify(items));
    this.reset();
    document.getElementById('item-id').value = '';
    document.getElementById('save-btn').textContent = 'Add Item';
    loadItems();
});

function deleteItem(id) {
    // Convert id to number if it's not already
    id = parseInt(id);
    
    // Check if id is valid
    if (isNaN(id)) {
        console.error('Invalid item ID');
        return;
    }

    // Get current items
    let items = JSON.parse(localStorage.getItem('items')) || [];
    
    // Check if item exists
    const itemExists = items.some(item => item.id === id);
    if (!itemExists) {
        console.error('Item not found');
        return;
    }

    // Confirm deletion
    const userConfirmed = confirm('Are you sure you want to delete this item?');
    if (!userConfirmed) return;

    try {
        // Filter out the item to delete
        items = items.filter(item => item.id !== id);
        
        // Save back to localStorage
        localStorage.setItem('items', JSON.stringify(items));
        
        // Refresh the items list
        loadItems();
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('An error occurred while deleting the item');
    }
}