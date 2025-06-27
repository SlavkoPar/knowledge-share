import React from 'react';
import Form from 'react-bootstrap/Form';
import { IOption, OptionValue } from "common/types";

type Props<T extends OptionValue> = {
    options: IOption<T>[];
    value: T;
    onChange: (e: React.FormEvent<HTMLSelectElement>, value: T) => void;
    id: string,
    name: string,
    disabled?: boolean,
    classes: string
};

export function Select<T extends OptionValue>(props: Props<T>) {
    const disabled = props.disabled ? true : false;
    function handleOnChange(e: React.FormEvent<HTMLSelectElement>) {
        const { selectedIndex } = e.currentTarget;
        const selectedOption: IOption<T> = props.options[selectedIndex];
        props.onChange(e, selectedOption.value);
    }

    return (
        <Form.Select
            id={props.id}
            value={props.value}
            onChange={handleOnChange}
            disabled={disabled}
            size="sm"
            className={props.classes}
        >
            {props.options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Form.Select>
    );
}