import classNames from 'classnames';
import {useState} from "react";
import Nav from '../components/Nav';
import Modal from '../components/Modal';
import { toggleDarkMode } from '../lib/utils';

export default function Settings() {
    const [darkModeStatus, setDarkModeStatus] = useState(document.documentElement.getAttribute('data-bs-theme') === 'dark');

    return (
        <>
            <Nav title='تنظیمات' />
            {/*<Modal title='تغییر اندپوینت' />*/}
            <div className={classNames(
                "myApp",
                "normalPage"
            )}>
                <div className="settings">
                    <div className="item">
                        <label className="key">
                            اندپوینت
                        </label>
                        <div className="value">
                            <span className="dirLeft">engage.cloudflareclient.com</span>
                        </div>
                        <div className="info">
                            ترکیبی از IP یا نام دامنه، به‌همراه پورت
                        </div>
                    </div>
                    <div className="item">
                        <label className="key">
                            پورت تونل
                        </label>
                        <div className="value">
                            <span className="dirLeft">8086</span>
                        </div>
                        <div className="info">
                            تعیین پورت تونل برنامه
                        </div>
                    </div>
                    <div className="item">
                        <label className="key">
                            سایفون
                        </label>
                        <div className="value">
                            <div
                                className={classNames(
                                    "checkbox",
                                )}
                            >
                                <i className="material-icons">&#xe876;</i>
                            </div>
                        </div>
                        <div className="info">
                            فعالسازی سایفون
                        </div>
                    </div>
                    <div className="item">
                        <label className="key">
                            انتخاب کشور
                        </label>
                        <div className="value">
                            <select>
                                <option value="">Automatic</option>
                                <option value="AT">Austria</option>
                                <option value="BE">Belgium</option>
                                <option value="BG">Bulgaria</option>
                                <option value="BR">Brazil</option>
                                <option value="CA">Canada</option>
                                <option value="CH">Switzerland</option>
                                <option value="CZ">Czech Republic</option>
                                <option value="DE">Germany</option>
                                <option value="DK">Denmark</option>
                                <option value="EE">Estonia</option>
                                <option value="ES">Spain</option>
                                <option value="FI">Finland</option>
                                <option value="FR">France</option>
                                <option value="GB">United Kingdom</option>
                                <option value="HU">Hungary</option>
                                <option value="IE">Ireland</option>
                                <option value="IN">India</option>
                                <option value="IT">Italy</option>
                                <option value="JP">Japan</option>
                                <option value="LV">Latvia</option>
                                <option value="NL">Netherlands</option>
                                <option value="NO">Norway</option>
                                <option value="PL">Poland</option>
                                <option value="RO">Romania</option>
                                <option value="RS">Serbia</option>
                                <option value="SE">Sweden</option>
                                <option value="SG">Singapore</option>
                                <option value="SK">Slovakia</option>
                                <option value="UA">Ukraine</option>
                                <option value="US">United States</option>
                            </select>
                        </div>
                        <div className="info">
                            انتخاب آی‌پی کشور موردنظر
                        </div>
                    </div>
                    <div className="item">
                        <label className="key">
                            لایسنس
                        </label>
                        <div className="value">
                            <span className="dirLeft">XXXX-XXXX</span>
                        </div>
                        <div className="info">
                            اگر لایسنس دارید (هر لایسنس 2x می‌شود)
                        </div>
                    </div>
                    <div className="item">
                        <label className="key">
                            گول
                        </label>
                        <div className="value">
                            <div
                                className={classNames(
                                    "checkbox",
                                )}
                            >
                                <i className="material-icons">&#xe876;</i>
                            </div>
                        </div>
                        <div className="info">
                            فعالسازی Warp In Warp
                        </div>
                    </div>
                    <div
                        className="item"
                        onClick={() => {
                            toggleDarkMode();
                            setDarkModeStatus(!darkModeStatus);
                        }}
                    >
                        <label className="key" htmlFor="flexSwitchCheckChecked">
                            حالت تیره
                        </label>
                        <div className="value">
                            <div
                                className={classNames(
                                    "checkbox",
                                    (darkModeStatus ? "checked" : ""),
                                )}
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
