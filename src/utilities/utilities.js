const PersianDate = require("persian-date");

export function paginate(array, pageSize, pageNum) {
  return array.slice((pageNum - 1) * pageSize, pageNum * pageSize);
}


// persian date utilities

export function toPersianDateStr(dateStr) {
  const persianDate = dateStr
    ? new PersianDate(new Date(dateStr)).format("YYYY/MM/DD")
    : "_";

  return persianDate;
}

export function persianDateNow() {
  return new PersianDate().format("YYYY/MM/DD");
}
