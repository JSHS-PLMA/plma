import './index.scss';
import { useEffect, useRef } from 'react';

export function Slider({
    min = 0,
    max = 100,
    defaultValue = 0,
    setValue = 0,
    className,
    onInput,
    onInputComplete,
    mode,
}) {
    const inputRef = useRef();
    const wrapperRef = useRef();

    const isDragging = useRef(false);

    function valueInput() {
        const val = `${(inputRef.current.value / max) * 100}%`;
        wrapperRef.current.style.setProperty('--valuePercent', val);
    }

    useEffect(() => {
        inputRef.current.value = setValue;
        valueInput();
    }, [setValue]);

    return (
        <div className={`slider_wrapper ${className}`} ref={wrapperRef}>
            <input
                type="range"
                step={0.1}
                onInput={valueInput}
                min={min}
                max={max}
                ref={inputRef}
                defaultValue={defaultValue}
                onMouseDown={() => {
                    isDragging.current = true;
                    onInput();
                }}
                onMouseUp={() => {
                    isDragging.current = false;
                    onInputComplete(inputRef.current.value);
                }}
            />
        </div>
    );
}
