document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const graphCanvas = document.getElementById('graphCanvas');
    const canvasContext = graphCanvas.getContext('2d');
    let isRecording = false;
    let audioContext, mediaRecorder, audioChunks;

    startButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
            startButton.textContent = 'Stop Recording';
        } else {
            stopRecording();
            startButton.textContent = 'Start Recording';
        }
        isRecording = !isRecording;
    });

    function startRecording() {
        audioChunks = [];
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const microphone = audioContext.createMediaStreamSource(stream);
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    audioContext.close();
                    drawWaveform();
                };

                mediaRecorder.start();
            })
            .catch((error) => {
                console.error('Error accessing microphone:', error);
            });
    }

    function stopRecording() {
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    }

    function drawWaveform() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audioElement = new Audio(audioUrl);
        audioElement.controls = true;
        audioElement.autoplay = false;

        audioElement.addEventListener('loadedmetadata', () => {
            const duration = audioElement.duration;
            const width = graphCanvas.width;
            const height = graphCanvas.height;
            const context = graphCanvas.getContext('2d');

            context.clearRect(0, 0, width, height);

            audioElement.addEventListener('timeupdate', () => {
                const currentTime = audioElement.currentTime;
                const xPos = (currentTime / duration) * width;

                context.fillStyle = '#3498db'; // Waveform color
                context.fillRect(xPos, 0, 1, height);
            });
        });
    }
});
