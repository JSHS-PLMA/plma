import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

import { Card } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData } from '~shared/scripts/requestData';

function Points_View() {
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        async function init() {
            try {
                const records = await getData('/api/points/view');

                const dataList = records.map((x, idx) => {
                    const { id, stuid, grade, num, name, plus, minus } = x;
                    const className = x.class;

                    return [
                        <NavLink to={`/points/user_history/${id}`} key={idx}>
                            {stuid}
                        </NavLink>,
                        stuid,
                        grade,
                        className,
                        num,
                        <NavLink to={`/points/user_history/${id}`} key={idx}>
                            {name}
                        </NavLink>,
                        name,
                        plus,
                        minus,
                        0,
                        plus - minus,
                    ];
                });

                setTableData(dataList);
                setColumns([
                    { data: '학번', className: 'dt-link', orderBase: 1 },
                    { hidden: true },
                    { data: '학년' },
                    { data: '반' },
                    { data: '번호' },
                    {
                        data: '성명',
                        className: 'dt-name dt-link',
                        orderBase: 6,
                    },
                    { hidden: true },
                    { data: '누계 상점' },
                    { data: '누계 벌점' },
                    { data: '기타' },
                    { data: '합계', className: 'dt-sum' },
                ]);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    return (
        <>
            <div id="points_view">
                <Card>
                    <Card.Header>
                        <Card.Title>상벌점 현황</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">학생 검색</Card.Text>

                        <div className="tableWrap">
                            <br />
                            <Card.Text className="label">상벌점 현황</Card.Text>

                            <DataTable
                                className="pointsViewTable"
                                columns={columns}
                                data={tableData}
                                options={{
                                    language: {
                                        search: '통합 검색: ',
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

export default Points_View;
