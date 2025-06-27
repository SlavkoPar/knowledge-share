import * as React from "react";
import { useGlobalContext } from 'global/GlobalProvider'

interface IHealth {
}

const Health: React.FC<IHealth> = (props: IHealth) => {
  const { health: test } = useGlobalContext();
  React.useEffect(()=> {
    test()
  }, [test])
  
  return (
    <div>
      Everything is OK!
    </div>
  )
}

export default Health;
