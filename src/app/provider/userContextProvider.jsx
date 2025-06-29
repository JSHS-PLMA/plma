import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const userType = {
    guest: new Set(['']),
    student: new Set([
        'viewMyPointsView',

        'viewMyDormView',
        'viewMyDormRepair',

        'viewSchoolMyInfo',
        'viewSchoolReportCard',
    ]),
    admin: new Set([
        'viewPointsView',
        'viewPointsApply',
        'viewPointsEdit',
        'viewPointsUserHistory',
        'viewPointsHistory',
        'viewPointsRemarks',
        'viewPointsReason',
        'viewPointsLogs',
        'viewPointsFix',
        'viewMyPointsView',

        'viewDormStatus',
        'viewDormSettings',
        'viewDormRepair',
        'viewMyDormView',
        'viewMyDormRepair',

        'viewRemoteCaseControl',
        'viewRemoteCaseSchedule',
        'viewRemoteCaseHistory',
        'viewRemoteSongsView',
        'viewRemoteSongsRequest',

        'viewPLMAAccounts',
        'viewIAMAccounts',
        'viewIAMAccess',
    ]),
};

// Context 생성
const UserContext = createContext({
    user: null,
    setUser: () => {},
});

// Context 사용 훅
export const useUser = () => useContext(UserContext);

// Provider
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        permissions:
            import.meta.env.VITE_ENV_MODE == 'development'
                ? userType['admin']
                : '',
    });

    async function init() {
        const data = await axios.get('/api/check-session');
        console.log(data);

        setUser({
            permissions: data.permissions,
        });
    }

    useEffect(() => {
        console.log(
            import.meta.env.VITE_ENV_MODE,
            import.meta.env.VITE_ENV_MODE == 'production'
        );
        if (import.meta.env.VITE_ENV_MODE == 'production') init();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
