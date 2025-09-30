import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { onEscapeKeyPressed } from '../lib/utils';

export default function useGoBackOnEscape() {
    const navigate = useNavigate();

    useEffect(() => {
        const onEscapeKeyPressedHandler = onEscapeKeyPressed(() => {
            navigate(-1);
        });

        return () => {
            window.removeEventListener('keydown', onEscapeKeyPressedHandler);
        };
    }, []);
}
