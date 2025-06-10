import './index.scss';
import { useEffect, useRef, useState } from 'react';

export function Slider2({
    min = 0,
    max = 100,
    defaultValue = 0,
    setValue = 0,
    className,
    maxLength = 300,
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
    const playerRef = useRef(min);

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

        wrapperRef.current.style.setProperty('--rangePercent', val / max);
    }

    function onPlayInput() {
        const val = Number(playerInpRef.current.value);
        setPlayerValue(val);
        onInput(val);
    }

    function onPlayInputComplete() {
        onInputComplete();
    }

    useEffect(() => {
        playerInpRef.current.value = Number(setValue);
        setPlayerValue(Number(setValue));
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
            className={`multi-slider_wrapper ${className ?? ''}`}
            ref={wrapperRef}
        >
            <div className="slider">
                <div className="track"></div>
                <div className="range"></div>
                <div className="thumb left"></div>
                <div className="thumb right"></div>
                <div className="thumb playThumb"></div>
            </div>

            <input
                type="range"
                step={0.1}
                onInput={onCutInput}
                onMouseUp={(e) => {
                    e.target.value = cutStartRef.current;
                    onCutComplete();
                }}
                min={min}
                max={max}
                ref={cutStartInpRef}
                defaultValue={min}
                list="markers"
            />

            <input
                type="range"
                step={0.1}
                onInput={onCutInput}
                onMouseUp={(e) => {
                    e.target.value = cutEndRef.current;
                    onCutComplete();
                }}
                min={min}
                max={max}
                ref={cutEndInpRef}
                defaultValue={max - min > maxLength ? maxLength : max}
                list="markers"
            />

            <input
                type="range"
                step={0.1}
                onInput={onPlayInput}
                min={min}
                max={max}
                ref={playerInpRef}
                onMouseUp={(e) => {
                    onPlayInputComplete();
                }}
                defaultValue={defaultValue}
                className="playInput"
            />

            <datalist id="markers">
                <option value={0}></option>
                <option value={max}></option>
            </datalist>
        </div>
    );
}
