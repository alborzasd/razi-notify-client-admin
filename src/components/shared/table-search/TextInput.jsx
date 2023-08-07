import styles from "./TextInput.module.scss";

function TextInput({
  placeholder,
  searchValue,
  setSearchValue,
  setDisplaySearchValue,
}) {
  return (
    <input
      className={styles.TextInput}
      value={searchValue}
      onChange={(e) => {
        setSearchValue(e.target.value);
        // for text input, the value that is displayed in table footer 
        // is same as the value that is sent to server
        setDisplaySearchValue(e.target.value);
      }}
      placeholder={placeholder}
    />
  );
}

export default TextInput;
