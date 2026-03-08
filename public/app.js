const API_BASE = '/api';

// State
let token = localStorage.getItem('auth_token') || null;
let user = JSON.parse(localStorage.getItem('user')) || null;
let isLoginMode = true; 
let currentPage = 1;
let currentFilters = { status: '', search: '' };

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashSection = document.getElementById('dashboard-section');
const navMenu = document.getElementById('nav-menu');
const welcomeMsg = document.getElementById('welcome-message');

// Forms & Inputs
const authForm = document.getElementById('auth-form');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthLink = document.getElementById('toggle-auth-link');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authError = document.getElementById('auth-error');
const authErrorText = document.getElementById('auth-error-text');

const nameGroup = document.getElementById('name-group');
const passConfirmGroup = document.getElementById('password-confirm-group');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('password_confirmation');

const logoutBtn = document.getElementById('logout-btn');

// Task DOM
const taskList = document.getElementById('task-list');
const newTaskBtn = document.getElementById('new-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelModalBtn = document.getElementById('cancel-modal');
const taskForm = document.getElementById('task-form');
const taskError = document.getElementById('task-error');
const taskErrorText = document.getElementById('task-error-text');

// Pagination/Filter DOM
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('filter-status');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    attachEventListeners();
});

// --- Auth UI Management ---
function checkAuth() {
    if (token) {
        showDashboard();
        fetchTasks();
    } else {
        showAuth();
    }
}

function showAuth() {
    authSection.classList.remove('hidden');
    dashSection.classList.add('hidden');
    navMenu.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashSection.classList.remove('hidden');
    navMenu.classList.remove('hidden');
    if (user) welcomeMsg.textContent = `${user.name}`;
}

function toggleAuthMode(e) {
    if(e) e.preventDefault();
    isLoginMode = !isLoginMode;
    authError.classList.add('hidden');
    
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Log in to manage your tasks beautifully.';
        authSubmitBtn.innerHTML = `Access Account <i class='bx bx-right-arrow-alt'></i>`;
        nameGroup.classList.add('hidden');
        passConfirmGroup.classList.add('hidden');
        nameInput.required = false;
        confirmInput.required = false;
        document.getElementById('auth-toggle-text').innerHTML = `Don't have an account? <a href="#" id="toggle-auth-link">Register here</a>`;
    } else {
        authTitle.textContent = 'Create an Account';
        authSubtitle.textContent = 'Join us and boost your productivity.';
        authSubmitBtn.innerHTML = `Register Account <i class='bx bx-user-plus'></i>`;
        nameGroup.classList.remove('hidden');
        passConfirmGroup.classList.remove('hidden');
        nameInput.required = true;
        confirmInput.required = true;
        document.getElementById('auth-toggle-text').innerHTML = `Already have an account? <a href="#" id="toggle-auth-link">Login here</a>`;
    }
    document.getElementById('toggle-auth-link').addEventListener('click', toggleAuthMode);
}

// --- Fetch Wrapper ---
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                handleLogout(); // Auto-logout if token expired
            }
            throw new Error(data.message || 'API Request Failed');
        }
        return data;
    } catch (error) {
        throw error;
    }
}

// --- Auth Actions ---
async function handleAuth(e) {
    e.preventDefault();
    authError.classList.add('hidden');

    const payload = { email: emailInput.value, password: passwordInput.value };
    if (!isLoginMode) {
        payload.name = nameInput.value;
        payload.password_confirmation = confirmInput.value;
    }

    const endpoint = isLoginMode ? '/login' : '/register';

    try {
        const res = await apiRequest(endpoint, 'POST', payload);
        token = res.data.access_token;
        user = res.data.user;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        authForm.reset();
        checkAuth();
    } catch (error) {
        authErrorText.textContent = error.message;
        authError.classList.remove('hidden');
    }
}

async function handleLogout() {
    try {
        if (token) await apiRequest('/logout', 'POST'); 
    } catch (e) {} // ignore errors
    
    token = null;
    user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    checkAuth();
}

