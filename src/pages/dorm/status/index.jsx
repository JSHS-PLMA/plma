import { useState, useEffect } from 'react';

import DataTable from '~shared/ui/datatable';

import { Card, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { getData } from '~shared/scripts/requestData';
import './index.scss';

function Dorm_Status() {
    const [grade, setGrade] = useState(1);
    const [year, setYear] = useState(2025);
    const [semester, setSemester] = useState(1);
    const [dormName, setDormName] = useState('송죽관');

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const filteredTableData = tableData.filter(
        (x) =>
            x[1] == grade &&
            x[2] == year &&
            x[3] == semester &&
            x[4] == dormName
    );

    const grades = [
        { name: '1학년', value: 1 },
        { name: '2학년', value: 2 },
        { name: '3학년', value: 3 },
    ];

    useEffect(() => {
        async function init() {
            const data = await getData('/api/dorms');

            const dataList = [];

            for (let i = 0; i < data.length; i++) {
                dataList.push([
                    `${String(data[i].room_name)}`,
                    data[i].room_grade,
                    data[i].year,
                    data[i].semester,
                    data[i].dorm_name,
                    data[i].users[0] ? data[i].users[0].name : '',
                    data[i].users[1] ? data[i].users[1].name : '',
                    data[i].users[2] ? data[i].users[2].name : '',
                    data[i].users[3] ? data[i].users[3].name : '',
                ]);
            }

            setColumns([
                { data: '호실', className: 'dt-first', orderable: false },
                { data: 'grade', hidden: true },
                { data: 'year', hidden: true },
                { data: 'semester', hidden: true },
                { data: 'dorm_name', hidden: true },
                { data: '1반', orderable: false },
                { data: '2반', orderable: false },
                { data: '3반', orderable: false },
                { data: '4반', orderable: false },
            ]);
            setTableData(dataList);
        }

        init();
    }, []);

    return (
        <>
            <div id="dorm_status">
                <Card>
                    <Card.Header>
                        <Card.Title>기숙사 현황</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex flex-row mb-3">
                            <div className="me-3">
                                <Card.Text className="label">연도</Card.Text>
                                <select
                                    className="form-select"
                                    value={year}
                                    onChange={(e) =>
                                        setYear(Number(e.target.value))
                                    }
                                >
                                    {Array.from(
                                        {
                                            length:
                                                new Date().getFullYear() - 2024,
                                        },
                                        (_, i) => 2025 + i
                                    ).map((yearOption) => (
                                        <option
                                            key={yearOption}
                                            value={yearOption}
                                        >
                                            {yearOption}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="me-3">
                                <Card.Text className="label">학기</Card.Text>
                                <select
                                    className="form-select"
                                    value={semester}
                                    onChange={(e) =>
                                        setSemester(Number(e.target.value))
                                    }
                                >
                                    <option value={1}>1학기</option>
                                    <option value={2}>2학기</option>
                                </select>
                            </div>
                            <div>
                                <Card.Text className="label">기숙사</Card.Text>
                                <select
                                    className="form-select"
                                    value={dormName}
                                    onChange={(e) =>
                                        setDormName(e.target.value)
                                    }
                                >
                                    <option value="송죽관">송죽관</option>
                                    <option value="동백관">동백관</option>
                                </select>
                            </div>
                        </div>

                        <Card.Text className="label">학년 선택</Card.Text>
                        <ToggleButtonGroup
                            type="radio"
                            name="grade-options"
                            value={grade}
                            onChange={(value) => setGrade(value)}
                        >
                            {grades.map((x, idx) => {
                                return (
                                    <ToggleButton
                                        key={idx}
                                        variant={
                                            idx + 1 == { grade }
                                                ? 'dark'
                                                : 'outline-dark'
                                        }
                                        id={`grade-btn-${idx + 1}`}
                                        value={idx + 1}
                                    >
                                        {x.name}
                                    </ToggleButton>
                                );
                            })}
                        </ToggleButtonGroup>

                        <div className="tableWrap">
                            <br />
                            <Card.Text className="label">호실 현황</Card.Text>
                            <DataTable
                                className="dormStatusTable"
                                columns={columns}
                                data={filteredTableData}
                                order={[0, 'asc']}
                                options={{
                                    pagination: false,
                                    search: false,
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Dorm_Status;
