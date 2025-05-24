const quotes = [
    { text: "The Earth is what we all have in common.", author: "Wendell Berry" },
    { text: "Don't be trashy – recycle!", author: "WasteSnap" },
    { text: "Small actions lead to big changes.", author: "WasteSnap" },
    { text: "Every piece of waste properly sorted is a step towards a cleaner future.", author: "WasteSnap" },
    { text: "Recycling isn't a choice, it's a responsibility.", author: "WasteSnap" },
    { text: "The greatest threat to our planet is the belief that someone else will save it.", author: "Robert Swan" },
    { text: "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly.", author: "Anne Marie Bonneau" },
    { text: "Waste is a design flaw.", author: "Kate Kreba" },
    { text: "The environment is where we all meet; where we all have a mutual interest; it is the one thing all of us share.", author: "Lady Bird Johnson" },
    { text: "There is no such thing as 'away'. When we throw anything away it must go somewhere.", author: "Annie Leonard" }
];

const disposalTips = {
    "Plastic_waste": "Clean and sort by type before recycling. Remove labels and caps. Check the recycling number (1-7) on the bottom. Rinse containers thoroughly. Flatten to save space.",
    "Paper_and_cardboard_waste": "Flatten boxes and remove any plastic or metal components. Remove any food residue or grease. Keep paper dry and clean. Separate colored and white paper if required by your local facility.",
    "Glass_waste": "Rinse containers and remove lids. Sort by color if required. Remove any food residue. Don't mix with other recyclables. Check if your local facility accepts broken glass.",
    "Metal_waste": "Clean and flatten if possible. Remove any non-metal components. Rinse cans thoroughly. Remove paper labels. Check if your local facility accepts specific types of metal.",
    "Organic_waste": "Compost at home or use municipal composting services. Keep it free from plastic and other contaminants. Layer with dry materials. Turn regularly for better decomposition. Use as natural fertilizer.",
    "Electronic_waste": "Take to certified e-waste recycling centers. Never dispose in regular trash. Remove batteries if possible. Wipe personal data before recycling. Check for manufacturer take-back programs.",
    "Medicinal_waste": "Return to pharmacies or use designated medical waste collection points. Never flush medications. Keep in original containers. Remove personal information. Follow local guidelines for disposal.",
    "Hazardous_waste": "Contact local hazardous waste collection services. Never mix with regular trash. Store in original containers. Keep away from children and pets. Follow safety guidelines for transport.",
    "General_waste": "Ensure proper segregation before disposal. Minimize waste generation. Compress waste to save space. Use appropriate bin liners. Follow local waste collection schedules."
};

// DOM Elements
const uploadContainer = document.getElementById('uploadContainer');
const resultContainer = document.getElementById('resultContainer');
const previewImage = document.getElementById('previewImage');
const loadingSpinner = document.getElementById('loadingSpinner');
const predictionResult = document.getElementById('predictionResult');
const predictionLabel = document.getElementById('predictionLabel');
const recyclabilityBadge = document.getElementById('recyclabilityBadge');
const confidenceBar = document.getElementById('confidenceBar');
const confidenceText = document.getElementById('confidenceText');
const disposalTipsElement = document.getElementById('disposalTips');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const cameraBtn = document.getElementById('cameraBtn');
const fileInput = document.getElementById('fileInput');
const cameraModal = document.getElementById('cameraModal');
const cameraFeed = document.getElementById('cameraFeed');
const captureBtn = document.getElementById('captureBtn');
const cancelBtn = document.getElementById('cancelBtn');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');

let stream = null;

// Initialize quotes
let currentQuoteIndex = 0;
updateQuote();

// Event Listeners
cameraBtn.addEventListener('click', startCamera);
fileInput.addEventListener('change', handleFileSelect);
tryAgainBtn.addEventListener('click', resetApp);
captureBtn.addEventListener('click', captureImage);
cancelBtn.addEventListener('click', stopCamera);

// Functions
function updateQuote() {
    const quoteElement = quoteText;
    const authorElement = quoteAuthor;
    
    // Fade out
    quoteElement.style.opacity = '0';
    authorElement.style.opacity = '0';
    
    setTimeout(() => {
        // Update content
        quoteElement.textContent = quotes[currentQuoteIndex].text;
        authorElement.textContent = `— ${quotes[currentQuoteIndex].author}`;
        
        // Fade in
        quoteElement.style.opacity = '1';
        authorElement.style.opacity = '1';
        
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    }, 500); // Half of the transition time
}

setInterval(updateQuote, 5000);

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = stream;
        cameraModal.style.display = 'flex';
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    cameraModal.style.display = 'none';
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    canvas.getContext('2d').drawImage(cameraFeed, 0, 0);
    
    canvas.toBlob(blob => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        handleImage(file);
    }, 'image/jpeg');
    
    stopCamera();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleImage(file);
    }
}

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        uploadContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        loadingSpinner.style.display = 'flex';
        predictionResult.style.display = 'none';
        
        sendImageToServer(file);
    };
    reader.readAsDataURL(file);
}

async function sendImageToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image. Please try again.');
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function displayResults(data) {
    predictionResult.style.display = 'block';
    
    // Update prediction label
    predictionLabel.textContent = data.prediction.replace(/_/g, ' ');
    
    // Define recyclable categories
    const recyclableCategories = [
        "Plastic_waste",
        "Paper_and_cardboard_waste",
        "Glass_waste",
        "Metal_waste",
        "Organic_waste"
    ];
    
    // Update recyclability badge
    const isRecyclable = recyclableCategories.includes(data.prediction);
    recyclabilityBadge.textContent = isRecyclable ? '♻️ Recyclable' : '❌ Not Recyclable';
    recyclabilityBadge.className = `badge ${isRecyclable ? 'recyclable' : 'not-recyclable'}`;
    
    // Update confidence meter
    const confidence = data.confidence * 100;
    confidenceBar.style.width = `${confidence}%`;
    confidenceText.textContent = `Confidence: ${confidence.toFixed(1)}%`;
    
    // Update disposal tips
    disposalTipsElement.textContent = disposalTips[data.prediction];
}

function resetApp() {
    uploadContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    predictionResult.style.display = 'none';
    previewImage.src = '';
    fileInput.value = '';
} 