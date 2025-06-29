import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

function Page403() {
    return (
        <>
            <div id="403">403 Error: You Don't have access to this page.</div>
        </>
    );
}

export default Page403;
