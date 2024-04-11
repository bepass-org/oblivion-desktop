import { useState } from 'react';
import classNames from 'classnames';

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

    <div className="verticalAlign">
        <nav>
            <div className="container">
                <i className={classNames(
                    'material-icons',
                    'pull-right',
                )}>&#xe8b8;</i>
                <i className={classNames(
                    'material-icons',
                    'pull-right',
                    'log',
                )}>&#xe868;</i>
                <i className={classNames(
                    'material-icons',
                    'pull-left',
                )}>&#xe88e;</i>
            </div>
        </nav>
      <div className="container">
        <div className="homeScreen">
          <h1>OBLIVION</h1>
          <h2>بر پایه وارپ</h2>
          <form action="">
            <div className="connector">
              <div
                className={classNames(
                  'switch',
                  isConnected && !isLoading ? 'active' : '',
                  isLoading ? 'isLoading' : '',
                )}
                onClick={onChange}
              >
                <div className="circle">
                  <div className="spinner" />
                </div>
              </div>
            </div>
          </form>
          <div className={classNames('status', isConnected ? 'active' : '')}>
            {/*<i
              className={classNames(
                'material-icons',
                isConnected ? '' : 'hidden',
              )}
            >
              &#xe876;
            </i>*/}
            {status}
              <br />
              <div className={classNames("ip", isConnected ? '' : 'hidden')}>
                  <img src="/img/flags/us.svg" alt="flag" />
                  127.0.0.1
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
