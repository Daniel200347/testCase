import { useState, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';

const routes = [
    { title: 'Dashboard', icon: 'house', path: '/' },
    { title: 'Sales', icon: 'chart-line', path: '/sales' },
    { title: 'Costs', icon: 'chart-column', path: '/costs' },
    { title: 'Payments', icon: 'wallet', path: '/payments' },
    { title: 'Finances', icon: 'chart-pie', path: '/finances' },
    { title: 'Messages', icon: 'envelope', path: '/messages' },
];

const bottomRoutes = [
    { title: 'Settings', icon: 'sliders', path: '/settings' },
    { title: 'Support', icon: 'phone-volume', path: '/support' },
];

const Sidebar = ({ color, onToggleTheme }) => {
    const [isOpened, setIsOpened] = useState(false);
    const [activeRoute, setActiveRoute] = useState('/payments');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [tooltipData, setTooltipData] = useState({ visible: false, text: '', top: 0, left: 0 });
    const [measuredDropdownHeight, setMeasuredDropdownHeight] = useState(0);

    const accountDropdownRef = useRef(null);
    const userAccountItemRef = useRef(null);

    const containerClassnames = classnames('sidebar', {
        'sidebar--opened': isOpened,
        [`sidebar--${color}`]: color,
    });

    const resetTooltip = useCallback(() => setTooltipData({ visible: false, text: '', top: 0, left: 0 }), []);

    const goToRoute = useCallback((path) => {
        setActiveRoute(path);
        setShowAccountDropdown(false);
        resetTooltip();
    }, [resetTooltip]);

    const toggleSidebar = useCallback(() => {
        setIsOpened(v => !v);
        setShowAccountDropdown(false);
        resetTooltip();
    }, [resetTooltip]);

    const toggleAccountDropdown = useCallback((e) => {
        e.stopPropagation();
        if (isOpened || (userAccountItemRef.current && userAccountItemRef.current.contains(e.target) && !isOpened)) {
            setShowAccountDropdown(v => !v);
        } else if (!isOpened) {
            resetTooltip();
        }
    }, [isOpened, resetTooltip]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target) &&
                userAccountItemRef.current && !userAccountItemRef.current.contains(event.target)) {
                setShowAccountDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showAccountDropdown && accountDropdownRef.current) {
            const height = accountDropdownRef.current.offsetHeight;
            if (height > 0 && height !== measuredDropdownHeight) {
                setMeasuredDropdownHeight(height);
            }
        }
    }, [showAccountDropdown, measuredDropdownHeight]);

    const handleItemHover = useCallback((event, route) => {
        if (!isOpened && !showAccountDropdown) {
            const hoveredItemRect = event.currentTarget.getBoundingClientRect();
            const sidebarElement = document.querySelector('.sidebar');
            const sidebarRect = sidebarElement ? sidebarElement.getBoundingClientRect() : null;

            if (!sidebarRect) return;

            const tooltipTop = hoveredItemRect.top + hoveredItemRect.height / 2;
            const tooltipLeft = sidebarRect.right + 10;

            setTooltipData({
                visible: true,
                text: route.title,
                top: tooltipTop,
                left: tooltipLeft,
            });
        }
    }, [isOpened, showAccountDropdown]);

    const handleUserAccountHover = useCallback((event) => {
        if (!isOpened && !showAccountDropdown) {
            const hoveredItemRect = event.currentTarget.getBoundingClientRect();
            const sidebarElement = document.querySelector('.sidebar');
            const sidebarRect = sidebarElement ? sidebarElement.getBoundingClientRect() : null;

            if (!sidebarRect) return;

            const tooltipTop = hoveredItemRect.top + hoveredItemRect.height / 2;
            const tooltipLeft = sidebarRect.right + 10;

            setTooltipData({
                visible: true,
                text: 'User Account',
                top: tooltipTop,
                left: tooltipLeft,
            });
        }
    }, [isOpened, showAccountDropdown]);


    const handleItemLeave = useCallback(() => {
        resetTooltip();
    }, [resetTooltip]);

    const getDropdownPosition = useCallback(() => {
        if (!userAccountItemRef.current) return {};

        const userItemRect = userAccountItemRef.current.getBoundingClientRect();
        const sidebarElement = document.querySelector('.sidebar');
        if (!sidebarElement) return {};
        const sidebarRect = sidebarElement.getBoundingClientRect();

        const padding = 10;
        const dropdownWidth = 240;

        let finalLeft = sidebarRect.right + padding;
        const viewportWidth = window.innerWidth;
        if (finalLeft + dropdownWidth > viewportWidth - padding) {
            finalLeft = viewportWidth - dropdownWidth - padding;
        }

        const dropdownHeight = measuredDropdownHeight > 0 ? measuredDropdownHeight : 300;

        let finalTop;
        let transformOrigin;

        const spaceBelow = window.innerHeight - userItemRect.bottom;
        const spaceAbove = userItemRect.top;

        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            finalTop = userItemRect.bottom;
            transformOrigin = 'left top';
        } else {
            finalTop = userItemRect.top - dropdownHeight;
            transformOrigin = 'left bottom';
            if (finalTop < padding) {
                finalTop = padding;
            }
        }


        return {
            top: `${finalTop}px`,
            left: `${finalLeft}px`,
            transformOrigin: transformOrigin,
            width: 'auto',
            minWidth: `${dropdownWidth}px`,
        };
    }, [measuredDropdownHeight]);

    const renderNavigationItem = (route, isBottom = false) => {
        const itemClassnames = classnames(
            isBottom ? "sidebar__bottom-navigation-item" : "sidebar__navigation-item",
            { "sidebar__navigation-item--active": activeRoute === route.path }
        );
        const iconClassnames = classnames(
            isBottom ? "sidebar__bottom-navigation-icon" : "sidebar__navigation-icon",
            { "sidebar__navigation-icon--active": activeRoute === route.path }
        );
        const textClassnames = classnames(
            isBottom ? "sidebar__bottom-navigation-text" : "sidebar__navigation-text",
            { "sidebar__navigation-text--active": activeRoute === route.path }
        );

        return (
            <div
                key={route.title}
                onClick={() => goToRoute(route.path)}
                onMouseEnter={(e) => handleItemHover(e, route)}
                onMouseLeave={handleItemLeave}
                className={itemClassnames}
            >
                <FontAwesomeIcon icon={route.icon} className={iconClassnames} />
                <span className={textClassnames}>{route.title}</span>
            </div>
        );
    };

    return (
        <div className={containerClassnames}>
            <div className="sidebar__header">
                <img src={logo} alt="Technifly logo" className="sidebar__logo-image" />
                {isOpened && <span className="sidebar__title">Technifly</span>}
            </div>

            <div onClick={toggleSidebar} className="sidebar__toggle-button">
                <FontAwesomeIcon icon={isOpened ? 'angle-left' : 'angle-right'} className="sidebar__toggle-icon" />
            </div>

            <div className="sidebar__navigation">
                {routes.map(route => renderNavigationItem(route))}
            </div>

            <div className="sidebar__bottom-navigation">
                {bottomRoutes.map(route => renderNavigationItem(route, true))}
            </div>

            <div
                className="sidebar__theme-toggle-item"
                onClick={onToggleTheme}
                onMouseEnter={(e) => handleItemHover(e, { title: 'Сменить тему' })}
                onMouseLeave={handleItemLeave}
            >
                <FontAwesomeIcon icon="circle-half-stroke" className="sidebar__theme-toggle-icon" />
                {isOpened && <span className="sidebar__theme-toggle-text">Сменить тему</span>}
            </div>

            <div className="sidebar__divider"></div>

            <div
                className="sidebar__user-account"
                onClick={toggleAccountDropdown}
                onMouseEnter={handleUserAccountHover}
                onMouseLeave={handleItemLeave}
                ref={userAccountItemRef}
            >
                <div className="sidebar__user-avatar-wrapper">
                    <FontAwesomeIcon icon="user-circle" className="sidebar__user-avatar" />
                </div>
                {isOpened && (
                    <>
                        <div className="sidebar__user-info sidebar__user-info--wrapper">
                            <span className="sidebar__email-address">User Account</span>
                            <span className="sidebar__full-name">Mark T.</span>
                        </div>
                        <FontAwesomeIcon icon={showAccountDropdown ? 'angle-up' : 'angle-down'} className="sidebar__user-dropdown-icon" />
                    </>
                )}
            </div>

            {showAccountDropdown && (
                <div
                    className={classnames("sidebar__user-account-dropdown", {
                        "sidebar__user-account-dropdown--opened": showAccountDropdown
                    })}
                    style={getDropdownPosition()}
                    ref={accountDropdownRef}
                >
                    <div className="dropdown__header">
                        <FontAwesomeIcon icon="user-circle" className="dropdown__avatar" />
                        <div className="dropdown__user-details">
                            <span className="dropdown__user-name">Mark Talbierz</span>
                            <span className="dropdown__user-email">hello@talbierz.com</span>
                        </div>
                    </div>
                    <div className="dropdown__menu-item" onClick={() => console.log('View profile')}>
                        <span>View profile</span>
                    </div>
                    <div className="dropdown__menu-item" onClick={() => console.log('Manage subscriptions')}>
                        <span>Manage subscriptions</span>
                    </div>
                    <div className="dropdown__menu-item" onClick={() => console.log('View history')}>
                        <span>View history</span>
                    </div>
                    <div className="dropdown__menu-item dropdown__menu-item--logout" onClick={() => console.log('Logout')}>
                        <span>Logout</span>
                        <FontAwesomeIcon icon="arrow-right-from-bracket" className="dropdown__item-icon" />
                    </div>
                    <div className="dropdown__version-info">
                        <span>v 1.0.34 - </span>
                        <span className="dropdown__version-info--link">Terms and Conditions</span>
                    </div>
                </div>
            )}

            {tooltipData.visible && (
                <div
                    className={classnames("sidebar__tooltip", {
                        "sidebar__tooltip--visible": tooltipData.visible,
                    })}
                    style={{
                        top: `${tooltipData.top}px`,
                        left: `${tooltipData.left}px`,
                        transform: 'translateY(-50%)',
                    }}
                >
                    {tooltipData.text}
                </div>
            )}
        </div>
    );
};

Sidebar.propTypes = {
    color: PropTypes.string,
    onToggleTheme: PropTypes.func.isRequired,
};

export default Sidebar;
