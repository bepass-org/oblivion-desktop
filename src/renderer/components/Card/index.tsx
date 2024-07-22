import { FC, memo } from 'react';
import PropTypes from "prop-types";

interface ResultCardProps {
    label: string;
    value: string;
    unit: string;
}

const ResultCard: FC<ResultCardProps> = memo(({ label, value, unit }) => (
    <div className='result-card'>
        <p>{label}</p>
        <h2>
            {value} {unit}
        </h2>
    </div>
));

ResultCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired
};

export default ResultCard;