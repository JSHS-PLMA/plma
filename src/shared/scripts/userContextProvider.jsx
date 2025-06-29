import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const userType = {
    guest: new Set(['']),
    student: new Set([
        'viewMyPointsView',

        'viewMyDormView',
        'viewMyDormRepair',

        'viewRemoteSongsView',
        'viewRemoteSongsRequest',
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
        'editSongs',
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
                ? userType['student']
                : new Set([]),
        isLogined: import.meta.env.VITE_ENV_MODE == 'development',
        name: '강재환',
        stuid: '9988',
        iamId: 594,
        userId: 32020,
        plmaId: 0,
    });

    async function init() {
        const data = (await axios.get('/api/check-session')).data;

        setUser({
            ...data,
            permissions: new Set(data.permissions),
        });
    }

    useEffect(() => {
        if (import.meta.env.VITE_ENV_MODE == 'production') {
            init();
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
