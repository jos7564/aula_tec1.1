class CommentSystem {
    constructor() {
        this.comments = [];
        this.currentUser = null;
        this.maxComments = 10000; // Aumentado a 10000 comentarios
        this.refreshInterval = 5000;
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.userLikes = this.loadUserLikes();
        this.validDomains = ['@hotmail.com', '@outlook.com', '@live.com', '@gmail.com']; // Agregado Gmail
        this.minUsernameLength = 3;
        this.maxUsernameLength = 20;
        this.renderComments();
        
        // Verificar sesión al cargar
        this.checkSession();

        this.setupAutoRefresh(); // Agregar llamada al nuevo método
    }

    // Agregar método para verificar sesión
    checkSession() {
        const savedUser = localStorage.getItem('currentUser');
        const savedSession = localStorage.getItem('sessionActive');
        
        if (savedUser && savedSession === 'true') {
            this.currentUser = savedUser;
            this.updateUI(true);
        }
    }

    // Agregar método para actualización automática
    setupAutoRefresh() {
        // Actualizar más frecuentemente
        setInterval(() => {
            this.loadFromLocalStorage();
            this.renderComments();
        }, this.refreshInterval);

        // Actualizar cuando la página vuelve a estar visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadFromLocalStorage();
                this.renderComments();
            }
        });
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Comment form
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addComment();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    handleLogin() {
        const loginInput = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!loginInput || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        // Verificar si es email o nombre de usuario
        const isEmail = loginInput.includes('@');

        if (isEmail) {
            // Validación para email
            if (!this.isValidEmail(loginInput)) {
                this.showError('Por favor, ingresa un correo electrónico válido');
                return;
            }
        } else {
            // Validación para nombre de usuario
            if (!this.isValidUsername(loginInput)) {
                this.showError(`El nombre de usuario debe tener entre ${this.minUsernameLength} y ${this.maxUsernameLength} caracteres, y solo puede contener letras, números y guiones`);
                return;
            }
        }

        // Guardar sesión
        this.currentUser = loginInput;
        localStorage.setItem('currentUser', loginInput);
        localStorage.setItem('sessionActive', 'true');
        this.updateUI(true);
        this.hideError();
        
        // Limpiar campos del formulario
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    isValidUsername(username) {
        // Permitir letras (incluyendo ñ y acentos), números y guiones
        const usernameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9-]{3,20}$/;
        return usernameRegex.test(username);
    }

    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    isAllowedDomain(email) {
        return this.validDomains.some(domain => email.endsWith(domain));
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionActive');
        this.updateUI(false);
        clearInterval(this.refreshInterval);
        this.setupAutoRefresh();
    }

    addComment() {
        if (!this.currentUser) return;

        const commentText = document.getElementById('commentText').value;
        if (!commentText) return;

        const newComment = {
            id: Date.now(),
            user: this.currentUser,
            text: commentText,
            date: new Date().toISOString(),
            likes: 0
        };

        this.comments.unshift(newComment);
        if (this.comments.length > this.maxComments) {
            this.comments.pop();
        }

        this.saveToLocalStorage();
        this.renderComments();
        document.getElementById('commentText').value = '';
    }

    renderComments() {
        const commentsContainer = document.getElementById('commentsList');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = '';

        if (this.comments.length === 0) {
            commentsContainer.innerHTML = '<p class="no-comments">No hay comentarios aún.</p>';
            return;
        }

        this.comments.forEach(comment => {
            const likeKey = this.currentUser ? `${this.currentUser}-${comment.id}` : null;
            const hasLiked = this.userLikes[likeKey];
            
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <strong>${comment.user}</strong>
                    <span>${new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <div class="comment-body">${comment.text}</div>
                <div class="comment-footer">
                    <button class="like-btn ${hasLiked ? 'liked' : ''}" 
                            onclick="${this.currentUser ? `commentSystem.likeComment(${comment.id})` : "alert('Inicia sesión para dar like')"}"
                            ${hasLiked ? 'disabled' : ''}>
                        ${hasLiked ? '❤️' : '👍'} ${comment.likes}
                    </button>
                    ${this.currentUser && comment.user === this.currentUser ? 
                        `<button class="delete-btn" onclick="commentSystem.deleteComment(${comment.id})">
                            🗑️ Borrar
                        </button>` : 
                        ''}
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    likeComment(id) {
        if (!this.currentUser) return; // Usuario debe estar logueado

        // Crear key única para el par usuario-comentario
        const likeKey = `${this.currentUser}-${id}`;

        // Verificar si el usuario ya dio like
        if (this.userLikes[likeKey]) {
            return; // Ya dio like, no hacer nada
        }

        const comment = this.comments.find(c => c.id === id);
        if (comment) {
            comment.likes++;
            this.userLikes[likeKey] = true; // Registrar el like
            this.saveToLocalStorage();
            this.saveUserLikes();
            this.renderComments();
        }
    }

    deleteComment(id) {
        // Verificar que el usuario esté logueado y sea el autor del comentario
        if (!this.currentUser) return;

        const comment = this.comments.find(c => c.id === id);
        if (comment && comment.user === this.currentUser) {
            // Filtrar el comentario a eliminar
            this.comments = this.comments.filter(c => c.id !== id);
            
            // Eliminar los likes asociados a este comentario
            Object.keys(this.userLikes).forEach(key => {
                if (key.includes(`-${id}`)) {
                    delete this.userLikes[key];
                }
            });

            // Guardar cambios y actualizar UI
            this.saveToLocalStorage();
            this.saveUserLikes();
            this.renderComments();
        }
    }

    loadFromLocalStorage() {
        const savedComments = localStorage.getItem('comments');
        if (savedComments) {
            const newComments = JSON.parse(savedComments);
            
            // Verificar si hay cambios antes de actualizar
            if (JSON.stringify(this.comments) !== JSON.stringify(newComments)) {
                this.comments = newComments;
                console.log('Comentarios actualizados:', new Date().toLocaleString());
            }
        }
        
        this.currentUser = localStorage.getItem('currentUser');
        this.updateUI(!!this.currentUser);
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('comments', JSON.stringify(this.comments));
            // Implementar sistema de paginación si hay muchos comentarios
            if (this.comments.length > 1000) {
                this.paginateComments();
            }
        } catch (e) {
            console.error('Error al guardar comentarios:', e);
            // Implementar limpieza de comentarios antiguos si se excede el almacenamiento
            this.cleanOldComments();
        }
    }

    paginateComments() {
        const commentsPerPage = 100;
        const totalPages = Math.ceil(this.comments.length / commentsPerPage);
        
        for (let i = 0; i < totalPages; i++) {
            const pageComments = this.comments.slice(i * commentsPerPage, (i + 1) * commentsPerPage);
            localStorage.setItem(`comments_page_${i}`, JSON.stringify(pageComments));
        }
    }

    cleanOldComments() {
        // Mantener solo los comentarios más recientes si se excede el almacenamiento
        this.comments = this.comments.slice(0, this.maxComments);
        this.saveToLocalStorage();
    }

    loadUserLikes() {
        const savedLikes = localStorage.getItem('userLikes');
        return savedLikes ? JSON.parse(savedLikes) : {};
    }

    saveUserLikes() {
        localStorage.setItem('userLikes', JSON.stringify(this.userLikes));
    }

    updateUI(isLoggedIn) {
        // Sección de login
        document.getElementById('loginSection').style.display = isLoggedIn ? 'none' : 'block';
        
        // Sección de comentarios (formulario)
        document.getElementById('commentSection').style.display = isLoggedIn ? 'block' : 'none';
        
        // Actualizar nombre de usuario si está logueado
        if (isLoggedIn) {
            document.getElementById('userDisplay').textContent = `Usuario: ${this.currentUser}`;
        }

        // Asegurar que la lista de comentarios siempre esté visible
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.style.display = 'block';
            commentsList.style.marginTop = '20px';
        }
    }
}

// Inicializar el sistema de comentarios
const commentSystem = new CommentSystem();