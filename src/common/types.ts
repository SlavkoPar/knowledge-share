import { IWhoWhen } from 'global/types'

export type OptionValue = string | number;

export type IOption<T extends OptionValue> = {
    value: T;
    label: string;
    color?: string;
    checked?: boolean;
};

export type ICreatedModifiedProps = {
    created?: IWhoWhen,
    createdBy?: string,
    modified?: IWhoWhen,
    modifiedBy?: string
    classes?: string
}
