// const PersianDate = require("persian-date");
import PersianDate from "persian-date";

export function paginate(array, pageSize, pageNum) {
  return array.slice((pageNum - 1) * pageSize, pageNum * pageSize);
}

// color utilities

// a utility function that is used to
// assign it's return value to a dom element style
export function rgbaObjectToString(rgba = {r: 0, g: 0, b: 0, a: 0}) {
  const {r, g, b, a} = rgba;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// persian date utilities

export function toPersianDateStr(dateStr) {
  const persianDate = dateStr
    ? new PersianDate(new Date(dateStr)).format("YYYY/MM/DD")
    : "_";

  return persianDate;
}

export function toPersianDateTimeStr(dateStr) {
  const persianDate = dateStr
    ? new PersianDate(new Date(dateStr)).format("YYYY/MM/DD HH:mm")
    : "_";

  return persianDate;
}

export function persianDateNow() {
  return new PersianDate().format("YYYY/MM/DD");
}
