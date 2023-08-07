import styles from "./DataField.module.scss";

import classNames from "classnames";

export const dataFieldModes = {
  loading: "loading", // show skeleton box with animation
  error: "error", // show empty box
  display: "display",
  edit: "edit",
  // add: "add",
};

function DataField({
  className,
  iconElement,
  title, // field name
  valueDisplay, // value to display as noneditable and also initial value for editable form
  valueRef,
  // valueState, // when data is fetched, state and display value are same
  // setValueState,
  mode, // display or edit (or create?)
  // if false, then passing "edit" to mode prop has no effect
  // renders same as "display" mode
  isEditable,
  inputComponent: InputComponent,
  valueComponent: ValueComponent,
  // valueClassname,
}) {
  const loadingOverlayClassname = classNames(styles.loadingOverlay, {
    [styles.active]: mode === dataFieldModes.loading,
  });

  let content;
  // if => mode is set to 'dispaly'
  // or => data field is not editable and mode is set to 'display' or 'edit'
  // then => render value component
  if (
    (!isEditable &&
      (mode === dataFieldModes.display || mode === dataFieldModes.edit)) ||
    (isEditable && mode === dataFieldModes.display)
  ) {
    if (ValueComponent) {
      content = (
        <ValueComponent className={styles.marginRight}>{valueDisplay}</ValueComponent>
      );
    } else {
      content = <p className={styles.value}>{valueDisplay}</p>;
    }
  }
  // if => data field is editable and mode is set to 'edit'
  // then => render input component
  else if (isEditable && mode === dataFieldModes.edit) {
    if (InputComponent) {
      content = (
        <InputComponent
          className={styles.marginRight}
          defaultValue={valueDisplay}
          onChange={(newValue) => valueRef.current = newValue}
        />
      );
    } else {
      content = (
        <input
          className={styles.value + " " + styles.input}
          defaultValue={valueDisplay}
          onChange={(e) => valueRef.current = e.target.value}
        />
      );
    }
  }
  // if => mode is none of 'display' or 'edit'
  // then => (render empty p tag that has min height
  // this min-height helps to maintain consistent layout
  // between loading and success data fetch state)
  else {
    content = <p className={styles.value}></p>;
  }

  return (
    <div className={styles.DataField + " " + className}>
      <div className={loadingOverlayClassname}></div>

      <div className={styles.label}>
        {iconElement}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {content}
    </div>
  );
}

export default DataField;
