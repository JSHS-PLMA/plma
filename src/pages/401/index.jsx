import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

function Page401() {
    return (
        <>
            <div id="401">
                <h4>
                    Welcome to
                    <br />
                </h4>
                <h1>JSHSUS CMS SERVICE</h1>
                <h4>
                    로그아웃 상태입니다! 서비스를 이용하시려면{' '}
                    <Link to="https://iam.jshsus.kr/?service=iam2">로그인</Link>{' '}
                    해주세요~
                </h4>
            </div>
        </>
    );
}

export default Page401;
