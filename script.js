const URL = "https://teachablemachine.withgoogle.com/models/fhlENu1G7/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup the webcam
    const flip = true; // Whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // Width, height, flip
    try {
        await webcam.setup(); // Request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);
    } catch (err) {
        alert("Webcam access is denied or not available. Please allow camera permissions.");
        console.error(err);
        return;
    }

    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // Add class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // Update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// Function to mark attendance
function markAttendance() {
    const predictions = labelContainer.innerText.split('\n');
    const highestProbability = predictions.reduce((max, prediction) => {
        const [, probability] = prediction.split(': ');
        return Math.max(max, parseFloat(probability));
    }, 0);

    const recognizedPerson = predictions.find(prediction => {
        const [, probability] = prediction.split(': ');
        return parseFloat(probability) === highestProbability;
    });

    if (recognizedPerson && highestProbability > 0.8) {
        const [name] = recognizedPerson.split(': ');
        const attendanceList = document.getElementById('attendanceList');
        const listItem = document.createElement('div');
        listItem.textContent = `${name} - ${new Date().toLocaleString()}`;
        attendanceList.appendChild(listItem);
    } else {
        alert('No person recognized with high confidence. Please try again.');
    }
}

// Initialize the system
init();

// Add event listener to the Mark Attendance button
document.getElementById('markAttendance').addEventListener('click', markAttendance);
