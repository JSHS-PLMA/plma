export function musicPlay(_canvas, _audio) {
    const canvas = _canvas;
    const audio = _audio;
    const ctx = canvas.getContext('2d');

    canvas.width = 100;
    canvas.height = 100;

    const centerX = 50;
    const centerY = 50;
    const radius = 25;

    const rectWidth = 2;
    const rectHeight = 5;

    const triangleRadius = 10; // smaller than circle

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;

    function makeRandomColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgb(${r},${g},${b})`;
    }

    function draw(t, mode = 0) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const numRects = 100;
        const phi = 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Draw Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Play Button (Triangle pointing right)
        ctx.beginPath();
        ctx.moveTo(centerX + triangleRadius, centerY);
        ctx.lineTo(centerX - triangleRadius / 2, centerY - triangleRadius);
        ctx.lineTo(centerX - triangleRadius / 2, centerY + triangleRadius);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();

        // Draw Bars Around Circle
        for (let i = phi; i < numRects + phi; i++) {
            const normalized = dataArray[i] / 255;
            const num = Math.pow(normalized, 3) * 25;

            const angle = ((2 * Math.PI) / numRects) * i;
            const x =
                centerX + (radius + (rectHeight + num) / 2) * Math.cos(angle);
            const y =
                centerY + (radius + (rectHeight + num) / 2) * Math.sin(angle);

            ctx.save(); // Save canvas state
            ctx.translate(x, y); // Move to rectangle position
            ctx.rotate(angle + Math.PI / 2); // Rotate to match circle's tangent direction
            ctx.fillStyle = `rgba(52, 58, 64, ${normalized})`; // Set color with transparency
            ctx.fillRect(
                -rectWidth / 2,
                -(rectHeight + num) / 2,
                rectWidth,
                rectHeight + num
            ); // Draw centered rectangle
            ctx.restore(); // Restore canvas state
        }

        if (mode === 0) requestAnimationFrame(draw);
    }

    draw(0, 1); // Initial frame

    async function playMusic() {
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        audio.play();
        requestAnimationFrame(draw);
    }

    return { playMusic };
}
