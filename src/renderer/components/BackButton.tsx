import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function BackButton() {
    return (
        <Link to='/'>
            <Button>{'->'}</Button>
        </Link>
    );
}
