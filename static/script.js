document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cameraBtn = document.getElementById('cameraBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const cameraInput = document.getElementById('cameraInput');
    const dropZone = document.getElementById('dropZone');
    const previewSection = document.getElementById('preview-section');
    const previewImage = document.getElementById('previewImage');
    const predictionResult = document.getElementById('predictionResult');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceValue = document.getElementById('confidenceValue');
    const tipsList = document.getElementById('tipsList');
    const backBtn = document.getElementById('backBtn');
    const uploadSection = document.querySelector('.upload-section');
    const loadingSection = document.getElementById('loadingSection');
    const cameraModal = document.getElementById('cameraModal');
    const cameraPreview = document.getElementById('cameraPreview');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const confettiCanvas = document.getElementById('ecoConfettiCanvas');

    // =========================================================================
    // Category Emojis & Display Metadata
    // =========================================================================
    const CATEGORY_ICONS = {
        'Plastic waste': '🧴',
        'Paper and cardboard waste': '📦',
        'Glass waste': '🍾',
        'Metal waste': '🥫',
        'Organic waste': '🍎',
        'Electronic waste': '🔋',
        'Medicinal waste': '💊',
        'Hazardous waste': '⚠️',
        'General waste': '🗑️'
    };

    // =========================================================================
    // Environmental Quotes & Facts Carousel
    // =========================================================================
    const quotes = [
        { text: "Every small action counts in our journey towards a sustainable future.", author: "🌱 WasteSnap Eco Tip" },
        { text: "Recycling 1 aluminum can saves enough energy to power a TV for 3 hours!", author: "⚡ Energy Fact" },
        { text: "We don't need a few people doing zero waste perfectly. We need millions doing it imperfectly.", author: "🌍 Anne-Marie Bonneau" },
        { text: "Plastic bottles can take up to 450 years to decompose. Recycle yours today!", author: "🧴 Ocean Action" },
        { text: "Composting organic scraps prevents methane emissions and enriches soil naturally.", author: "🍃 Earth Health" },
        { text: "There is no such thing as 'away'. When we throw anything away, it must go somewhere.", author: "♻️ Annie Leonard" }
    ];

    let currentQuoteIndex = 0;
    function rotateQuote() {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        if (quoteText) {
            quoteText.style.opacity = '0';
            if (quoteAuthor) quoteAuthor.style.opacity = '0';
            setTimeout(() => {
                quoteText.textContent = quotes[currentQuoteIndex].text;
                if (quoteAuthor) quoteAuthor.textContent = quotes[currentQuoteIndex].author;
                quoteText.style.opacity = '1';
                if (quoteAuthor) quoteAuthor.style.opacity = '1';
            }, 400);
        }
    }
    setInterval(rotateQuote, 6500);

    // =========================================================================
    // Drag and Drop Zone Interaction
    // =========================================================================
    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                processImage(files[0]);
            }
        });
    }

    // Sample waste chips click feedback
    document.querySelectorAll('.chip-item').forEach(chip => {
        chip.addEventListener('click', () => {
            fileInput.click();
        });
    });

    // Check device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Reset state cleanly without hard reload
            if (previewSection) previewSection.classList.add('hidden');
            if (loadingSection) loadingSection.classList.add('hidden');
            if (uploadSection) uploadSection.style.display = 'block';
            if (fileInput) fileInput.value = '';
            if (cameraInput) cameraInput.value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Camera Handlers
    let stream = null;

    if (cameraBtn) {
        cameraBtn.addEventListener('click', async () => {
            if (isMobile) {
                cameraInput.setAttribute('capture', 'environment');
                cameraInput.click();
            } else {
                try {
                    cameraModal.classList.remove('hidden');
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false
                    });
                    cameraPreview.srcObject = stream;
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    alert('Camera access unavailable. You can easily upload a photo instead!');
                    cameraModal.classList.add('hidden');
                }
            }
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = cameraPreview.videoWidth || 640;
            canvas.height = cameraPreview.videoHeight || 480;
            const context = canvas.getContext('2d');
            context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], 'wastesnap-capture.jpg', { type: 'image/jpeg' });
                processImage(file);
            }, 'image/jpeg', 0.92);

            stopCamera();
        });
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (cameraModal) cameraModal.classList.add('hidden');
    }

    if (closeCameraBtn) {
        closeCameraBtn.addEventListener('click', () => {
            stopCamera();
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    }

    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (cameraInput) cameraInput.addEventListener('change', handleFileSelect);

    // =========================================================================
    // Image Processing & API Upload
    // =========================================================================
    function processImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            // Hide upload section and show loader
            if (uploadSection) uploadSection.style.display = 'none';
            if (previewSection) previewSection.classList.add('hidden');
            if (loadingSection) loadingSection.classList.remove('hidden');

            uploadImage(file);
        };
        reader.readAsDataURL(file);
    }

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Server returned ' + response.status);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Hide loading section and show preview results
            if (loadingSection) loadingSection.classList.add('hidden');
            if (previewSection) previewSection.classList.remove('hidden');
            displayResults(data);
            triggerEcoConfetti();

            // Smooth scroll down to result
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Prediction error:', error);
            alert('Error processing image. Please try another photo or ensure the server is responding.');
            if (loadingSection) loadingSection.classList.add('hidden');
            if (uploadSection) uploadSection.style.display = 'block';
        }
    }

    // =========================================================================
    // Display Prediction Results with Smooth Counters & Badges
    // =========================================================================
    function displayResults(data) {
        const icon = CATEGORY_ICONS[data.category] || '♻️';
        const isRecyclable = data.recyclability === 'recyclable';

        // Render Category Card
        predictionResult.innerHTML = `
            <div class="category-display">
                <div class="category-name-row">
                    <span style="font-size: 2.2rem;">${icon}</span>
                    <div class="category-name">${data.category}</div>
                </div>
                <div class="recyclability-badge ${data.recyclability}">
                    ${isRecyclable ? '♻️ 100% Recyclable Material' : '⚠️ Non-Recyclable / Special Handling'}
                </div>
            </div>
        `;

        // Animate Confidence Percentage
        const targetConfidence = Math.round((data.confidence || 0) * 100);
        if (confidenceBar) {
            confidenceBar.style.width = '0%';
            setTimeout(() => {
                confidenceBar.style.width = `${targetConfidence}%`;
            }, 100);
        }

        // Animate counter number
        if (confidenceValue) {
            let startVal = 0;
            const duration = 900;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = targetConfidence / steps;

            const counterTimer = setInterval(() => {
                startVal += increment;
                if (startVal >= targetConfidence) {
                    confidenceValue.textContent = `${targetConfidence}%`;
                    clearInterval(counterTimer);
                } else {
                    confidenceValue.textContent = `${Math.floor(startVal)}%`;
                }
            }, stepTime);
        }

        // Render Disposal Tips with animation
        if (tipsList && data.tips) {
            tipsList.innerHTML = '';
            data.tips.forEach((tip, idx) => {
                const li = document.createElement('li');
                li.textContent = tip;
                li.style.opacity = '0';
                li.style.transform = 'translateY(10px)';
                li.style.transition = `all 0.3s ease ${idx * 0.1}s`;
                tipsList.appendChild(li);

                setTimeout(() => {
                    li.style.opacity = '1';
                    li.style.transform = 'translateY(0)';
                }, 50);
            });
        }
    }

    // =========================================================================
    // Playful Eco Confetti & Leaf Shower Animation
    // =========================================================================
    function triggerEcoConfetti() {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#22c55e', '#16a34a', '#4ade80', '#10b981', '#84cc16', '#ffffff'];
        const leafShapes = ['circle', 'leaf', 'star'];

        for (let i = 0; i < 65; i++) {
            particles.push({
                x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 300,
                y: window.innerHeight * 0.35,
                radius: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: leafShapes[Math.floor(Math.random() * leafShapes.length)],
                vx: (Math.random() - 0.5) * 14,
                vy: Math.random() * -12 - 4,
                gravity: 0.32,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                opacity: 1
            });
        }

        let animationFrame;
        function render() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let activeCount = 0;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotSpeed;
                p.opacity -= 0.009;

                if (p.opacity > 0 && p.y < confettiCanvas.height) {
                    activeCount++;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.opacity);
                    ctx.fillStyle = p.color;

                    if (p.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (p.shape === 'leaf') {
                        // Oval leaf petal
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.radius * 1.5, p.radius * 0.7, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Little square eco confetti
                        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.2);
                    }
                    ctx.restore();
                }
            });

            if (activeCount > 0) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                cancelAnimationFrame(animationFrame);
            }
        }
        render();
    }

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    });
});