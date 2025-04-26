import { useState, useEffect } from 'react';

import './index.scss';

import moment from 'moment';

import { getData, postData } from '~shared/scripts/requestData';

import DataTable from '~shared/ui/datatable';
import { Card, Button } from 'react-bootstrap';

function Case_Control() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        let dataList = await getData('/api/remote/case');

        dataList = dataList.map((x) => {
            const { id, status, name, updatedAt, updatedBy } = x;

            return [
                id,
                <span key={`dt-name-${id}`} className="dt-name">
                    {name}
                </span>,
                <span
                    key={`dt-status-${id}`}
                    className={`dt-status ${status ? 'open' : 'closed'}`}
                >
                    {status ? '해제 중' : '잠김'}
                </span>,
                <>
                    <Button
                        className="rowButton operation"
                        variant="success"
                        size="sm"
                    >
                        해제
                    </Button>
                    <Button
                        className="rowButton comm"
                        variant="primary"
                        size="sm"
                    >
                        통신
                    </Button>
                </>,
                `${moment(updatedAt).format('YYYY-MM-DD HH:MM:SS')} (${updatedBy})`,
            ];
        });

        setTableData(dataList);
        setColumns([
            { data: 'ID', orderable: false },
            { data: '디바이스명', orderable: false },
            { data: '잠금상태', orderable: false },
            { data: '조작 / 통신', orderable: false },
            { data: '마지막 기록', orderable: false },
        ]);
    }

    async function doAll(modeTo) {
        if (dataLoading) return;

        if (modeTo == 'open') postData(`/api/remote/case`);

        setDataLoading(true);
        await init(true);
        setDataLoading(false);
    }

    return (
        <>
            <div id="case_control">
                <Card>
                    <Card.Header>
                        <Card.Title>보관함 조작</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">보관함 조작</Card.Text>
                        <br />
                        <div className="tableWrap">
                            <DataTable
                                className="remoteCaseControl"
                                columns={columns}
                                data={tableData}
                                options={{
                                    search: false,
                                    pagination: false,
                                    button: [
                                        <Button
                                            key="button-openall"
                                            className="tableButton"
                                            onClick={() => {
                                                doAll('open');
                                            }}
                                            disabled={dataLoading}
                                            variant="success"
                                        >
                                            전체 해제
                                        </Button>,
                                        <Button
                                            key="button-closeall"
                                            className="tableButton"
                                            onClick={() => {
                                                doAll('close');
                                            }}
                                            disabled={dataLoading}
                                            variant="danger"
                                        >
                                            전체 잠금
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

export default Case_Control;
