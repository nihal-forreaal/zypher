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

        let selectedFile = null;
        const fileInput = document.getElementById('fileInput');

        // Click to browse
        if (fileInput) {
            dropzone.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    selectedFile = e.target.files[0];
                    dropzone.querySelector('p').innerHTML = `Selected: <span class="gradient-text">${selectedFile.name}</span>`;
                }
            });
        }

        dropzone.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            if(files.length) {
                selectedFile = files[0];
                dropzone.querySelector('p').innerHTML = `Selected: <span class="gradient-text">${selectedFile.name}</span>`;
            }
        });

        const confirmUploadBtn = document.getElementById('confirmUploadBtn');
        if (confirmUploadBtn) {
            confirmUploadBtn.addEventListener('click', async () => {
                if (!selectedFile) {
                    alert("Please select a file first.");
                    return;
                }
                try {
                    confirmUploadBtn.textContent = 'Uploading...';
                    await window.fbUploadAsset(selectedFile, selectedFile.name, 'Uploaded via Web', (progress) => {
                        confirmUploadBtn.textContent = `Uploading... ${Math.round(progress)}%`;
                    });
                    alert('Upload successful!');
                    modal.classList.add('hidden');
                    selectedFile = null;
                    dropzone.querySelector('p').innerHTML = `Drag and drop your file here, or <span class="gradient-text">click to browse</span>`;
                    
                    // Re-render the gallery to show the new asset immediately!
                    if (typeof renderAssets === 'function') {
                        renderAssets();
                    }
                } catch (error) {
                    alert("Upload failed: " + error.message);
                } finally {
                    confirmUploadBtn.textContent = 'Upload';
                }
            });
        }
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

    // Dynamic Asset Loading
    const assetGrid = document.getElementById('assetGrid');
    
    async function renderAssets() {
        if (!assetGrid) return;
        
        // Wait for Firebase module to load
        if (typeof window.fbGetAssets !== 'function') {
            setTimeout(renderAssets, 100);
            return;
        }

        try {
            const assets = await window.fbGetAssets();
            if (assets && assets.length > 0) {
                assetGrid.innerHTML = ''; // Clear hardcoded examples
                assets.forEach(asset => {
                    const card = document.createElement('div');
                    card.className = 'asset-card';
                    card.innerHTML = `
                        <div class="asset-thumbnail" style="background: linear-gradient(45deg, #1e293b, #0f172a);"></div>
                        <div class="asset-info">
                            <h4>${asset.title || 'Untitled Asset'}</h4>
                            <p>${asset.info || 'Uploaded by ' + (asset.uploaderEmail || 'Community')}</p>
                            <button class="download-btn" onclick="window.open('${asset.fileUrl}', '_blank')">Download</button>
                        </div>
                    `;
                    assetGrid.appendChild(card);
                });
            }
        } catch(e) {
            console.error("Failed to load dynamic assets:", e);
        }
    }
    
    // Call render once on load, and also when an upload finishes!
    renderAssets();

    // Re-render after successful upload
    if (confirmUploadBtn) {
        const oldUploadListener = confirmUploadBtn.onclick; // Not strictly needed as we used addEventListener, but we can hook into it
        confirmUploadBtn.addEventListener('click', () => {
            // we will just wait a bit after upload and refresh
        });
    }

});
