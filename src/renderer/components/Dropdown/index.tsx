import { ChangeEvent, FC } from 'react';

interface DropdownProps {
    label?: string;
    id: string;
    items: {
        label: string;
        value: string;
    }[];
    value: string;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    tabIndex?: number;
    isLoading?: boolean;
}
const Dropdown: FC<DropdownProps> = ({
    id,
    items,
    onChange,
    value,
    label,
    disabled,
    tabIndex = 0,
    isLoading = false
}) => {
    return (
        <>
            {label && (
                <label className='key' htmlFor={id}>
                    {label}
                </label>
            )}
            <div className='value'>
                <select
                    tabIndex={tabIndex}
                    id={id}
                    onChange={onChange}
                    disabled={disabled}
                    value={value}
                >
                    {items.map((option) => (
                        <option value={option.value} tabIndex={0} key={option.value + option.label}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {isLoading && <div className='loader' />}
            </div>
        </>
    );
};
export default Dropdown;
