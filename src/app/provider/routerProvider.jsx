import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useLocation,
    Navigate,
} from 'react-router-dom';

import { UserProvider, useUser } from '~shared/scripts/userContextProvider';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

// ###

import Home from '~pages/home';
import About from '~pages/about';

import Points_View from '~pages/points/view';
import Points_Apply from '~pages/points/apply';
import Points_History from '~pages/points/history';
import Points_UserHistory from '~pages/points/userHistory';
import Points_Remarks from '~pages/points/remarks';
import Points_Reason from '~pages/points/reason';

import MyPoints_View from '~pages/myPoints/view';

import Dorm_Repair from '~pages/dorm/repair';
import Dorm_Status from '~pages/dorm/status';
import Dorm_Settings from '~pages/dorm/settings';

import MyDorm_View from '~pages/myDorm/view';
import MyDorm_Repair from '~pages/myDorm/repair';

import Case_Control from '~pages/remote/case/control';
import Case_Schedule from '~pages/remote/case/schedule';
import Case_History from '~pages/remote/case/history';

import Songs_View from '~pages/remote/songs/view';
import Songs_Request from '~pages/remote/songs/request';

import PLMA_Accounts from '~pages/plma/accounts';
import IAM_Accounts from '~pages/iam/accounts';

import Page404 from '~pages/404';
import Page403 from '~pages/403';
import Page401 from '~pages/401';

// ###

import Navbar from '~shared/ui/navbar';
import Sidebar from '~shared/ui/sidebar';
import { pathKeys } from '~shared/lib/react-router/pathKey.js';
import { useEffect, useMemo } from 'react';

function Layout() {
    const location = useLocation();
    const isFullScreen = location.pathname === pathKeys.about.root().link;
    const { user } = useUser();

    if (user.isDefaultValue) return null;

    return (
        <>
            <Sidebar userPermissions={user.permissions} />
            <Navbar />
            <div className={isFullScreen ? 'fullScreen' : 'panel'}>
                <div className="panel_wrap">
                    {!user.isLogined ? (
                        <Navigate to="/401/" replace />
                    ) : (
                        <Outlet />
                    )}
                </div>
            </div>
        </>
    );
}

const routesWithPermissions = [
    { pathKey: pathKeys.home.root(), element: <Home /> },
    { pathKey: pathKeys.about.root(), element: <About /> },

    { pathKey: pathKeys.points.view(), element: <Points_View /> },
    { pathKey: pathKeys.points.apply(), element: <Points_Apply /> },
    { pathKey: pathKeys.points.history(), element: <Points_History /> },
    {
        pathKey: pathKeys.points.user_history(),
        element: <Points_UserHistory />,
    },
    { pathKey: pathKeys.points.remarks(), element: <Points_Remarks /> },
    { pathKey: pathKeys.points.reason(), element: <Points_Reason /> },

    { pathKey: pathKeys.points.myPoints.view(), element: <MyPoints_View /> },

    { pathKey: pathKeys.dorm.status(), element: <Dorm_Status /> },
    { pathKey: pathKeys.dorm.settings(), element: <Dorm_Settings /> },
    { pathKey: pathKeys.dorm.repair(), element: <Dorm_Repair /> },

    { pathKey: pathKeys.dorm.myDorm.view(), element: <MyDorm_View /> },
    { pathKey: pathKeys.dorm.myDorm.repair(), element: <MyDorm_Repair /> },

    { pathKey: pathKeys.plma.accounts(), element: <PLMA_Accounts /> },
    { pathKey: pathKeys.iam.accounts(), element: <IAM_Accounts /> },

    { pathKey: pathKeys.remote.case.control(), element: <Case_Control /> },
    { pathKey: pathKeys.remote.case.schedule(), element: <Case_Schedule /> },
    { pathKey: pathKeys.remote.case.history(), element: <Case_History /> },
    { pathKey: pathKeys.remote.songs.view(), element: <Songs_View /> },
    { pathKey: pathKeys.remote.songs.request(), element: <Songs_Request /> },

    { pathKey: pathKeys.page403(), element: <Page403 /> },
    { pathKey: pathKeys.page401(), element: <Page401 /> },
];

function AppRouterInner() {
    const { user } = useUser();

    const router = useMemo(() => {
        const filteredRoutes = routesWithPermissions
            .filter(
                (route) =>
                    !route.pathKey.permission ||
                    user.permissions.has(route.pathKey.permission)
            )
            .map(({ pathKey, element }) =>
                !pathKey.permission || user.permissions.has(pathKey.permission)
                    ? {
                          path: pathKey.link,
                          element,
                      }
                    : {
                          path: pathKey.link,
                          element: <Page403 />,
                      }
            );

        return createBrowserRouter([
            {
                element: <Layout />,
                children: [
                    ...filteredRoutes,
                    { path: '*', element: <Page404 /> },
                ],
            },
        ]);
    }, [user]);

    return <RouterProvider router={router} />;
}

export default function AppRouter() {
    return (
        <UserProvider>
            <AppRouterInner />
        </UserProvider>
    );
}
