import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import axios from 'axios';

import DataTable from '~shared/ui/datatable';
import { Card, Button } from 'react-bootstrap';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

import { getData } from '~shared/scripts/requestData';

function IAM_Accounts() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        let dataList = [];

        dataList = await getData('/api/iam');

        dataList = dataList.map((x, idx) => {
            const { id, stuid, name, grade, num, gender } = x;
            const className = x.class;

            return [
                id,
                stuid,
                name,
                grade,
                className,
                num,
                'PLMA, CLUBS',
                <>
                    <Button className="rowButton" variant="primary" size="sm">
                        편집
                    </Button>
                    <Button className="rowButton" variant="danger" size="sm">
                        삭제
                    </Button>
                </>,
            ];
        });

        setTableData(dataList);
        setColumns([
            { data: 'ID' },
            { data: '학번' },
            { data: '성명' },
            { data: '학년' },
            { data: '반' },
            { data: '번호' },
            { data: '연결된 서비스' },
            { data: '#', orderable: false },
        ]);
    }

    return (
        <>
            <div id="iam_accounts">
                <Card>
                    <Card.Header>
                        <Card.Title>전체 계정 관리</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="tableWrap">
                            <Card.Text className="label">
                                전체 계정 목록
                            </Card.Text>
                            <DataTable
                                className="pointsApplyTable"
                                data={tableData}
                                columns={columns}
                                order={[1, 'asc']}
                                options={{
                                    language: {
                                        search: '통합검색:',
                                    },
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default IAM_Accounts;
