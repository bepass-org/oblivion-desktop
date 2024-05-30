import { Link } from 'react-router-dom';
import classNames from 'classnames';

export default function BackButton() {
    return (
        <Link to='/'>
            <i className={classNames('material-icons', 'backBtn')}>&#xe5c4;</i>
        </Link>
    );
}
