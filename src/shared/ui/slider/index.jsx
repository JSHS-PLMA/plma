import './index.scss';
import { useEffect, useRef } from 'react';

export function Slider({
    min = 0,
    max = 100,
    defaultValue = 0,
    setValue = 0,
    className,
}) {
    const inputRef = useRef();
    const wrapperRef = useRef();

    function onInput() {
        const val = `${(inputRef.current.value / max) * 100}%`;
        wrapperRef.current.style.setProperty('--valuePercent', val);
    }

    useEffect(() => {
        inputRef.current.value = setValue;
        onInput();
    }, [setValue]);

    return (
        <div className={`slider_wrapper ${className}`} ref={wrapperRef}>
            <input
                type="range"
                step="any"
                onInput={onInput}
                min={min}
                max={max}
                ref={inputRef}
                defaultValue={defaultValue}
            />
        </div>
    );
}
