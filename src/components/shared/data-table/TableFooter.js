import styles from './TableFooter.module.scss';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { pageNumUpdated, pageSizeUpdated } from '../../../redux/channelsSlice';

function TableFooter({config}) {

    const dispatch = useDispatch();

    const paginationInfo = useSelector(config.selectors.selectCurrentPaginationInfo);
    const loadingStatus = useSelector(config.selectors.selectLoadingStatus);

    const [pageNum, setPageNum] = useState(paginationInfo.currentPage);
    const handlePageNumSubmit = (e) => {
        e.preventDefault();
        dispatch(pageNumUpdated({
            pageNum,
            maxValidPage: paginationInfo.pageCount
        }));
    }
    useEffect(() => {
        setPageNum(paginationInfo.currentPage);
    }, [paginationInfo.currentPage]);

    const [pageSize, setPageSize] = useState(paginationInfo.resultsPerPage);
    const handlePageSizeSubmit = (e) => {
        e.preventDefault();
        dispatch(pageSizeUpdated(pageSize));
    }

    let content;
    if(loadingStatus === config.loadingStatusEnum.SUCCESS){
        content = (
            <>
            <form className={styles.form} onSubmit={handlePageNumSubmit}>
                <label className={styles.text} htmlFor='pageNum'>صفحه</label>
                <input 
                    className={styles.input}
                    id='pageNum'
                    type='number'
                    min={1}
                    value={pageNum}
                    onChange={(e) => setPageNum(e.target.value)}
                    // disabled
                />
                <span className={styles.text}>از</span>
                <span className={styles.number}>{paginationInfo.pageCount}</span>
            </form>

            <div className={styles.verticalRule}></div>

            <form className={styles.form} onSubmit={handlePageSizeSubmit}>
                <label className={styles.text} htmlFor='pageSize'>تعداد نتایج در هر صفحه</label>
                <input 
                    className={styles.input}
                    id='pageSize'
                    type='number'
                    min={1}
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    // disabled
                />
            </form>

            <div className={styles.verticalRule}></div>
            
            <div>
                <p className={styles.text}>
                    نمایش نتایج
                    <span className={styles.number}>{paginationInfo.resultRange.start}</span>
                    تا
                    <span className={styles.number}>{paginationInfo.resultRange.end}</span>
                    از
                    <span className={styles.number}>{paginationInfo.resultCount}</span>
                </p>
            </div>
            </>
        );
    }

    return (
        <div className={styles.TableFooter}>
            {content}
        </div>
    );
}

export default TableFooter;