export function musicPlay(_canvas) {
    const canvas = _canvas;
    const ctx = canvas.getContext('2d');

    canvas.width = 100;
    canvas.height = 100;

    const centerX = 50;
    const centerY = 50;
    const radius = 25;

    // Draw Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Triangle (Play Button) - smaller and rotated
    const triangleRadius = 10; // smaller than circle

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
        // Rotate 90 degrees clockwise (Math.PI/2)
        const angle = ((Math.PI * 2) / 3) * i;
        const x = centerX + triangleRadius * Math.cos(angle);
        const y = centerY + triangleRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();

    const numRects = 60;
    const rectWidth = 2;
    const rectHeight = 5;

    for (let i = 0; i < numRects; i++) {
        const num = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10

        const angle = ((2 * Math.PI) / numRects) * i;
        const x = centerX + (radius + (rectHeight + num) / 2) * Math.cos(angle);
        const y = centerY + (radius + (rectHeight + num) / 2) * Math.sin(angle);

        ctx.save(); // Save canvas state
        ctx.translate(x, y); // Move to rectangle position
        ctx.rotate(angle + Math.PI / 2); // Rotate to match circle's tangent direction
        ctx.fillStyle = '#343a40';
        ctx.fillRect(
            -rectWidth / 2,
            -(rectHeight + num) / 2,
            rectWidth,
            rectHeight + num
        ); // Draw centered rectangle
        ctx.restore(); // Restore canvas state
    }
}
