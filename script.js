async function loadFaceAPI() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    console.log("Face API Models Loaded!");
}

loadFaceAPI();

async function startWebcam() {
    const video = document.getElementById("video");
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing webcam:", err);
    }
}

startWebcam();

video.addEventListener("play", async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.appendChild(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptors();

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
});
