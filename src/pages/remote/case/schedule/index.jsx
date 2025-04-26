import { useState, useEffect } from 'react';

import './index.scss';

import { getData } from '~shared/scripts/requestData';

import DataTable from '~shared/ui/datatable';
import { Card } from 'react-bootstrap';

function Case_Control() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        async function init() {
            const schedules = await getData('/api/remote/schedule');

            const dataList = schedules.map((x) => {
                const { id, cron, bhv } = x;

                return [id, cron, bhv];
            });

            setTableData(dataList);
            setColumns([
                { data: 'ID', orderable: false },
                { data: 'cron', orderable: false },
                { data: 'behave', orderable: false },
            ]);
        }

        init();
    }, []);

    return (
        <>
            <div id="case_control">
                <Card>
                    <Card.Header>
                        <Card.Title>보관함 스케줄</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">보관함 스케줄</Card.Text>
                        <br />
                        <div className="tableWrap">
                            <DataTable
                                className="remoteCaseSchedule"
                                columns={columns}
                                data={tableData}
                                options={{
                                    search: false,
                                    pagination: false,
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
