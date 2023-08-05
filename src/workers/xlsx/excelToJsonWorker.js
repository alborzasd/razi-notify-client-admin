/* eslint-disable no-restricted-globals */

import * as XLSX from "xlsx";

self.onmessage = async (event) => {
  const { action, data: eventData, meta } = event?.data;

  if (action === "excelToJson" && meta?.type === "username-only") {
    try {
      // file processing
      const file = eventData;
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
      const { file, departmentId } = eventData;
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
        // { header: 1/*, raw: true*/ }
      );

      // map and validation
      const usersJson = jsonData.map((rowObj, index) => {
        const rowResult = {};

        // username
        if (!rowObj?.username) {
          throw new Error(
            "نام کاربری" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              ".خالی است" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }
        rowResult.username = rowObj?.username?.toString();

        // password
        if (!rowObj?.password) {
          throw new Error(
            "رمز عبور" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              ".خالی است" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }
        rowResult.password = rowObj?.password?.toString();

        // first_name
        if (!rowObj?.first_name) {
          throw new Error(
            "نام" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              ".خالی است" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }
        rowResult.first_name = rowObj?.first_name?.toString();

        // last_name
        if (!rowObj?.last_name) {
          throw new Error(
            "نام خانوادگی" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              ".خالی است" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }
        rowResult.last_name = rowObj?.last_name?.toString();

        // system_role
        if (parseInt(rowObj?.system_role) === 2) {
          rowResult.system_role = "channel_admin";
        } else {
          rowResult.system_role = "user"; // default system_role
        }

        if (
          // if all positions are empty
          !rowObj?.student_position &&
          !rowObj?.lecturer_position &&
          !rowObj?.employee_position
        ) {
          throw new Error(
            "موقعیت دانشجو، مدرس و کارمند" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "خالی هستند. حداقل یکی از آنها باید مقدار دهی شود" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // student_position
        if (parseInt(rowObj?.student_position) === 1) {
          rowResult.student_position = "bachelor";
        } else if (parseInt(rowObj?.student_position) === 2) {
          rowResult.student_position = "master";
        } else if (parseInt(rowObj?.student_position) === 3) {
          rowResult.student_position = "doctoral";
        } else if (Boolean(rowObj?.student_position)) {
          // at this point, student_position is not empty and has invalid value
          // if this condition is skipped it means student_position is empty
          // but one of those other positions are not empty which is a valid case
          throw new Error(
            "موقعیت دانشجو" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "مقدار غیر معتبر دارد." +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // lecturer_position
        if (parseInt(rowObj?.lecturer_position) === 1) {
          rowResult.lecturer_position = "sessional instructor";
        } else if (parseInt(rowObj?.lecturer_position) === 2) {
          rowResult.lecturer_position = "instructor";
        } else if (parseInt(rowObj?.lecturer_position) === 3) {
          rowResult.lecturer_position = "assistant professor";
        } else if (parseInt(rowObj?.lecturer_position) === 4) {
          rowResult.lecturer_position = "associate professor";
        } else if (parseInt(rowObj?.lecturer_position) === 5) {
          rowResult.lecturer_position = "professor";
        } else if (Boolean(rowObj?.lecturer_position)) {
          // at this point student_position has a valid value or is empty
          // but lecturer_position is not empty and has an invalid value
          // if this condition is skipped it means lecturer is empty
          throw new Error(
            "موقعیت مدرس" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "مقدار غیر معتبر دارد." +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // employee_position
        rowResult.employee_position = rowObj?.employee_position?.toString();

        // other
        rowResult.description = rowObj?.description?.toString();
        rowResult.phone_number = rowObj?.phone_number?.toString();
        rowResult.email = rowObj?.email?.toString();

        return rowResult;
      });

      // attach departmentId to users
      usersJson.forEach((user) => {
        user.department_id = departmentId;
      });

      self.postMessage({ result: "success", data: usersJson });
    } catch (err) {
      self.postMessage({ result: "error", error: err?.message });
    }
  } else if (action === "excelToJson" && meta?.type === "userschema-partial") {
    // TODO: implement
    try {
      // file processing
      const { file, departmentId } = eventData;
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
        // { header: 1/*, raw: true*/ }
      );

      // map and validation
      const partialUsersJson = jsonData.map((rowObj, index) => {
        const rowResult = {};

        // username
        if (!rowObj?.username) {
          throw new Error(
            "نام کاربری" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              ".خالی است" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }
        rowResult.username = rowObj?.username?.toString();

        // new_username
        if (rowObj?.new_username) {
          rowResult.new_username = rowObj?.new_username?.toString();
        }

        // password
        if (rowObj?.password) {
          rowResult.password = rowObj?.password?.toString();
        }

        // first_name
        if (rowObj?.first_name) {
          rowResult.first_name = rowObj?.first_name?.toString();
        }

        // last_name
        if (rowObj?.last_name) {
          rowResult.last_name = rowObj?.last_name?.toString();
        }

        // system_role
        if (parseInt(rowObj?.system_role) === 1) {
          rowResult.system_role = "user";
        } else if (parseInt(rowObj?.system_role) === 2) {
          rowResult.system_role = "channel_admin";
        }
        // else do not attach system_role to rowResult

        if (
          parseInt(rowObj?.student_position) === 0 &&
          parseInt(rowObj?.lecturer_position) === 0 &&
          parseInt(rowObj?.employee_position) === 0
        ) {
          throw new Error(
            "برای هر سه موقعیت دانشجو، مدرس و کارمند" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "عدد 0 صفر وارد شده که به معنای خالی کردن مقدار قبلی است." +
              "اما حداقل یکی از آنها باید مقدار دهی شود یا خالی گذاشته شود" +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // student_position
        if (parseInt(rowObj?.student_position) === 0) {
          rowResult.student_position = 0; // server will clear previous value
        }
        if (parseInt(rowObj?.student_position) === 1) {
          rowResult.student_position = "bachelor";
        } else if (parseInt(rowObj?.student_position) === 2) {
          rowResult.student_position = "master";
        } else if (parseInt(rowObj?.student_position) === 3) {
          rowResult.student_position = "doctoral";
        } else if (Boolean(rowObj?.student_position)) {
          // at this point, student_position is not empty and has invalid value
          // if this condition is skipped it means student_position is empty
          throw new Error(
            "موقعیت دانشجو" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "مقدار غیر معتبر دارد." +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // lecturer_position
        if (parseInt(rowObj?.lecturer_position) === 0) {
          rowResult.lecturer_position = 0; // server will clear previous value
        }
        if (parseInt(rowObj?.lecturer_position) === 1) {
          rowResult.lecturer_position = "sessional instructor";
        } else if (parseInt(rowObj?.lecturer_position) === 2) {
          rowResult.lecturer_position = "instructor";
        } else if (parseInt(rowObj?.lecturer_position) === 3) {
          rowResult.lecturer_position = "assistant professor";
        } else if (parseInt(rowObj?.lecturer_position) === 4) {
          rowResult.lecturer_position = "associate professor";
        } else if (parseInt(rowObj?.lecturer_position) === 5) {
          rowResult.lecturer_position = "professor";
        } else if (Boolean(rowObj?.lecturer_position)) {
          // at this point student_position has a valid value or is empty
          // but lecturer_position is not empty and has an invalid value
          // if this condition is skipped it means lecturer is empty
          throw new Error(
            "موقعیت مدرس" +
              " " +
              "در ردیف" +
              " " +
              (index + 1) +
              " " +
              "مقدار غیر معتبر دارد." +
              " " +
              "row:" +
              " " +
              JSON.stringify(rowObj)
          );
        }

        // employee_position
        if (parseInt(rowObj?.employee_position) === 0) {
          rowResult.employee_position = 0;
        } else if (rowObj?.employee_position) {
          rowResult.employee_position = rowObj?.employee_position?.toString();
        }

        // description
        if (parseInt(rowObj?.description) === 0) {
          rowResult.description = 0;
        } else if (rowObj?.description) {
          rowResult.description = rowObj?.description?.toString();
        }

        // phone_number
        if (parseInt(rowObj?.phone_number) === 0) {
          rowResult.phone_number = 0;
        } else if (rowObj?.phone_number) {
          rowResult.phone_number = rowObj?.phone_number?.toString();
        }

        // email
        if (parseInt(rowObj?.email) === 0) {
          rowResult.email = 0;
        } else if (rowObj?.email) {
          rowResult.email = rowObj?.email?.toString();
        }

        return rowResult;
      });

      // attach departmentId to users
      partialUsersJson.forEach((user) => {
        user.department_id = departmentId;
      });

      self.postMessage({ result: "success", data: partialUsersJson });
    } catch (err) {
      self.postMessage({ result: "error", error: err?.message });
    }
  } else if (
    action === "generateTemplateExcel" &&
    (meta?.type === "add-many-users" || meta?.type === "edit-many-users")
  ) {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Define column names
      let columnNames = [
        "username",
        "password",
        "first_name",
        "last_name",
        "system_role",
        "student_position",
        "lecturer_position",
        "employee_position",
        "description",
        "phone_number",
        "email",
      ];

      if (meta?.type === "edit-many-users") {
        // add 'new_username' to col index 1
        columnNames = [
          ...columnNames.slice(0, 1),
          "new_username",
          ...columnNames.slice(1),
        ];
      }

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
    const jsonData = eventData;

    const jsonDataToExport = jsonData.map((rowObj) => ({
      username: rowObj?.username,
      first_name: rowObj?.first_name,
      last_name: rowObj?.last_name,
      system_role: rowObj?.system_role_persian,
      student_position: rowObj?.student_position_persian,
      lecturer_position: rowObj?.lecturer_position_persian,
      employee_position: rowObj?.employee_position,
      department: rowObj?.department?.title,
      description: rowObj?.description,
      phone_number: rowObj?.phone_number,
      email: rowObj?.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(jsonDataToExport);

    const workbook = XLSX.utils.book_new();

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
  }
  // end of action type handler
  else {
    self.postMessage({ result: "error", error: "invalid event message" });
  }

  // console.log('hello web worker');
};

// console.log('hi');
