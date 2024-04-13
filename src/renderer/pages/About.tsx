import Nav from '../components/Nav';
import classNames from "classnames";
import packageJsonData from '../../../package.json';

export default function About() {
    return (
        <>
            <Nav title='درباره برنامه' />
            <div className={classNames(
                "myApp",
                "normalPage"
            )}>
                <div className="container">
                    <span className="dirLeft">
                        version: {packageJsonData.version}
                    </span>
                </div>
            </div>
        </>
    );
}
