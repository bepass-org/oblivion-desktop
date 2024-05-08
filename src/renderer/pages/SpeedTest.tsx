import classNames from 'classnames';
import Nav from '../components/Nav';

export default function SpeedTest() {
    return (
        <>
            <Nav title='تست سرعت' />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='container'>
                    <p>برای تست سرعت اینترنت می‌توانید از این‌ابزار استفاده نمایید.</p>
                    <div className='iframe'>
                        <iframe src='https://openspeedtest.com/Get-widget.php' allowFullScreen />
                    </div>
                </div>
            </div>
        </>
    );
}
