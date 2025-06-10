import { useEffect, useRef, useState, useCallback } from 'react';

export default function useAudioPlayer(onTimeUpdate) {
    const currentAudio = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(null);
    const currentTimeRef = useRef(0);
    const animationRef = useRef(null);

    const updateTime = useCallback(() => {
        if (currentAudio.current && !currentAudio.current.paused) {
            const time = currentAudio.current.currentTime;
            currentTimeRef.current = time;
            if (onTimeUpdate) onTimeUpdate(time, currentAudio.current); // 외부로 전달
        }
        animationRef.current = requestAnimationFrame(updateTime);
    }, [onTimeUpdate]);

    const play = async (fileUrl, onEndCallback) => {
        try {
            if (!fileUrl) return;

            // 기존 오디오 정리
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current.src = '';
                currentAudio.current.onended = null;
                currentAudio.current = null;
            }
            cancelAnimationFrame(animationRef.current);

            const audio = new Audio(fileUrl);
            audio.crossOrigin = 'anonymous';
            currentAudio.current = audio;

            audio.play();
            setPlaying(true);
            setFileUploaded(true);

            animationRef.current = requestAnimationFrame(updateTime);

            audio.onended = () => {
                setPlaying(false);
                setFileUploaded(null);
                cancelAnimationFrame(animationRef.current);
                if (onEndCallback) onEndCallback();
            };

            return audio;
        } catch (error) {
            console.error('오디오 재생 오류:', error);
        }
    };

    const pause = () => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            setPlaying(false);
        }
    };

    const resume = () => {
        if (currentAudio.current) {
            currentAudio.current.play();
            setPlaying(true);
        }
    };

    const seek = (t) => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = t;
            currentAudio.current.play();
        }
    };

    const stop = () => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = 0;
            setPlaying(false);
            setFileUploaded(null);
            cancelAnimationFrame(animationRef.current);
        }
    };

    useEffect(() => {
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return {
        play,
        pause,
        resume,
        seek,
        stop,
        playing,
        fileUploaded,
    };
}