// --- Task Actions ---
async function fetchTasks(page = 1) {
    try {
        taskList.innerHTML = `<div class="loading-state"><i class='bx bx-loader-alt bx-spin'></i> Loading tasks...</div>`;
        let url = `/tasks?page=${page}`;
        if (currentFilters.status) url += `&status=${currentFilters.status}`;
        if (currentFilters.search) url += `&search=${currentFilters.search}`;

        const res = await apiRequest(url);
        renderTasks(res.data.data);
        updatePagination(res.data);
    } catch (error) {
        console.error("Failed fetching tasks:", error);
        taskList.innerHTML = `<div class="loading-state" style="color:var(--danger)"><i class='bx bx-error'></i> Failed to load tasks.</div>`;
    }
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = `<div class="loading-state"><i class='bx bx-folder-open'></i> <p>No tasks found.</p></div>`;
        return;
    }

    tasks.forEach(task => {
        const el = document.createElement('div');
        el.className = 'task-card';
        
        const statusIcon = task.status === 'completed' ? `<i class='bx bx-check-circle'></i>` : `<i class='bx bx-time-five'></i>`;
        
        el.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p class="task-desc">${task.description || 'No description provided.'}</p>
                <div class="task-meta">
                    <span class="badge ${task.status}">${statusIcon} ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                    ${task.due_date ? `<span class="task-date"><i class='bx bx-calendar'></i> ${task.due_date}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="openEditModal(${task.id})"><i class='bx bx-edit-alt'></i> Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})"><i class='bx bx-trash'></i> Delete</button>
            </div>
        `;
        taskList.appendChild(el);
    });
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    taskError.classList.add('hidden');

    const id = document.getElementById('task-id').value;
    const payload = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        status: document.getElementById('task-status').value,
        due_date: document.getElementById('task-due').value || null
    };

    try {
        if (id) {
            await apiRequest(`/tasks/${id}`, 'PUT', payload);
        } else {
            await apiRequest('/tasks', 'POST', payload);
        }
        closeModal();
        fetchTasks(currentPage);
    } catch (error) {
        taskErrorText.textContent = error.message;
        taskError.classList.remove('hidden');
    }
}

async function deleteTask(id) {
    if(!confirm("Are you sure you want to permanently delete this task?")) return;
    try {
        await apiRequest(`/tasks/${id}`, 'DELETE');
        fetchTasks(currentPage);
    } catch (e) {
        alert(e.message);
    }
}

// --- Task UI Helpers ---
function openNewModal() {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('modal-title').textContent = 'Create New Task';
    taskError.classList.add('hidden');
    taskModal.classList.remove('hidden');
}

async function openEditModal(id) {
    taskError.classList.add('hidden');
    taskModal.classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Loading details...';
    
    try {
        const res = await apiRequest(`/tasks/${id}`);
        const task = res.data;
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-due').value = task.due_date || '';
        document.getElementById('modal-title').textContent = 'Edit Task';
    } catch (error) {
        closeModal();
        alert('Failed to load task details');
    }
}

function closeModal() {
    taskModal.classList.add('hidden');
}

// --- Pagination & Filtering Helpers ---
function updatePagination(meta) {
    currentPage = meta.current_page;
    pageInfo.textContent = `Page ${meta.current_page} of ${Math.max(meta.last_page, 1)}`;
    
    if (meta.last_page <= 1) {
        document.getElementById('pagination-controls').classList.add('hidden');
    } else {
        document.getElementById('pagination-controls').classList.remove('hidden');
    }

    prevBtn.disabled = !meta.prev_page_url;
    nextBtn.disabled = !meta.next_page_url;
}

function handleSearch() {
    currentFilters.search = searchInput.value;
    currentPage = 1;
    fetchTasks();
}

function handleFilter() {
    currentFilters.status = statusFilter.value;
    currentPage = 1;
    fetchTasks();
}

// --- Event Listeners ---
function attachEventListeners() {
    toggleAuthLink.addEventListener('click', toggleAuthMode);
    authForm.addEventListener('submit', handleAuth);
    logoutBtn.addEventListener('click', handleLogout);

    newTaskBtn.addEventListener('click', openNewModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleTaskSubmit);

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleSearch(); });
    statusFilter.addEventListener('change', handleFilter);

    prevBtn.addEventListener('click', () => fetchTasks(currentPage - 1));
    nextBtn.addEventListener('click', () => fetchTasks(currentPage + 1));
}
