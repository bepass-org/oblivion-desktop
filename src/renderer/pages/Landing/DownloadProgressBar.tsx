import classNames from 'classnames';
import { useState, useEffect } from 'react';

const DownloadProgressBar = ({ data }: any) => {
    const [latestPercent, setLatestPercent] = useState<number>(0);

    if (!data) return null;

    useEffect(() => {
        if (data?.percent > 0) {
            setLatestPercent(data.percent);
        }
    }, [data?.percent]);

    return (
        <div
            className={classNames(
                'progressBar',
                data.status === 'pending' ? 'green' : 'red',
                data.status === 'pending' && latestPercent < 1 ? 'hidden' : ''
            )}
        >
            <div
                style={{
                    width: `${latestPercent}%`
                }}
            />
        </div>
    );
};

export default DownloadProgressBar;
