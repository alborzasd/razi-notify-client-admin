/* eslint-disable no-restricted-globals */

import * as XLSX from "xlsx";

self.onmessage = async (event) => {
  const { action, data: file, meta } = event?.data;

  if (action === "excelToJson" && meta?.type === "username-only") {
    try {
      // file processing
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
        // { header: ["username"], raw: true }
      );

      // // jsonData is array of objects with only one field "username"
      // // grap first value for each object inside top level array
      // const data = jsonData?.map((arrayRow) => arrayRow?.username);

      // jsonData is array of objects
      // thie field name of these objects is taken from the excel first row
      // we only need the field' username'
      const data = jsonData
        ?.map((rowObj) => rowObj?.username)
        // filter out empty username values
        // I think XLSX will filter empty rows also
        .filter((username) => Boolean(username));

      if (data?.length === 0) {
        throw new Error(
          "ستون username تعریف نشده است. یا ردیف های زیر آن خالی از اطلاعات است"
        );
      }

      self.postMessage({ result: "success", data: data });
    } catch (err) {
      self.postMessage({ result: "error", error: err?.message });
    }
  } else if (action === "excelToJson" && meta?.type === "userschema-full") {
    try {
      // file processing
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
        // { header: 1/*, raw: true*/ }
      );

      self.postMessage({ result: "success", data: jsonData });
    } catch (err) {
      self.postMessage({ result: "error", error: err?.message });
    }
  } else if (
    action === "generateTemplateExcel" &&
    meta?.type === "add-many-users"
  ) {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Define column names
      const columnNames = [
        "username",
        "password",
        "first_name",
        "last_name",
        "system_role",
        "student_position",
        "lecturer_position",
        "employee_positio",
        "description",
        "phone_number",
        "email",
      ];

      // Create a worksheet and add the column names
      const worksheet = XLSX.utils.aoa_to_sheet([columnNames]);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

      // Generate the Excel file
      const excelFile = XLSX.write(workbook, {
        type: "binary",
        bookType: "xlsx",
      });

      // Helper function to convert string to ArrayBuffer
      const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      };

      // Create a Blob from the Excel file data
      const blob = new Blob([s2ab(excelFile)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // create object url from blob to use it as download link
      const objectUrl = URL.createObjectURL(blob);

      self.postMessage({ result: "success", data: objectUrl });
    } catch (err) {
      self.postMessage({ result: "error", error: err?.message });
    }
  } else if (
    action === "generateDataExcel" &&
    meta?.type === "from-temp-users-table"
  ) {
  }
  // end of action type handler
  else {
    self.postMessage({ result: "error", error: "invalid event message" });
  }

  // console.log('hello web worker');
};

// console.log('hi');
