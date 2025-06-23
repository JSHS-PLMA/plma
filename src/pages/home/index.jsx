import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import VideoPlayer from '~shared/ui/videoPlayer';

import './index.scss';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/points/view');
    }, []);

    return (
        <>
            <div id="home"></div>
        </>
    );
}

export default Home;
