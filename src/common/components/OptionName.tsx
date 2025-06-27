import React from 'react';
import { IOption, OptionValue } from "common/types";

type Props<T extends OptionValue> = {
    options: IOption<T>[];
    id: T;
};

export interface IProps {
    options: IOption<number>[];
    id: number;
}

export function OptionName<T extends OptionValue>(props: Props<T>) {
    const { id } = props;
    const option: IOption<T> | undefined = props.options.find(option => option.value === id);
    return (
        <span>
            {option
                ? option!.label
                : "Unknown"
            }
        </span>
    );
}