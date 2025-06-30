import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '~shared/scripts/userContextProvider';
import { pathKeys } from '~shared/lib/react-router/pathKey';

import './index.scss';

// 경로 객체 안에서 link + permission 가진 것들만 뽑아내기
function extractPathObjs(obj) {
    let result = [];

    for (const value of Object.values(obj)) {
        if (typeof value === 'function') {
            const pathObj = value();
            if (pathObj && pathObj.link) {
                result.push(pathObj);
            }
        } else if (typeof value === 'object') {
            result = result.concat(extractPathObjs(value));
        }
    }

    return result;
}

function Home() {
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        const allPaths = extractPathObjs(pathKeys);

        const firstAccessible = allPaths.find(
            (pathObj) =>
                typeof pathObj === 'object' &&
                pathObj.link != '/' &&
                pathObj.link != '/about/' &&
                (!pathObj.permission ||
                    (user.permissions &&
                        user.permissions.has(pathObj.permission)))
        );

        console.log(firstAccessible);

        if (firstAccessible) {
            navigate(firstAccessible.link, { replace: true });
        } else {
            navigate('/403/', { replace: true }); // 권한 없을 때 fallback
        }
    }, [user, navigate]);

    return <div id="home"></div>;
}

export default Home;
