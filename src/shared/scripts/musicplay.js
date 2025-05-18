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

    const rectWidth = 5;
    const gap = 0;
    const stepX = rectWidth + gap;

    const barCount = Math.floor(width / rectWidth);

    function draw() {
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const prefix = 0;

        for (let i = 0; i < barCount; i++) {
            const val = dataArray[i + prefix];
            const barHeight = (val / 255) ** 3 * 100;
            const x = i % 2 == 0 ? i * stepX : width - i * stepX;

            ctx.fillStyle = `rgba(255, 255, 255, ${val / 255})`;
            ctx.fillRect(x, 0, rectWidth, barHeight);
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

        const prefix = 0;

        for (let i = 0; i < barCount; i++) {
            const val = dataArray[i + prefix];
            const barHeight = (val / 255) ** 3 * 100;
            const x = i % 2 == 0 ? i * stepX : width - i * stepX;

            ctx.fillStyle = `rgba(255, 255, 255, ${val / 255})`;
            ctx.fillRect(x, 0, rectWidth, barHeight);
        }
    }

    return { draw, connect, reset };
}
