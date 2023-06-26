import styles from './DataTable.module.scss';

import { useSelector } from 'react-redux';

import RtlScrollbars from '../RtlScrollbars';
import { CircleSpinner } from 'react-spinners-kit';

import DataRow from './DataRow';
import TableHeader from './TableHeader';
import TableFooter from './TableFooter';

function DataTable({config}) {
    const {entityName} = config;
    const colNames = Object.keys(config.columns);
    const colComponents = Object.values(config.columns).map(col => col.component);

    // const entities = useSelector(config.selectors.selectAll);
    // const filterCallback = useSelector(config.selectors.selectFilterCallback);
    // const paginationCongif = useSelector(config.selectors.selectPaginationConfig);

    // const filteredEntities = filterCallback ? entities.filter(filterCallback) : entities;
    // const paginatedEntities = paginate(filteredEntities, paginationCongif.pageSize, paginationCongif.pageNum);
    // const dataList = paginatedEntities;

    const dataList = useSelector(config.selectors.selectPaginatedData);

    const loadingStatus = useSelector(config.selectors.selectLoadingStatus);
    const error = useSelector(config.selectors.selectError);

    
    const renderedRows = dataList.map((data) => {
        return <DataRow
            key={data._id}
            colNames={colNames} 
            colComponents={colComponents} 
            data={data}
        />;
    });

    let content;
    if(loadingStatus === config.loadingStatusEnum.LOADING){
        content = <StatusContainer> <CircleSpinner color={styles.primaryColor}/> </StatusContainer>;
    } else if(loadingStatus === config.loadingStatusEnum.FAILED) {
        content = <StatusContainer> <p className={styles.errorMessage}>{error?.message}</p> </StatusContainer>;
    } else if(dataList?.length === 0) {
        content = <StatusContainer> <p>موردی یافت نشد.</p> </StatusContainer>;
    } else {
        content = (
            <RtlScrollbars>
                <div className={styles.rowList}>{renderedRows}</div>
            </RtlScrollbars>
        );
    }

    return (
        <div className={styles.DataTable}>
            <TableHeader colNames={colNames} entityName={entityName} />
            {content}
            <TableFooter config={config} />
        </div>
    );
}

function StatusContainer({children}){
    return (
        <div className={styles.StatusContainer}>
            {children}
        </div>
    );
}

export default DataTable;