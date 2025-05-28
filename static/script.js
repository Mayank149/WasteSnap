document.addEventListener('DOMContentLoaded', () => {
    const cameraBtn = document.getElementById('cameraBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const cameraInput = document.getElementById('cameraInput');
    const previewSection = document.getElementById('preview-section');
    const previewImage = document.getElementById('previewImage');
    const predictionResult = document.getElementById('predictionResult');
    const confidenceBar = document.getElementById('confidenceBar');
    const tipsList = document.getElementById('tipsList');
    const backBtn = document.getElementById('backBtn');
    const uploadSection = document.querySelector('.upload-section');
    const cameraModal = document.getElementById('cameraModal');
    const cameraPreview = document.getElementById('cameraPreview');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const themeToggle = document.getElementById('themeToggle');

    // Theme handling
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton(currentTheme);

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });

    // Update theme button appearance
    function updateThemeButton(theme) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Environmental quotes
    const quotes = [
        "Every small action counts in our journey towards a sustainable future.",
        "The greatest threat to our planet is the belief that someone else will save it.",
        "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly.",
        "The Earth is what we all have in common.",
        "There is no such thing as 'away'. When we throw anything away, it must go somewhere."
    ];

    // Rotate quotes
    let currentQuoteIndex = 0;
    const quoteText = document.getElementById('quoteText');

    function rotateQuote() {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        quoteText.style.opacity = '0';
        setTimeout(() => {
            quoteText.textContent = quotes[currentQuoteIndex];
            quoteText.style.opacity = '1';
        }, 500);
    }

    setInterval(rotateQuote, 5000);

    // Handle back button click
    backBtn.addEventListener('click', () => {
        // Reload the page to reset everything
        window.location.reload();
    });

    let stream = null;

    // Handle camera button click
    cameraBtn.addEventListener('click', async () => {
        if (isMobile) {
            // Use file input with capture attribute for mobile
            cameraInput.setAttribute('capture', 'environment');
            cameraInput.click();
        } else {
            try {
                // Show camera modal
                cameraModal.classList.remove('hidden');
                
                // Get camera stream
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: false
                });
                
                // Set video source
                cameraPreview.srcObject = stream;
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Error accessing camera. Please try uploading an image instead.');
                cameraModal.classList.add('hidden');
            }
        }
    });

    // Handle capture button click
    captureBtn.addEventListener('click', () => {
        // Create canvas and capture frame
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

        // Convert to file
        canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            processImage(file);
        }, 'image/jpeg');

        // Stop camera stream and close modal
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraModal.classList.add('hidden');
    });

    // Handle close camera button click
    closeCameraBtn.addEventListener('click', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraModal.classList.add('hidden');
    });

    // Handle upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    }

    fileInput.addEventListener('change', handleFileSelect);
    cameraInput.addEventListener('change', handleFileSelect);

    // Process and display image
    function processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewSection.classList.remove('hidden');
            // Hide upload section when showing results
            uploadSection.style.display = 'none';
            uploadImage(file);
        };
        reader.readAsDataURL(file);
    }

    // Upload image to API
    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing image. Please try again.');
            // Show upload section again if there's an error
            uploadSection.style.display = 'block';
        }
    }

    // Display prediction results
    function displayResults(data) {
        // Create category and recyclability display
        const categoryDisplay = document.createElement('div');
        categoryDisplay.className = 'category-display';
        categoryDisplay.innerHTML = `
            <h3>Waste Category</h3>
            <div class="category-name">${data.category}</div>
            <div class="recyclability-badge ${data.recyclability}">
                ${data.recyclability === 'recyclable' ? '♻️ Recyclable' : '❌ Not Recyclable'}
            </div>
        `;

        // Replace existing prediction result with new category display
        predictionResult.parentNode.replaceChild(categoryDisplay, predictionResult);

        // Update confidence bar
        const confidence = Math.round(data.confidence * 100);
        confidenceBar.style.width = `${confidence}%`;

        // Update tips
        tipsList.innerHTML = '';
        data.tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });

        // Add leaf animation
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 1000);
    }
}); 