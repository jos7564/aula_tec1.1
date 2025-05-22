document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.component-card');
    let currentInfoModal = null;

    // Objeto con las rutas de las imágenes de cada dispositivo
    const deviceImages = {
        'PlayStation 5': 'PlayStation 5.jpg',
        'Xbox Series X': 'Xbox Series X.jpg',
        'Nintendo Switch OLED': 'Nintendo Switch OLED.jpg',
        'Steam Deck': 'Steam Deck.jpg',
        'Nintendo Switch Lite': 'Nintendo Switch Lite.jpg',
        'ASUS ROG Ally': 'ASUS ROG Ally.jpg',
    };

    function createInfoModal(card) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const title = card.querySelector('.card-header h4').textContent;
        const icon = card.querySelector('.card-header i').cloneNode(true);
        const infoContent = card.querySelector('.info-details');

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.cursor = 'pointer';
        modalHeader.innerHTML = `
            ${icon.outerHTML}
            <h3>${title}</h3>
        `;

        // Evento para abrir modal de imagen
        modalHeader.addEventListener('click', () => {
            createImageModal(title);
            closeInfoModal(modalOverlay, modalContent);
        });

        const contentClone = infoContent.cloneNode(true);
        contentClone.style.display = 'block';

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(contentClone);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        document.body.style.overflow = 'hidden';
        currentInfoModal = { overlay: modalOverlay, content: modalContent };

        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
            modalContent.classList.add('active');
        });

        setupModalClose(modalOverlay, modalContent);
    }

    function createImageModal(deviceName) {
        const imageModalOverlay = document.createElement('div');
        imageModalOverlay.className = 'image-modal-overlay';

        const imageModalContent = document.createElement('div');
        imageModalContent.className = 'image-modal-content';

        // Container para la imagen y el botón
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';

        // Agregar botón de cierre
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.7);
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        const image = document.createElement('img');
        image.src = deviceImages[deviceName];
        image.alt = deviceName;
        image.style.maxWidth = '100%';
        image.style.height = 'auto';
        image.style.display = 'block';

        modalContainer.appendChild(image);
        modalContainer.appendChild(closeButton);
        imageModalContent.appendChild(modalContainer);
        imageModalOverlay.appendChild(imageModalContent);
        document.body.appendChild(imageModalOverlay);

        requestAnimationFrame(() => {
            imageModalOverlay.classList.add('active');
            imageModalContent.classList.add('active');
        });

        // Evento para el botón de cierre
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click se propague al overlay
            closeImageModal(imageModalOverlay, imageModalContent);
            // Reabrir el modal de información
            if (currentInfoModal) {
                requestAnimationFrame(() => {
                    currentInfoModal.overlay.classList.add('active');
                    currentInfoModal.content.classList.add('active');
                });
            }
        });
    }

    function closeInfoModal(overlay, content) {
        overlay.classList.remove('active');
        content.classList.remove('active');
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }

    function closeImageModal(overlay, content) {
        overlay.classList.remove('active');
        content.classList.remove('active');
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }

    function setupModalClose(overlay, content) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeInfoModal(overlay, content);
                currentInfoModal = null;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeInfoModal(overlay, content);
                currentInfoModal = null;
            }
        });
    }

    // Configurar los botones de información
    cards.forEach(card => {
        const infoBtn = card.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => createInfoModal(card));
        }
    });
});