import classNames from 'classnames';
import { useState, useEffect, FC } from 'react';

type DownloadProgress = {
    percent: number;
    status: string;
};

interface DownloadProgressBarProps {
    data: DownloadProgress;
}

const DownloadProgressBar: FC<DownloadProgressBarProps> = ({ data }) => {
    const [latestPercent, setLatestPercent] = useState<number>(0);

    useEffect(() => {
        if (data?.percent > 0) {
            setLatestPercent(data.percent);
        }
    }, [data?.percent]);

    if (!data) return null;

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
