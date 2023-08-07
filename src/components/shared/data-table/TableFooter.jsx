import styles from "./TableFooter.module.scss";

import TextOverflow from "../TextOverflow";
import Button from "../Button";
import { HiOutlineSearch } from "react-icons/hi";
import { BiFilterAlt } from "react-icons/bi";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  setFilterConfig,
  setPageNum as setPageNumAction,
} from "../../../redux/filterConfigSlice";

function TableFooter({ config }) {
  const dispatch = useDispatch();
  const filterConfig = useSelector(config.selectors.selectFilterConfig);

  const { paginationResult, isSuccess } = config.queryHook(filterConfig, {
    selectFromResult: (result) => ({
      paginationResult: result?.data?.meta,
      isSuccess: result.isSuccess,
    }),
    // skip if filterConfig has some specific situations
    // for example channel_id for message is not initialized
    skip: config.skipQueryCallback(filterConfig),
  });

  const [pageNumState, setPageNumState] = useState(paginationResult?.pageNum);
  const [pageSizeState, setPageSizeState] = useState(
    paginationResult?.pageSize
  );

  useEffect(() => {
    setPageNumState(paginationResult?.pageNum || "");
    setPageSizeState(paginationResult?.pageSize || "");
  }, [paginationResult]);

  let buttonDisabled =
    // form values are same as result
    (paginationResult?.pageNum === parseInt(pageNumState) &&
      paginationResult?.pageSize === parseInt(pageSizeState)) ||
    // one of them is empty
    !pageNumState ||
    !pageSizeState ||
    // out of range
    parseInt(pageNumState) === 0 ||
    parseInt(pageSizeState) === 0 ||
    pageNumState > paginationResult?.totalPageCount;

  const canSubmit = !buttonDisabled;

  const handlePageNumSubmit = (e) => {
    if (e) e.preventDefault();
    if (canSubmit) {
      dispatch(
        setPageNumAction({
          instanceName: config.tableInstanceName,
          pageNum: pageNumState,
        })
      );
    }
  };

  const handlePageSizeSubmit = (e) => {
    if (e) e.preventDefault();
    if (canSubmit) {
      // pageNum will be reset to 1
      dispatch(
        setFilterConfig({
          instanceName: config.tableInstanceName,
          config: { pageSize: pageSizeState },
        })
      );
    }
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    if (pageSizeState === paginationResult?.pageSize) {
      handlePageNumSubmit();
    } else {
      // pageNum will be reset to 1
      handlePageSizeSubmit();
    }
  };

  // render logic

  let filterResultElement = (
    <div className={styles.filterResult}>
      {filterConfig?.displaySearchValue ? (
        <div className={styles.text}>
          <BiFilterAlt className={styles.icon} />
          <span>فیلتر :</span> &nbsp;
          <span className={styles.displaySearchField}>
            {filterConfig.displaySearchField}
          </span>
          &nbsp; <span>=</span> &nbsp;
          <TextOverflow className={styles.displaySearchValue}>
            {filterConfig.displaySearchValue}
          </TextOverflow>
        </div>
      ) : (
        <p className={styles.text}>
          <BiFilterAlt className={styles.icon} />
          <span>نتایج بدون فیلتر</span>
        </p>
      )}
    </div>
  );

  let content;

  if (isSuccess && paginationResult?.totalCount > 0) {
    content = (
      <>
        <form className={styles.form + ' ' + styles.pageNum} onSubmit={handlePageNumSubmit}>
          <label className={styles.text} htmlFor="pageNum">
            صفحه
          </label>
          <input
            className={styles.input}
            id="pageNum"
            type="number"
            min={1}
            value={pageNumState}
            onChange={(e) => setPageNumState(e.target.value)}
            // disabled
          />
          <span className={styles.text}>از</span>
          <span className={styles.number}>
            {paginationResult?.totalPageCount}
          </span>
        </form>

        <div className={styles.verticalRule + ' ' + styles.vr1}></div>

        <form className={styles.form  + ' ' + styles.pageSize} onSubmit={handlePageSizeSubmit}>
          <label className={styles.text} htmlFor="pageSize">
            تعداد نتایج در هر صفحه
          </label>
          <input
            className={styles.input}
            id="pageSize"
            type="number"
            min={1}
            value={pageSizeState}
            onChange={(e) => setPageSizeState(e.target.value)}
            // disabled
          />
        </form>

        <div className={styles.verticalRule + ' ' + styles.vr2}></div>

        <Button
          onClick={handleSubmit}
          className={styles.submitBtn}
          disabled={buttonDisabled}
        >
          <HiOutlineSearch />
          اعمال
        </Button>

        <div className={styles.verticalRule + ' ' + styles.vr3}></div>

        <div className={styles.paginationResult}>
          <p className={styles.text}>
            نمایش نتایج
            <span className={styles.number}>
              {paginationResult?.rowNumberRange?.[0]}
            </span>
            تا
            <span className={styles.number}>
              {paginationResult?.rowNumberRange?.[1]}
            </span>
            از
            <span className={styles.number}>{paginationResult?.totalCount}</span>
          </p>
        </div>

        {filterResultElement}
      </>
    );
  } else if (isSuccess && paginationResult?.totalCount === 0) {
    // if there is no result
    // just only show what filter is used
    content = filterResultElement;
  }

  return <div className={styles.TableFooter}>{content}</div>;
}

export default TableFooter;
