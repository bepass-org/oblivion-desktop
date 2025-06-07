import { FC, memo } from 'react';

interface ResultCardProps {
    label: string;
    value: string;
    unit: string;
}

const ResultCard: FC<ResultCardProps> = memo(({ label, value, unit }: ResultCardProps) => (
    <div className='resultCard'>
        <p>{label}</p>
        <h2>
            {value} <small>{unit}</small>
        </h2>
    </div>
));

export default ResultCard;
