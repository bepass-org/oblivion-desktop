import { Link } from 'react-router';
import classNames from 'classnames';

export default function BackButton() {
    return (
        <Link to='/' role='presentation'>
            <i className={classNames('material-icons', 'backBtn')}>&#xe5c4;</i>
        </Link>
    );
}
