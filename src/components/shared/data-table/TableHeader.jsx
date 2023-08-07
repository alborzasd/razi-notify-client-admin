import styles from './TableHeader.module.scss';

import RtlScrollbars from '../RtlScrollbars';

import ClassNames from 'classnames';

function TableHeader({config}) {
    // const renderedColNames = colNames?.map((colName, index) => {
    //     return <h2 key={index} className={styles.colName}>{colName}</h2>
    // });

    const {tableInstanceNameText} = config;

    const renderedColumnComponents = config.columns.map((col, index) => {
        const ColumnComponent = col.headerComponent;
        const props = col.headerComponentProps;
        return <ColumnComponent 
            className={styles.colName} 
            key={index} 
            {...props} />;
    })

    const tableHeaderClassname = ClassNames(styles.TableHeader, config.tableHeaderClassname);
    return (
        // <RtlScrollbars>
        <div className={tableHeaderClassname}>
            {/* <h2 className={styles.tableInstanceNameText}>{tableInstanceNameText}</h2> */}
            {renderedColumnComponents}
        </div>
        // </RtlScrollbars>
    );
}

export default TableHeader;