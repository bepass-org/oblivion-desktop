import { useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import flag from '../../../assets/img/flags/ir.svg';

export default function Index() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e: any) => {
        if (isConnected) {
            setIsConnected(false);
        } else {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsConnected(true);
            }, 500);
        }
    };

    const status = isLoading
        ? 'درحال اتصال ...'
        : isConnected
          ? 'اتصال برقرار شد'
          : 'متصل نیستید';

    return (
        <>
            <nav>
                <div className='container'>
                    {/* Settings icon */}
                    <Link to={'/settings'}>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-right',
                            )}
                        >
                            &#xe8b8;
                        </i>
                    </Link>
                    {/* Debug icon */}
                    <Link to={'/debug'}>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-right',
                                'log',
                            )}
                        >
                            &#xe868;
                        </i>
                    </Link>
                    {/* about icon */}
                    <Link to='/about'>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-left',
                            )}
                        >
                            &#xe88e;
                        </i>
                    </Link>
                </div>
            </nav>
            <div className={classNames('myApp', 'verticalAlign')}>
                <div className='container'>
                    <div className='homeScreen'>
                        <h1>OBLIVION</h1>
                        <h2>بر پایه وارپ</h2>
                        <form action=''>
                            <div className='connector'>
                                <div
                                    className={classNames(
                                        'switch',
                                        isConnected && !isLoading
                                            ? 'active'
                                            : '',
                                        isLoading ? 'isLoading' : '',
                                    )}
                                    onClick={onChange}
                                >
                                    <div className='circle'>
                                        <div className='spinner' />
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div
                            className={classNames(
                                'status',
                                isConnected ? 'active' : '',
                            )}
                        >
                            {status}
                            <br />
                            <div className={classNames(
                                'ip',
                                (isConnected ? 'connected' : '')
                            )}>
                                <img src={flag} alt='flag' />
                                <span>1.1.1.1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
