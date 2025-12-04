// Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupCardGenerator();
    setupPhotoEditor();
});

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('main section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            
            // Update buttons
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update sections
            sections.forEach(section => {
                section.classList.remove('active-section');
                section.classList.add('hidden-section');
                if (section.id === targetId) {
                    section.classList.remove('hidden-section');
                    section.classList.add('active-section');
                }
            });
        });
    });
}

// Global helper to switch tabs from CTA buttons
window.navigateTo = (targetId) => {
    const btn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if (btn) btn.click();
};

// --- Card Generator Logic ---
function setupCardGenerator() {
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');
    const messageInput = document.getElementById('cardMessage');
    const signInput = document.getElementById('cardSign');
    const templateOptions = document.querySelectorAll('.template-option');
    const downloadBtn = document.getElementById('downloadCardBtn');

    let currentBgColor = '#D42426';

    // Initial Draw
    drawCard();

    // Event Listeners
    messageInput.addEventListener('input', drawCard);
    signInput.addEventListener('input', drawCard);

    templateOptions.forEach(opt => {
        opt.style.backgroundColor = opt.dataset.color; // Set visual color
        opt.addEventListener('click', () => {
            templateOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            currentBgColor = opt.dataset.color;
            drawCard();
        });
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'christmas-card.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    function drawCard() {
        // Background
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border/Frame
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Decorative Corners (Simple circles for now)
        ctx.fillStyle = '#F8B229';
        const cornerRadius = 15;
        ctx.beginPath(); ctx.arc(30, 30, cornerRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(canvas.width - 30, 30, cornerRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, canvas.height - 30, cornerRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(canvas.width - 30, canvas.height - 30, cornerRadius, 0, Math.PI * 2); ctx.fill();

        // Text Configuration
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';

        // Title
        ctx.font = 'bold 60px "Mountains of Christmas"';
        ctx.fillText('Merry Christmas', canvas.width / 2, 150);

        // Message
        const message = messageInput.value || "Wishing you joy and happiness!";
        ctx.font = '30px "Outfit"';
        wrapText(ctx, message, canvas.width / 2, 300, 500, 40);

        // Signature
        const sign = signInput.value ? `- ${signInput.value} -` : "";
        ctx.font = 'italic 24px "Outfit"';
        ctx.fillText(sign, canvas.width / 2, canvas.height - 100);
    }

    // Helper for wrapping text
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }
}

// --- Photo Editor Logic ---
function setupPhotoEditor() {
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('photoInput');
    const downloadBtn = document.getElementById('downloadPhotoBtn');
    const placeholder = document.getElementById('editorPlaceholder');
    const stickerBtns = document.querySelectorAll('.sticker-btn');

    let uploadedImage = null;
    let stickers = []; // Array of {type, x, y}

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImage = new Image();
                uploadedImage.onload = () => {
                    // Resize canvas to match image aspect ratio, max width 800
                    const scale = Math.min(800 / uploadedImage.width, 600 / uploadedImage.height);
                    canvas.width = uploadedImage.width * scale;
                    canvas.height = uploadedImage.height * scale;
                    
                    placeholder.style.display = 'none';
                    downloadBtn.disabled = false;
                    drawEditor();
                };
                uploadedImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    stickerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!uploadedImage) return alert('Please upload a photo first!');
            
            // Add sticker to center
            stickers.push({
                text: getStickerEmoji(btn.dataset.sticker),
                x: canvas.width / 2,
                y: canvas.height / 2
            });
            drawEditor();
        });
    });

    // Simple drag logic (very basic for now)
    let isDragging = false;
    let currentStickerIndex = -1;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicked on a sticker (reverse to get top-most)
        for (let i = stickers.length - 1; i >= 0; i--) {
            const s = stickers[i];
            // Approx hit area
            if (Math.abs(mouseX - s.x) < 30 && Math.abs(mouseY - s.y) < 30) {
                isDragging = true;
                currentStickerIndex = i;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging && currentStickerIndex !== -1) {
            const rect = canvas.getBoundingClientRect();
            stickers[currentStickerIndex].x = e.clientX - rect.left;
            stickers[currentStickerIndex].y = e.clientY - rect.top;
            drawEditor();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        currentStickerIndex = -1;
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'festive-photo.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    function getStickerEmoji(type) {
        const map = {
            'hat': '🎅',
            'tree': '🎄',
            'snowflake': '❄️',
            'gift': '🎁'
        };
        return map[type] || '✨';
    }

    function drawEditor() {
        if (!uploadedImage) return;

        // Draw Image
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

        // Draw Stickers
        ctx.font = '50px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        stickers.forEach(s => {
            ctx.fillText(s.text, s.x, s.y);
        });
    }
    
    // Expose filter function globally
    window.applyFilter = (type) => {
        if (!uploadedImage) return;
        ctx.filter = type === 'none' ? 'none' : 
                     type === 'grayscale' ? 'grayscale(100%)' : 
                     type === 'sepia' ? 'sepia(100%)' : 'none';
        drawEditor();
        ctx.filter = 'none'; // Reset for next draw
    };
}
