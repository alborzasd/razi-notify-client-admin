import styles from "./DataTable.module.scss";

import { useSelector } from "react-redux";

import RtlScrollbars from "../RtlScrollbars";
import { CircleSpinner } from "react-spinners-kit";

import DataRow from "./DataRow";
import TableHeader from "./TableHeader";
import TableFooter from "./TableFooter";

function DataTable({ config }) {
  // if this filterConfig is changed by any actions dispatched from other components
  // (like TableSearch, TableFooter) this component will rerener
  // and the query hook will send a new request to fetch data with new filters
  const filterConfig = useSelector(config.selectors.selectFilterConfig);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    config.queryHook(filterConfig, {
      // skip if filterConfig has some specific situations
      // for example channel_id for message is not initialized
      skip: config.skipQueryCallback(filterConfig),
    });

  const entities = data?.entities ?? [];
  // console.log('entities', entities);
  const renderedEntityRows = entities.map((entity) => {
    return (
      <DataRow
        key={entity._id}
        // colNames={colNames}
        // colComponents={colComponents}
        entity={entity}
        config={config}
      />
    );
  });

  let content;
  if (isLoading || isFetching) {
    content = (
      <StatusContainer>
        <CircleSpinner color={styles.primaryColor} />
      </StatusContainer>
    );
  } else if (isError) {
    const uiErrorMessage = error?.message;
    const serverErrorMessage = error?.responseData?.message;
    const serverErrorMessagePersian = error?.responseData?.messagePersian;
    content = (
      <StatusContainer>
        {uiErrorMessage && (
          <p className={styles.errorMessage}>{uiErrorMessage}</p>
        )}
        {serverErrorMessagePersian && (
          <p className={styles.errorMessage}>{serverErrorMessagePersian}</p>
        )}
        {serverErrorMessage && (
          <p className={styles.errorMessage}>{serverErrorMessage}</p>
        )}
      </StatusContainer>
    );
  } else if (isSuccess && entities?.length === 0) {
    content = (
      <StatusContainer>
        <p>موردی یافت نشد.</p>
      </StatusContainer>
    );
  } else {
    content = (
      <RtlScrollbars>
        <div className={styles.rowList}>{renderedEntityRows}</div>
      </RtlScrollbars>
    );
  }

  return (
    <div className={styles.DataTable + " " + config.dataTableClassname}>
      <div className={styles.temp1}>
        <RtlScrollbars>
          <div className={styles.temp2}>
            <TableHeader config={config} />
            {content}
          </div>
        </RtlScrollbars>
      </div>
      <TableFooter config={config} />
    </div>
  );
}

function StatusContainer({ children }) {
  return <div className={styles.StatusContainer}>{children}</div>;
}

export default DataTable;
