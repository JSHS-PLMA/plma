import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

import axios from 'axios';
import moment from 'moment';

import DataTable from '~shared/ui/datatable';
import { Card, Button } from 'react-bootstrap';

const TITLE = import.meta.env.VITE_TITLE;

import { getData } from '~shared/scripts/requestData';

function Case_History() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        init();
    }, []);

    async function init(allData = false) {
        let dataList = await getData('/api/remote/case/history', { allData });

        dataList = dataList.map((x, idx) => {
            const { id, operatedBy, affected, statusTo, operatedAt } = x;

            return [
                id,
                operatedBy.name,
                affected.name ?? (affected.all == true ? '전체' : '오류'),
                <span className={`type ${statusTo == 0 ? 'close' : 'open'}`}>
                    {statusTo == 0 ? '잠금' : '해제'}
                </span>,
                moment(operatedAt).format('YYYY-MM-DD HH:MM:SS'),
            ];
        });

        setTableData(dataList);
        setColumns([
            { data: 'ID' },
            { data: '권한자' },
            { data: '디바이스명' },
            { data: '조작', className: 'dt-content' },
            { data: '날짜', orderable: false },
        ]);
    }

    async function refreshData() {
        if (dataLoading) return;

        setDataLoading(true);
        await init();
        setDataLoading(false);
    }

    async function allData() {
        if (dataLoading) return;

        setDataLoading(true);
        await init(true);
        setDataLoading(false);
    }

    return (
        <>
            <div id="case_history">
                <Card>
                    <Card.Header>
                        <Card.Title>보관함 기록</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">보관함 기록</Card.Text>
                        <br />
                        <div className="tableWrap">
                            <DataTable
                                className="remoteCaseHistoryTable"
                                columns={columns}
                                data={tableData}
                                order={[0, 'desc']}
                                options={{
                                    language: {
                                        search: '통합 검색: ',
                                    },
                                    button: [
                                        <Button
                                            className="tableButton"
                                            onClick={refreshData}
                                            disabled={dataLoading}
                                            variant="primary"
                                        >
                                            새로고침
                                        </Button>,
                                        <Button
                                            className="tableButton"
                                            onClick={allData}
                                            disabled={dataLoading}
                                            variant="primary"
                                        >
                                            전체 기록 조회
                                        </Button>,
                                    ],
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Case_History;
