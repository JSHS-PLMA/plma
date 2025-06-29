import { Delaunay } from 'd3';

export function background(ctx, stageSize) {
    const points = Array.from({ length: 500 }, () => [
        Math.random() * (stageSize.width + 100) - 50,
        Math.random() * (stageSize.height + 100) - 50,
    ]);

    points.push(
        [-50, -50],
        [stageSize.width + 50, 0],
        [0, stageSize.height + 50],
        [stageSize.width + 50, stageSize.height + 50]
    );

    // 들로네 삼각분할 실행
    const delaunay = Delaunay.from(points);
    const triangles = delaunay.triangles;
    const voronoi = delaunay.voronoi([
        -50,
        -50,
        stageSize.width + 50,
        stageSize.height + 50,
    ]);

    function makeRandomColor(iA = 1, weightA = 1) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        const a = Math.random() * iA * weightA;

        return `rgba(${r},${g},${b}, ${a})`;
    }

    // 삼각형 그리기
    function drawTriangles() {
        ctx.lineWidth = 1;
        for (let i = 0; i < triangles.length; i += 3) {
            const [p1, p2, p3] = [
                points[triangles[i]],
                points[triangles[i + 1]],
                points[triangles[i + 2]],
            ];
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 5;
            const weightA =
                (((p1[0] + p2[0] + p3[0]) / 3 / stageSize.width) *
                    (1 - (p1[1] + p2[1] + p3[1]) / 3 / stageSize.height)) **
                    1.2 || 0;
            const color = Math.floor(Math.random() * 4);
            const defWeight = 0.5;
            if (color == 0)
                ctx.strokeStyle = `rgba(255, 228, 56, ${defWeight * weightA})`;
            else if (color == 1)
                ctx.strokeStyle = `rgba(255, 8, 197, ${defWeight * weightA})`;
            else if (color == 2)
                ctx.strokeStyle = `rgba(3, 252, 215, ${defWeight * weightA})`;
            else if (color == 3)
                ctx.strokeStyle = makeRandomColor(defWeight, weightA);
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.lineTo(p3[0], p3[1]);
            ctx.closePath();
            ctx.fillStyle = makeRandomColor(0.2, weightA);
            ctx.fill();
            ctx.stroke();
        }
    }

    function drawVoronoi() {
        ctx.lineWidth = 1;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 5;
        for (let i = 0; i < points.length; i++) {
            const cell = voronoi.cellPolygon(i);
            if (!cell) continue;

            ctx.beginPath();
            ctx.moveTo(cell[0][0], cell[0][1]);
            for (let j = 1; j < cell.length; j++) {
                ctx.lineTo(cell[j][0], cell[j][1]);
            }
            ctx.closePath();

            const color = Math.floor(Math.random() * 4);
            const defWeight = 0.5;
            const weightA =
                ((points[i][0] / stageSize.width) *
                    (1 - points[i][1] / stageSize.height)) **
                    1.2 || 0;
            if (color == 0)
                ctx.strokeStyle = `rgba(255, 228, 56, ${defWeight * weightA})`;
            else if (color == 1)
                ctx.strokeStyle = `rgba(255, 8, 197, ${defWeight * weightA})`;
            else if (color == 2)
                ctx.strokeStyle = `rgba(3, 252, 215, ${defWeight * weightA})`;
            else if (color == 3)
                ctx.strokeStyle = makeRandomColor(defWeight, weightA);
            // 랜덤 색상 적용
            ctx.fillStyle = makeRandomColor(0.2, weightA);
            ctx.fill();
            ctx.stroke();
        }
    }

    // 점 그리기
    function drawPoints() {
        ctx.fillStyle = 'red';
        points.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    return { drawPoints, drawTriangles, drawVoronoi };
}
