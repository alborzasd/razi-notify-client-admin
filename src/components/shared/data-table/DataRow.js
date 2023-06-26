import styles from './DataRow.module.scss';

function DataRow({colNames, colComponents, data}) {

    const renderedComponents = colComponents.map((Component, index) => {
        return <Component key={index} data={data} />;
    });

    return (
        <div className={styles.DataRow}>
            {renderedComponents}
        </div>
    );
}

export default DataRow;