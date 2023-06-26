import styles from './Button.module.scss';

import classNames from 'classnames';

function Button({children, className, ...rest}) {
    return (
        <button 
            className={classNames(styles.Button, className)}
            {...rest}
        >
            {children}
        </button>
    );
}

function ButtonGroup({children, className}) {
    return (
        <div className={classNames(styles.ButtonGroup, className)}>
            {children}
        </div>
    );
}

export default Button;
export {ButtonGroup};