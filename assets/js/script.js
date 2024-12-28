const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const wordBank = Array.from({ length: 100 }, () => generateRandomWord());

function generateRandomWord() {
    const length = Math.floor(Math.random() * 6) + 3; // Words of length 3 to 8
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

const timerElement = document.getElementById('timer');
const quoteElement = document.getElementById('quote');
const inputElement = document.getElementById('input');
const resultsElement = document.getElementById('results');
const gifFeedback = document.getElementById('gifFeedback');
const feedbackImage = document.getElementById('feedbackImage');
const modeSelection = document.getElementById('modeSelection');
const startSection = document.getElementById('startSection');
const testSection = document.getElementById('testSection');
const resultsSection = document.getElementById('resultsSection');
const nameSection = document.getElementById('nameSection');
const displayName = document.getElementById('displayName');
var testCompleted = false; // Track if the test is completed

let userName = localStorage.getItem('userName') || "";
let timeRemaining;
let timerInterval;
let currentWordIndex = 0;
let difficulty;
let correctWords = 0;
let totalWords = 0;
let mistakes = 0;

function saveName() {
    const nameInput = document.getElementById('userName').value.trim();
    if (nameInput) {
        userName = nameInput;
        localStorage.setItem('userName', userName);
        displayName.textContent = userName;
        nameSection.style.display = 'none';
        modeSelection.style.display = 'block';
    } else {
        alert("Please enter a valid name.");
    }
}

function editName() {
    nameSection.style.display = 'block';
    modeSelection.style.display = 'none';
    document.getElementById('userName').value = userName;
}

function selectMode(mode) {
    difficulty = mode;
    modeSelection.style.display = 'none';
    startSection.style.display = 'block';
}

function getNextWord() {
    currentWordIndex = (currentWordIndex + 1) % wordBank.length;
    return wordBank[currentWordIndex];
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        timerElement.textContent = `Time: ${timeRemaining}s`;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

function startTest() {
    timeRemaining = 60;
    correctWords = 0;
    totalWords = 0;
    mistakes = 0;
    resultsSection.style.display = 'none';
    gifFeedback.style.display = 'none';
    inputElement.value = '';
    inputElement.disabled = false;
    quoteElement.textContent = getNextWord();
    startSection.style.display = 'none';
    testSection.style.display = 'block';
    startTimer();
    inputElement.focus();
}

function checkInput() {
    const typedWord = inputElement.value.trim();
    const currentWord = quoteElement.textContent;

    if (typedWord === currentWord) {
        correctWords++;
        inputElement.value = '';
        quoteElement.textContent = getNextWord();
    } else if (typedWord.length >= currentWord.length) {
        mistakes++;
        inputElement.value = '';
        quoteElement.textContent = getNextWord();
    }

    totalWords = correctWords + mistakes;
}

function endTest() {
    inputElement.disabled = true;
    testCompleted = true;
    const accuracy = Math.round((correctWords / totalWords) * 100);
    let message, gifPath;

    if (accuracy > 90) {
        message = "Excellent! You have great typing skills.";
        gifPath = "./assets/img/excellent.webp";
    } else if (accuracy > 75) {
        message = "Very Good! Keep practicing to improve further.";
        gifPath = "./assets/img/verygood.webp";
    } else {
        message = "Good effort! Practice more to reduce mistakes.";
        gifPath = "./assets/img/good.webp";
    }

    gifFeedback.style.display = 'block';
    feedbackImage.src = gifPath;

    // Prevent NaN by validating values
    const safeTotalWords = isNaN(totalWords) ? 0 : totalWords;
    const safeCorrectWords = isNaN(correctWords) ? 0 : correctWords;
    const safeMistakes = isNaN(mistakes) ? 0 : mistakes;
    const safeAccuracy = isNaN(accuracy) ? 0 : accuracy;

    // Generate the results HTML
    resultsElement.innerHTML = `
    <p>Hello, ${userName || "Participant"}!</p>
    <p>Total Words Attempted: ${safeTotalWords}</p>
    <p>Correct Words: ${safeCorrectWords}</p>
    <p>Mistakes: ${safeMistakes}</p>
    <p>Accuracy: ${safeAccuracy}%</p>
    <p>${message || "Keep practicing to improve your skills!"}</p>
`;

    resultsSection.style.display = 'block';
}

function confirmReset() {
    const confirmation = confirm("Are you sure you want to reset? This will erase your current progress.");
    if (confirmation) {
        resetTest();
    }
}

function resetTest() {
    clearInterval(timerInterval);
    timeRemaining = 60;
    correctWords = 0;
    totalWords = 0;
    mistakes = 0;
    inputElement.value = '';
    inputElement.disabled = true;

    // Clear the saved name and reset the UI to the name entry section
    localStorage.removeItem('userName');
    userName = "";
    document.getElementById('userName').value = '';

    testSection.style.display = 'none';
    resultsSection.style.display = 'none';
    startSection.style.display = 'none';
    modeSelection.style.display = 'none';
    nameSection.style.display = 'block';
}




inputElement.addEventListener('input', checkInput);

// Check if a name exists in localStorage and adjust the UI accordingly
if (userName) {
    displayName.textContent = userName;
    nameSection.style.display = 'none';
    modeSelection.style.display = 'block';
}




async function downloadCertificate() {
    if (!testCompleted) {
        alert("Please complete the test before downloading your certificate.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "landscape", // Change to landscape for certificate
        unit: "px",
        format: [850, 550] // Define custom size for the certificate
    });

    // Add background color
    doc.setFillColor(50, 50, 200); // Deep blue
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");

    // Add border
    doc.setLineWidth(10);
    doc.setDrawColor(255, 255, 0); // Yellow border
    doc.rect(20, 20, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 40, "S");

    // Add "THIS DG" text instead of a logo
    const logoX = 425; // Center horizontally
    const logoY = 120; // Position near the top

    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.setTextColor(255, 255, 255); // White color
    doc.text("Developer Gowtham", logoX, logoY, { align: "center" });

    // Add certificate title
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text("Typing Speed Test Certificate", 425, 250, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "italic");
    doc.setFontSize(18);
    doc.setTextColor(200, 200, 255);
    doc.text("Certificate of Achievement", 425, 280, { align: "center" });

    // Add user name
    const userName = document.getElementById("userName").value || "Participant"; // Use "Participant" if name is empty
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 0); // Yellow for name
    doc.text(`Awarded to: ${userName}`, 425, 320, { align: "center" });

    // Results section with conditional checks
    const totalWords = parseInt(document.getElementById("totalWords")?.textContent || 0, 10);
    const correctWords = parseInt(document.getElementById("correctWords")?.textContent || 0, 10);
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255); // White for text
    doc.text(`Total Words Attempted: ${totalWords}`, 425, 360, { align: "center" });
    doc.text(`Correct Words: ${correctWords}`, 425, 380, { align: "center" });
    doc.text(`Accuracy: ${accuracy}%`, 425, 400, { align: "center" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.text("Author: Developer Gowtham", 425, 450, { align: "center" });

    // Save the certificate
    doc.save("Typing_Speed_Certificate.pdf");
}





// email code



// Initialize emailjs
(function () {
    emailjs.init("hdueE7bUifAPG9EJh"); // Replace with your Public Key
})();

// Example to programmatically show the popup
const successPopup = document.getElementById('successPopup');
const myModal = successPopup ? new bootstrap.Modal(successPopup) : null;

// Function to send email
function sendEmail(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Template parameters for emailjs
    const templateParams = {
        to_name: "gowtham", // Recipient name
        from_name: name, // Sender name
        from_email: email, // Sender email
        message: message, // Message content
        reply_to: email // Reply-to email address
    };

    // Send email using emailjs
    emailjs.send("service_hiqcowq", "template_b0yggtu", templateParams)
        .then(() => {
            // Show success popup or alert
            if (myModal) {
                myModal.show();
            } else {
                alert("Email Sent Successfully!");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to send the email. Check the console for details.");
        });

    // Reset the form
    document.getElementById("contactfrom").reset();
}
