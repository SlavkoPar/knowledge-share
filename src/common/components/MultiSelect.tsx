import React, { useState } from "react";
import SelectedItem from "./SelectedItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { IOption, OptionValue } from "common/types";

type Props<T extends OptionValue> = {
  label: string;
  options: IOption<T>[];
  value: T[];
  onChange: (e: React.FormEvent<HTMLSelectElement>, value: T) => void;
  id: string,
  name: string,
  disabled?: boolean
};

//export function Select<T extends OptionValue>(props: Props<T>) {

const MultiSelect: React.FunctionComponent<Props<number>> = ({ options, label }) => {
  // This holds the selected values


  const [opts, setOpts] = useState<IOption<number>[]>(
    options.map(f => ({ ...f, checked: false }))
  );

  // ------------------
  const [expanded, setExpanded] = useState(false)

  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(event.target.id);
    const arr = [...opts]
    const option = arr.find(f => f.value === id);
    option!.checked = event.target.checked;
    setOpts(arr);
  }

  const optionsChecked = opts.filter(f => f.checked);

  console.log('RENDERUJEMMMMMMMMMMM', optionsChecked, expanded)

  const removeOption = (id: number) => {
    const arr = [...opts]
    const option = arr.find(f => f.value === id);
    option!.checked = false;
    setOpts(arr);
  }

  const SelItem = React.memo(SelectedItem);
  const removeOpt = React.useCallback((id: number) => removeOption(id), []);

  return (
    <div className="cccontainer">
      <div>
        <form>
          <div className="multiselect">

            <div className="selectBox">

              {optionsChecked.length === 0
                ? <span>{label}</span>
                : <ul>
                  {optionsChecked.map(option =>
                    <SelItem
                      key={option.value}
                      option={option}
                      removeOption={() => {
                        removeOpt(option.value);
                      }}
                    />
                  )}
                </ul>
              }
              <FontAwesomeIcon
                icon={expanded ? faCaretDown : faCaretRight}
                size='lg'
                color='black'
                style={{ marginLeft: 'auto' }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setExpanded(!expanded);
                }} />
            </div>

            {expanded &&
              <div className='options'>
                {opts.map(f =>
                  <label key={f.value.toString()} htmlFor={f.value.toString()}>
                    <input
                      type="checkbox"
                      id={f.value.toString()}
                      onChange={onChangeCheckbox}
                      checked={f.checked}
                    />
                    <span style={{ border: '0px solid red' }}>{f.label}</span>
                  </label>
                )}
              </div>
            }

          </div>
        </form>
      </div>
    </div>
  );
};

export { MultiSelect };