import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import './index.scss';

import { useUser } from '~shared/scripts/userContextProvider';

const Navbar = () => {
    const { user } = useUser();

    return (
        <div className="navbar">
            <div className="navbar_wrap">
                <div className="nav-item account">
                    {user.isLogined ? (
                        <p className="nav-link account_name">{user.name}</p>
                    ) : (
                        <Link
                            to="https://iam.jshsus.kr/?service=iam2"
                            className="nav-link account_name"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
