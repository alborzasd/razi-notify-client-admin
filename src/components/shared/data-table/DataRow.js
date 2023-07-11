import styles from './DataRow.module.scss';

import ClassNames from 'classnames';

function DataRow({entity, config}) {

    // const renderedComponents = colComponents.map((Component, index) => {
    //     return <Component key={index} data={data} />;
    // });

    const renderedColumnComponents = config.columns.map((col, index) => {
        const ColumnComponent = col.rowComponent;
        return <ColumnComponent key={index} data={entity} />;
    })

    const tableRowClassname = ClassNames(styles.DataRow, config.tableRowClassname);

    return (
        <div className={tableRowClassname}>
            {renderedColumnComponents}
        </div>
    );
}

export default DataRow;