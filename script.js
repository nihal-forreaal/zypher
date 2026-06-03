document.addEventListener('DOMContentLoaded', () => {
    console.log('Zypher initialized.');

    // Add a simple interaction effect to the glass card
    const card = document.querySelector('.glass-card');
    
    if (card) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            
            // Only apply effect if screen is wide enough to show side-by-side layout
            if (window.innerWidth > 968) {
                card.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            } else {
                card.style.transform = 'none';
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Upload Modal Logic
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openUploadBtn');
    const closeBtn = document.getElementById('closeUploadBtn');
    const dropzone = document.getElementById('dropzone');

    if (modal && openBtn && closeBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            if(files.length) {
                dropzone.querySelector('p').innerHTML = `Selected: <span class="gradient-text">${files[0].name}</span>`;
            }
        });
    }

    // Authentication Modal Logic
    const loginModal = document.getElementById('loginModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    
    let isLoginMode = true;

    if (loginModal && openLoginBtn && closeLoginBtn) {
        openLoginBtn.addEventListener('click', async () => {
            if (openLoginBtn.textContent === 'LOGOUT') {
                if(window.fbLogout) await window.fbLogout();
                return;
            }
            loginModal.classList.remove('hidden');
        });

        closeLoginBtn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
            }
        });

        toggleAuthMode.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                authTitle.textContent = 'Login';
                authSubmitBtn.textContent = 'Login';
                toggleAuthMode.innerHTML = 'Need an account? <span class="gradient-text">Sign up</span>';
            } else {
                authTitle.textContent = 'Sign Up';
                authSubmitBtn.textContent = 'Sign Up';
                toggleAuthMode.innerHTML = 'Already have an account? <span class="gradient-text">Login</span>';
            }
        });

        authSubmitBtn.addEventListener('click', async () => {
            const email = authEmail.value;
            const password = authPassword.value;
            
            if(!email || !password) {
                alert("Please enter email and password.");
                return;
            }

            authSubmitBtn.textContent = 'Loading...';
            try {
                if (isLoginMode) {
                    await window.fbLogin(email, password);
                } else {
                    await window.fbSignup(email, password);
                }
                loginModal.classList.add('hidden');
            } catch (error) {
                alert(error.message);
            } finally {
                authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
            }
        });
    }
});
