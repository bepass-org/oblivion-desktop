import classNames from 'classnames';
import Nav from '../components/Nav';
import { toggleDarkMode } from '../lib/utils';
import packageJsonData from "../../../package.json";

export default function Settings() {
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';

    return (
        <>
            <Nav title='تنظیمات' />
            <div className={classNames(
                "myApp",
                "normalPage"
            )}>
                <div className="container">
                    <div
        className="form-check form-switch"
        onClick={() => {
          toggleDarkMode();
        }}
      >
        <label className="form-check-label" htmlFor="flexSwitchCheckChecked">
          دارک‌مود:
        </label>
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckChecked"
          checked={false}
        />
      </div>
                </div>
            </div>
        </>
    );
}
