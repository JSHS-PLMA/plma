export function musicPlay(_canvas) {
    const canvas = _canvas;
    const ctx = canvas.getContext('2d');

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = 600;
    canvas.height = 600 * (9 / 16);

    const { width, height } = canvas;

    const rectWidth = 8;
    const gap = 0;
    const stepX = rectWidth + gap;

    const barCount = Math.floor(width / rectWidth);

    const buffer = Math.max(Math.floor(dataArray.length / barCount), 1);

    function draw() {
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const centerX = Math.floor(width / 2);

        for (let i = 0; i < barCount; i++) {
            let val = 0;
            for (let j = 0; j < buffer; j++) {
                val += dataArray[i * buffer + j];
            }
            val /= buffer;
            const barHeight = (val / 255) ** 3 * 50;

            const offset = Math.floor(i / 2) * stepX;
            const x =
                i % 2 === 0 ? centerX + offset : centerX - offset - rectWidth;

            ctx.fillStyle = `rgba(255, 255, 255, ${(val / 255) * 0.8})`;
            ctx.fillRect(x, height - barHeight, rectWidth, barHeight);
        }
    }

    function connect(audioElement) {
        const source = audioCtx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function reset() {
        ctx.clearRect(0, 0, width, height);
    }

    return { draw, connect, reset };
}
