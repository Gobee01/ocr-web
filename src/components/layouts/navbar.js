import React, { useEffect, useState } from "react";
import { NavLink,  useLocation } from "react-router-dom";
import senzmateLogo from "../../images/senzmate-logo.png";
import moment from "moment";

function Navbar() {
    const location = useLocation();
    const [pathName, setPathName] = useState("");

    useEffect(() => {
        const selectedPathName = window.location.pathname.slice(-1) === "/"? window.location.pathname.slice(0, -1) : window.location.pathname;
        setPathName(selectedPathName);
    }, [location]);

    function renderItems() {
        return [
            { name: 'Documents', url: '/upload' }
            // Add more items as needed
        ].map((item, index) => (
            <NavLink key={index} to={item.url} activeClassName="navbar-active" className="menu-item">
                {item.name}
            </NavLink> 
        ));
    }

    return (
        <header className="app-header">
            <img src={senzmateLogo} alt="App Logo" className="app-logo" />
            <nav className="app-menu">
                {renderItems()}
            </nav>
            <div className="user-info">
                <span>User</span>
                <time>{moment().format("lll")}</time>
            </div>
            <div className="notification">
                <button >User</button>
                <div className="user-dropdown">
                    {/* Placeholder for menu items */}
                </div>
            </div>
        </header>
    );
}

export default Navbar;