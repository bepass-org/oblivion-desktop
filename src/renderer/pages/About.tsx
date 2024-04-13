import classNames from "classnames";
import Nav from '../components/Nav';
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
                    <p className="dirLeft">
                        version: {packageJsonData.version}
                    </p>
                </div>
            </div>
        </>
    );
}
