import styles from './TextOverflow.module.scss';

import {useRef, useEffect, useState} from 'react';

import ClassNames from 'classnames';

function TextOverflow({className, children}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if(element && element.scrollWidth > element.clientWidth) {
      setTooltip(children);
    }
  }, [children]);

  const [tooltip, setTooltip] = useState('');

  const textOvfeerflowClassname = ClassNames(styles.TextOverflow, className);

  return (
    <p title={tooltip} ref={ref} className={textOvfeerflowClassname}>
      {children}
    </p>
  );
}

export default TextOverflow;