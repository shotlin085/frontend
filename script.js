let API_URL = 'http://localhost:4000/api/users'; // Default fallback

const form = document.getElementById('add-user-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const usersList = document.getElementById('users-list');
const statusMessage = document.getElementById('status-message');
const submitBtn = document.getElementById('submit-btn');

// Fetch and parse .env file
async function loadEnv() {
  try {
    const res = await fetch('.env');
    if (!res.ok) throw new Error('Cannot load .env');
    const text = await res.text();
    
    text.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1].trim() === 'API_URL') {
        API_URL = match[2].trim();
      }
    });
  } catch (err) {
    console.warn('Could not load .env file, using default API_URL.');
  }
}

// Load users on startup
async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error(err);
    usersList.innerHTML = `<div class="status-error">Error connecting to the backend API.</div>`;
  }
}

function renderUsers(users) {
  if (users.length === 0) {
    usersList.innerHTML = '<div style="color: var(--text-secondary)">No users found.</div>';
    return;
  }
  
  usersList.innerHTML = '';
  users.forEach((user, index) => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
      <div class="user-name">${user.name}</div>
      <div class="user-email">${user.email}</div>
    `;
    usersList.appendChild(card);
  });
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'status-error' : 'status-success';
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = '';
  }, 3000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  
  if (!name || !email) return;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create user');
    }
    
    // Success
    showStatus('User created successfully!');
    nameInput.value = '';
    emailInput.value = '';
    
    // Refresh the list
    fetchUsers();
  } catch (err) {
    console.error(err);
    showStatus(err.message, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create User';
  }
});

// Init
async function init() {
  await loadEnv();
  fetchUsers();
}

init();
