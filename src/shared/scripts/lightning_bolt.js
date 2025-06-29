export function lightning_bolt(_ctx, stageSize) {
    const [stageWidth, stageHeight] = [stageSize.width, stageSize.height];
    const ctx = _ctx;
    if (!ctx) return;

    const startPoint = [stageWidth / 2, 0];
    const endPoint = [stageWidth / 2, 500];
    let points = [];

    const PARTS = 10;

    points.push(startPoint);

    for (let i = 1; i < PARTS - 1; i++) {
        let point = [];

        let x = Math.floor(Math.random() * 100) - 50 + points[i - 1][0];
        let y =
            Math.floor((Math.random() * 500) / PARTS) +
            500 / PARTS / 2 +
            points[i - 1][1];

        point = [x, y];

        points.push(point);
    }

    points.push(endPoint);

    ctx.beginPath();
    for (const point of points) {
        ctx.lineTo(...point);
        ctx.lineCap = 'round';
    }

    ctx.shadowBlur = 5;
    ctx.shadowColor = '#03fc0b';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
}

// export function lightning_bolt(_ctx, stageSize) {
//     const [stageWidth, stageHeight] = [stageSize.width, stageSize.height];
//     const ctx = _ctx;
//     if (!ctx) return;

//     const startPoint = [stageWidth / 2, 0];
//     const endPoint = [stageWidth / 2, 500];
//     let points = [];

//     const PARTS = 100;
//     points.push(startPoint);

//     for (let i = 1; i < PARTS; i++) {
//         let x = Math.floor(Math.random() * 100) - 50 + points[i - 1][0];
//         let y = Math.floor(Math.random() * 20) + points[i - 1][1];

//         points.push([x, y]);
//     }

//     ctx.shadowBlur = 10;
//     ctx.shadowColor = '#fff';
// }
