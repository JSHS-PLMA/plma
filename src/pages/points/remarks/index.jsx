import { useState, useEffect } from 'react';

import DataTable from '~shared/ui/datatable';
import { Card } from 'react-bootstrap';

import './index.scss';

function Points_Remarks() {
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        async function init() {
            setTableData([]);
            setColumns([
                { data: 'ID' },
                { data: '성명 (학번)' },
                { data: '누계' },
                { data: '초과 시점' },
                { data: '#' },
            ]);
        }
        init();
    }, []);

    return (
        <>
            <div id="points_remarks">
                <Card>
                    <Card.Header>
                        <Card.Title>퇴사 / 모범상 관리</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">퇴사 리스트</Card.Text>

                        <DataTable
                            className="pointsRemarksTable"
                            columns={columns}
                            data={tableData}
                            options={{
                                language: {
                                    search: '사유 검색: ',
                                },
                            }}
                        />
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header>
                        <Card.Title>모범 학생 대상자 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">모범상 리스트</Card.Text>
                        <DataTable
                            className="pointsRemarksTable"
                            columns={columns}
                            data={tableData}
                            options={{
                                language: {
                                    search: '사유 검색: ',
                                },
                            }}
                        />
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Points_Remarks;
