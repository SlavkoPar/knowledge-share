import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'
import { IOption } from "common/types";

const SelectedItem: React.FunctionComponent<{option: IOption<number>, removeOption: () => void}> = ({option, removeOption}) => {
  // This holds the selected values
  //const [colors, setColors] = useState<String[]>();
  const { label, value, color } = option;
  console.log('rendam item', option)
  return (
    <li id={value.toString()} className="multi-option" style={{backgroundColor:color}}>
      <span style={{border: '0px solid navy', marginRight: '5px'}}>{label}</span>
      {/* <button style={{borderWidth:0, backgroundColor:'transparent'}}> */}
          <FontAwesomeIcon icon={faWindowClose} color='white' onClick={(event) => {
             event.stopPropagation();
             event.preventDefault();
             removeOption();
          }} />
      {/* </button> */}
    </li>
  );
};

export default SelectedItem;