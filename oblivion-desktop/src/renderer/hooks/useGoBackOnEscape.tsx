import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onEscapeKeyPressed } from '../lib/utils';

export default function useGoBackOnEscape() {
    const navigate = useNavigate();

    useEffect(() => {
        onEscapeKeyPressed(() => {
            navigate(-1);
        });
    });
}
