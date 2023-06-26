import styles from './TableHeader.module.scss';

function TableHeader({className, colNames, entityName}) {
    const renderedColNames = colNames?.map((colName, index) => {
        return <h2 key={index} className={styles.colName}>{colName}</h2>
    });

    return (
        <div className={styles.TableHeader}>
            <h2 className={styles.entityName}>{entityName}</h2>
            {renderedColNames}
        </div>
    );
}

export default TableHeader;