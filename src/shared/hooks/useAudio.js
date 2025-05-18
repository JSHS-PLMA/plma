import { useEffect, useRef, useState, useCallback } from 'react';

export default function useAudioPlayer(onTimeUpdate) {
    const currentAudio = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const animationRef = useRef(null);

    const updateTime = useCallback(() => {
        if (currentAudio.current && !currentAudio.current.paused) {
            const time = currentAudio.current.currentTime;
            setCurrentTime(time);
            if (onTimeUpdate) onTimeUpdate(time, currentAudio.current); // 외부로 전달
        }
        animationRef.current = requestAnimationFrame(updateTime);
    }, [onTimeUpdate]);

    const play = async (fileUrl, onEndCallback) => {
        try {
            if (!fileUrl) return;

            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }

            const audio = new Audio(fileUrl);
            audio.play();
            audio.crossOrigin = 'anonymous';
            currentAudio.current = audio;
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
        stop,
        playing,
        fileUploaded,
        currentTime,
    };
}
