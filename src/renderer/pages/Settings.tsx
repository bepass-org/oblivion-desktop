import classNames from 'classnames';
import {useState} from "react";
import Nav from '../components/Nav';
import { toggleDarkMode } from '../lib/utils';

export default function Settings() {
    const [darkModeStatus, setDarkModeStatus] = useState(document.documentElement.getAttribute('data-bs-theme') === 'dark');

    return (
        <>
            <Nav title='تنظیمات' />
            <div className={classNames(
                "myApp",
                "normalPage"
            )}>
                <div className="settings">
                    <div className="item">
                        <label className="key" htmlFor="flexSwitchCheckChecked">حالت تیره</label>
                        <div className="value">
                            <div
                                className={classNames(
                                    "checkbox",
                                    (darkModeStatus ? "checked" : ""),
                                )}
                                 onClick={() => {
                                     toggleDarkMode();
                                     setDarkModeStatus(!darkModeStatus);
                                 }}
                            >
                                <i className="material-icons">&#xe876;</i>
                            </div>
                        </div>
                        <div className="info" id="flexSwitchCheckChecked">مشخص‌کردن حالت نمایش برنامه</div>
                    </div>
                </div>
            </div>
        </>
    );
}
