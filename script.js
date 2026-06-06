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

    // Removed upload logic as per user request

    // Authentication Modal Logic
    const loginModal = document.getElementById('loginModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    
    // Support Modal Logic
    const supportModal = document.getElementById('supportModal');
    const openSupportBtn = document.getElementById('openSupportBtn');
    const closeSupportBtn = document.getElementById('closeSupportBtn');
    const submitSupporterBtn = document.getElementById('submitSupporterBtn');
    const supporterName = document.getElementById('supporterName');
    const supporterMessage = document.getElementById('supporterMessage');
    const supportersList = document.getElementById('supportersList');

    const loadSupporters = async () => {
        if (!window.fbGetSupporters) return;
        const supporters = await window.fbGetSupporters();
        supportersList.innerHTML = '';
        if (supporters.length === 0) {
            supportersList.innerHTML = '<li style="padding: 0.5rem 0; color: #64748b;">No recent supporters yet. Be the first!</li>';
            return;
        }
        supporters.forEach(supporter => {
            const li = document.createElement('li');
            li.style.cssText = 'padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); color: #1e293b; font-weight: 600;';
            li.innerHTML = `🌟 ${supporter.name}`;
            supportersList.appendChild(li);
        });
    };

    if (openSupportBtn && supportModal) {
        openSupportBtn.addEventListener('click', () => {
            supportModal.classList.remove('hidden');
            loadSupporters();
        });
        closeSupportBtn.addEventListener('click', () => supportModal.classList.add('hidden'));
        supportModal.addEventListener('click', (e) => {
            if (e.target === supportModal) supportModal.classList.add('hidden');
        });
    }

    if (submitSupporterBtn) {
        submitSupporterBtn.addEventListener('click', async () => {
            const name = supporterName.value.trim();
            if (!name) {
                alert("Please enter your name!");
                return;
            }
            submitSupporterBtn.textContent = 'Submitting...';
            submitSupporterBtn.disabled = true;
            try {
                await window.fbAddSupporter(name);
                supporterName.value = '';
                alert("Thank you! Your support has been submitted and will appear on the site once approved by the admin.");
                await loadSupporters();
            } catch (error) {
                alert("Failed to submit message. Please try again.");
            } finally {
                submitSupporterBtn.textContent = 'Submit for Approval';
                submitSupporterBtn.disabled = false;
            }
        });
    }
    
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
                if(forgotPasswordBtn) forgotPasswordBtn.style.display = 'block';
            } else {
                authTitle.textContent = 'Sign Up';
                authSubmitBtn.textContent = 'Sign Up';
                toggleAuthMode.innerHTML = 'Already have an account? <span class="gradient-text">Login</span>';
                if(forgotPasswordBtn) forgotPasswordBtn.style.display = 'none';
            }
        });

        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', async () => {
                const email = authEmail.value;
                if (!email) {
                    alert("Please enter your email address in the box above first.");
                    return;
                }
                try {
                    forgotPasswordBtn.textContent = 'Sending...';
                    await window.fbResetPassword(email);
                    alert("Password reset email sent! Please check your inbox (and your spam/junk folder).");
                } catch (error) {
                    alert("Error: " + error.message);
                } finally {
                    forgotPasswordBtn.textContent = 'Forgot Password?';
                }
            });
        }

        authSubmitBtn.addEventListener('click', async () => {
            const email = authEmail.value;
            const password = authPassword.value;
            
            if(!email || !password) {
                alert("Please enter email and password.");
                return;
            }

            authSubmitBtn.textContent = 'Security Check...';
            try {
                // Execute reCAPTCHA Enterprise security check
                await new Promise((resolve, reject) => {
                    if (typeof grecaptcha === 'undefined' || typeof grecaptcha.enterprise === 'undefined') {
                        console.warn('reCAPTCHA not loaded, proceeding without it.');
                        resolve();
                        return;
                    }
                    grecaptcha.enterprise.ready(async () => {
                        try {
                            const token = await grecaptcha.enterprise.execute('6LcDBwstAAAAAE4iEHxqNbNHRfoHAcPvZrurd9Cx', {action: 'login'});
                            if (!token) throw new Error("Security check failed.");
                            resolve();
                        } catch(e) {
                            reject(e);
                        }
                    });
                });

                authSubmitBtn.textContent = 'Loading...';
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

        const googleSignInBtn = document.getElementById('googleSignInBtn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', async () => {
                try {
                    googleSignInBtn.innerHTML = 'Signing in...';
                    await window.fbGoogleSignIn();
                    loginModal.classList.add('hidden');
                } catch (error) {
                    alert("Google Sign-In failed: " + error.message);
                } finally {
                    googleSignInBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Continue with Google`;
                }
            });
        }
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
                            <p>${asset.info || 'Verified Upload'}</p>
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
