import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

import './index.scss';
import { lightning_bolt } from '~shared/scripts/lightning_bolt.js';
import { background } from '~shared/scripts/about/background';
import { Person } from '~shared/scripts/about/person';

const TITLE = import.meta.env.VITE_TITLE;

function Home() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [stageSize, setStageSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const resizeHandler = useCallback(() => {
        setStageSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = stageSize.width;
        canvas.height = stageSize.height;
        const ctx = canvas.getContext('2d');
        ctxRef.current = ctx;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        draw(ctx);
    }, [stageSize]);

    function init() {
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }

    function draw(ctx) {
        //ctx.fillStyle = '#001C30';
        ctx.fillStyle = '#03001C';

        ctx.fillRect(0, 0, stageSize.width, stageSize.height);

        //lightning_bolt(ctx, stageSize);
        const { drawPoints, drawVoronoi, drawTriangles } = background(
            ctx,
            stageSize
        );
        //Person(ctx, stageSize);

        drawTriangles();
        // drawVoronoi();
    }

    return (
        <>
            <div id="about">
                <canvas
                    width={stageSize.width}
                    height={stageSize.height}
                    tabIndex={0}
                    ref={canvasRef}
                ></canvas>

                <div className="textwrap">
                    <h1 className="name">Comming Soon...</h1>
                </div>
            </div>
        </>
    );
}

export default Home;
