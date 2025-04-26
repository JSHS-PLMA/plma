import { pathKeys } from '~shared/lib/react-router/pathKey.js';

export const config = [
    {
        wraps: [
            {
                links: [
                    {
                        pathKey: pathKeys.about.root(),
                        icon: 'shapes',
                        name: '서비스 소개',
                    },
                ],
            },
        ],
    },
    {
        legend: '상벌점제',
        wraps: [
            {
                header: {
                    icon: 'gift',
                    name: '상벌점 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.points.view(),
                        icon: 'print',
                        name: '상벌점 현황',
                    },
                    {
                        pathKey: pathKeys.points.apply(),
                        icon: 'stamp',
                        name: '상벌점 부여',
                    },
                    {
                        pathKey: pathKeys.points.history(),
                        icon: 'history',
                        name: '상벌점 기록',
                    },
                    {
                        pathKey: pathKeys.points.remarks(),
                        icon: 'ranking-star',
                        name: '퇴사 / 모범상 관리',
                    },
                    {
                        pathKey: pathKeys.points.reason(),
                        icon: 'comment-dots',
                        name: '사유 관리',
                    },
                ],
            },
            {
                header: {
                    icon: 'glasses',
                    name: '상벌점 검사',
                },
                links: [
                    {
                        pathKey: pathKeys.points.logs(),
                        icon: 'history',
                        name: '상벌점 기록 검사',
                    },
                    {
                        pathKey: pathKeys.points.fix(),
                        icon: 'wrench',
                        name: '상벌점 보정',
                    },
                ],
            },
            {
                header: {
                    icon: 'user-graduate',
                    name: '학생 상벌점 메뉴',
                },
                links: [
                    {
                        pathKey: pathKeys.points.myPoints.view(),
                        icon: 'id-card',
                        name: '내 상벌점',
                    },
                ],
            },
        ],
    },
    {
        legend: '기숙사',
        wraps: [
            {
                header: {
                    icon: 'house',
                    name: '기숙사 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.dorm.status(),
                        icon: 'house-user',
                        name: '기숙사 현황',
                    },
                    {
                        pathKey: pathKeys.dorm.settings(),
                        icon: 'house-laptop',
                        name: '기숙사 관리',
                    },
                    {
                        pathKey: pathKeys.dorm.repair(),
                        icon: 'flag',
                        name: '기숙사 수리 신청 관리',
                    },
                ],
            },
            {
                header: {
                    icon: 'house',
                    name: '학생 기숙사 메뉴',
                },
                links: [
                    {
                        pathKey: pathKeys.dorm.myDorm.view(),
                        icon: 'house-user',
                        name: '내 기숙사 현황',
                    },
                    {
                        pathKey: pathKeys.dorm.myDorm.repair(),
                        icon: 'flag',
                        name: '기숙사 시설 수리 신청',
                    },
                ],
            },
        ],
    },
    {
        legend: '기숙사 설비',
        wraps: [
            {
                header: {
                    icon: 'table-cells-column-lock',
                    name: '보관함 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.remote.case.control(),
                        icon: 'mobile-screen-button',
                        name: '보관함 조작',
                    },
                    {
                        pathKey: pathKeys.remote.case.schedule(),
                        icon: 'calendar-days',
                        name: '보관함 스케쥴',
                    },
                    {
                        pathKey: pathKeys.remote.case.history(),
                        icon: 'server',
                        name: '보관함 기록',
                    },
                ],
            },
            {
                header: {
                    icon: 'headphones',
                    name: '기상송 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.remote.songs.view(),
                        icon: 'play',
                        name: '기상송 조회',
                    },
                    {
                        pathKey: pathKeys.remote.songs.request(),
                        icon: 'music',
                        name: '기상송 신청',
                    },
                ],
            },
        ],
    },
    {
        legend: '학생 서비스',
        wraps: [
            {
                header: {
                    icon: 'user',
                    name: '학생 서비스 메뉴',
                },
                links: [
                    {
                        pathKey: pathKeys.school.myInfo(),
                        icon: 'id-badge',
                        name: '내 학적 정보 조회',
                    },
                    {
                        pathKey: pathKeys.school.reportCard(),
                        icon: 'scroll',
                        name: '내 성적표 조회',
                    },
                ],
            },
        ],
    },
    {
        legend: '계정 관리',
        wraps: [
            {
                header: {
                    icon: 'school-lock',
                    name: 'PLMA 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.plma.accounts(),
                        icon: 'user-tag',
                        name: '상벌점 계정 관리',
                    },
                ],
            },
            {
                header: {
                    icon: 'user-gear',
                    name: 'IAM 관리',
                },
                links: [
                    {
                        pathKey: pathKeys.iam.accounts(),
                        icon: 'users-gear',
                        name: '통합 계정 관리',
                    },
                ],
            },
        ],
    },
];
