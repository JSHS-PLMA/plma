import './index.scss';
import { useEffect, useRef, useState } from 'react';

function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function Slider2({
    min = 0,
    max = 0,
    defaultValue = 0,
    setValue = 0,
    className,
    maxLength = 300,
    disabled,
    mode,
    onCutChange = () => {},
    onCutChangeComplete = () => {},
    onInput = () => {},
    onInputComplete = () => {},
}) {
    const cutStartInpRef = useRef();
    const cutEndInpRef = useRef();
    const playerInpRef = useRef();

    const cutStartRef = useRef(min);
    const cutEndRef = useRef(max - min > maxLength ? maxLength : max);

    const valueRef = useRef(null);

    const isDragging = useRef(false);

    const leftThumbRef = useRef(null);
    const rightThumbRef = useRef(null);
    const playThumbRef = useRef(null);

    const [cutStart, setCutStart] = useState(min);
    const [cutEnd, setCutEnd] = useState(
        max - min > maxLength ? maxLength : max
    );

    const wrapperRef = useRef();

    function onCutInput() {
        const startVal = Number(cutStartInpRef.current.value);
        const endVal = Number(cutEndInpRef.current.value);

        if (startVal + 10 >= endVal) return;
        if (endVal - startVal > maxLength) return;

        cutStartRef.current = startVal;
        cutEndRef.current = endVal;

        wrapperRef.current.style.setProperty(
            '--cutStartPercent',
            startVal / max
        );
        wrapperRef.current.style.setProperty('--cutEndPercent', endVal / max);

        wrapperRef.current.style.setProperty(
            '--cutStartPercent-txt',
            `"${formatSeconds(startVal)}"`
        );
        wrapperRef.current.style.setProperty(
            '--cutEndPercent-txt',
            `"${formatSeconds(endVal)}"`
        );

        onCutChange(startVal, endVal);
    }

    function onCutComplete() {
        const startVal = Number(cutStartRef.current);
        const endVal = Number(cutEndRef.current);

        onCutChangeComplete(startVal, endVal);
    }

    function setPlayerValue(val) {
        const startVal = Number(cutStartRef.current);
        const endVal = Number(cutEndRef.current);
        wrapperRef.current.style.setProperty('--rangePercent', val / max || 0);
        wrapperRef.current.style.setProperty(
            '--rangePercent-txt',
            `"${formatSeconds(val)}"`
        );
    }

    function onPlayInput() {
        const val = Number(playerInpRef.current.value);
        valueRef.current.textContent = formatSeconds(val);
        setPlayerValue(val);
        onInput(val);
    }

    function onPlayInputComplete() {
        const val = Number(playerInpRef.current.value);
        if (val < cutStartRef.current || val > cutEndRef.current) {
            playerInpRef.current.value = cutStartRef.current;
        }
    }

    useEffect(() => {
        if (isDragging.current) return;

        playerInpRef.current.value = Number(setValue);
        setPlayerValue(Number(setValue));
        valueRef.current.textContent = formatSeconds(setValue);
    }, [setValue]);

    useEffect(() => {
        cutStartInpRef.current.value = Number(min);
        cutEndInpRef.current.value = Number(
            max - min > maxLength ? maxLength : max
        );
        playerInpRef.current.value = Number(defaultValue) / Number(max);
        onCutInput();
    }, [min, max, defaultValue, maxLength]);

    return (
        <div
            className={`multi-slider_wrapper ${className ?? ''} ${disabled ? 'disabled' : ''}`}
            ref={wrapperRef}
        >
            <div className="slider">
                <div className="track"></div>
                {mode != 'edit' ? (
                    ''
                ) : (
                    <>
                        <div className="thumb left" ref={leftThumbRef}></div>
                        <div className="thumb right" ref={rightThumbRef}></div>
                    </>
                )}
                <div className="thumb playThumb" ref={playThumbRef}></div>
            </div>

            <input
                type="range"
                step={0.1}
                onInput={onCutInput}
                onMouseDown={() => {
                    leftThumbRef.current.className = 'thumb left show-value';
                }}
                onMouseUp={async (e) => {
                    e.target.value = cutStartRef.current;
                    onCutComplete();
                    await delay(500);
                    leftThumbRef.current.className = 'thumb left';
                }}
                min={min}
                max={max}
                ref={cutStartInpRef}
                defaultValue={min}
                list="markers"
                hidden={mode != 'edit'}
            />

            <input
                type="range"
                step={0.1}
                onInput={onCutInput}
                onMouseDown={() => {
                    rightThumbRef.current.className = 'thumb right show-value';
                }}
                onMouseUp={async (e) => {
                    e.target.value = cutEndRef.current;
                    onCutComplete();
                    await delay(500);
                    rightThumbRef.current.className = 'thumb right';
                }}
                min={min}
                max={max}
                ref={cutEndInpRef}
                defaultValue={max - min > maxLength ? maxLength : max}
                list="markers"
                hidden={mode != 'edit'}
            />

            <input
                type="range"
                step={0.1}
                min={min}
                max={max}
                onInput={onPlayInput}
                ref={playerInpRef}
                defaultValue={defaultValue}
                className="playInput"
                onMouseDown={() => {
                    isDragging.current = true;
                    onInput();
                    playThumbRef.current.className =
                        'thumb playThumb show-value';
                }}
                onMouseUp={async () => {
                    onPlayInputComplete();
                    onInputComplete(playerInpRef.current.value);
                    isDragging.current = false;
                    await delay(500);
                    playThumbRef.current.className = 'thumb playThumb';
                }}
            />

            <div className="time-container">
                <span ref={valueRef}>{formatSeconds(0)}</span>
                <span>{formatSeconds(max || 0)}</span>
            </div>
        </div>
    );
}
