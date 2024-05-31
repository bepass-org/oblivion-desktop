import classNames from 'classnames';
import Nav from '../components/Nav';
import AnimatedComponent from '../components/Animated';

export default function SpeedTest() {
    return (
        <AnimatedComponent>
            <Nav title='تست سرعت' />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='container'>
                    <p>برای تست سرعت اینترنت می‌توانید از این‌ابزار استفاده نمایید.</p>
                    <div className='iframe'>
                        <iframe
                            src='https://openspeedtest.com/Get-widget.php'
                            allowFullScreen
                            title='speedtest'
                        />
                    </div>
                </div>
            </div>
        </AnimatedComponent>
    );
}
