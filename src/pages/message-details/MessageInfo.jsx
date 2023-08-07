import styles from "./MessageInfo.module.scss";

import { useState, useEffect, useRef } from "react";

import { $getRoot } from "lexical";

import { useGetMessageQuery } from "../../redux/apiSlice";

import { useParams } from "react-router-dom";

import DataField from "../../components/shared/DataField";
import { dataFieldModes } from "../../components/shared/DataField";

import Button from "../../components/shared/Button";
import CustomLexicalEditor from "../../lexical-editor/CustomLexicalEditor";

import { BiCommentDetail } from "react-icons/bi";
import { TbSpeakerphone } from "react-icons/tb";
import { FiUser } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ImCancelCircle } from "react-icons/im";

import { toPersianDateTimeStr } from "../../utilities/utilities";

function MessageInfo() {
  const { identifier, messageId } = useParams();

  const [isEditEnabled, setIsEditEnabled] = useState(false);

  // const [messageTitleState, setMessageTitleState] = useState();
  // const [messageBodyState, setMessageBodyState] = useState();
  const messageTitleValueRef = useRef(null);
  const messageBodyValueRef = useRef(null);

  const {
    data: message,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetMessageQuery({
    channelIdentifier: identifier,
    messageId,
  });

  useEffect(() => {
    if (isSuccess) {
      // setMessageTitleState(message?.title);
      // setMessageBodyState(message?.body);
      messageTitleValueRef.current = message?.title;
      messageBodyValueRef.current = message?.body;
    }
  }, [isSuccess, message?.body, message?.title]);

  const handleEnableEdit = () => {
    setIsEditEnabled(true);
  };

  const handleDisableEdit = () => {
    setIsEditEnabled(false);
  };

  // render logic
  let mode;
  if (isLoading || isFetching) {
    mode = dataFieldModes.loading;
  } else if (isError) {
    mode = dataFieldModes.error;
  } else if (isSuccess && isEditEnabled) {
    mode = dataFieldModes.edit;
  } else {
    mode = dataFieldModes.display;
  }
  // console.log("mode", mode);

  let buttonsContent;
  if (isSuccess && !isEditEnabled) {
    buttonsContent = (
      <>
        <Button
          onClick={handleEnableEdit}
          className={styles.actionBtn + " " + styles.editBtn}
        >
          <BiEdit />
          ویرایش
        </Button>
        <Button className={styles.actionBtn + " " + styles.deleteBtn}>
          <RiDeleteBin6Line />
          حذف
        </Button>
      </>
    );
  } else if (isSuccess) {
    buttonsContent = (
      <>
        <Button
          onClick={handleDisableEdit}
          className={styles.actionBtn + " " + styles.cancelEditBtn}
        >
          <ImCancelCircle />
          لغو ویرایش
        </Button>
        <Button className={styles.actionBtn + " " + styles.submitEditBtn}>
          <BiEdit />
          اعمال
        </Button>
      </>
    );
  }

  const createdAtPersianDateTime = toPersianDateTimeStr(message?.createdAt);
  const updatedAtPersianDateTime =
    message?.createdAt === message?.updatedAt
      ? "_"
      : toPersianDateTimeStr(message?.updatedAt);

  return (
    <div className={styles.MessageInfo}>
      <DataField
        className={styles.channelTitle}
        iconElement={<TbSpeakerphone className={styles.icon} />}
        title="کانال"
        mode={mode}
        valueDisplay={message?.channel?.title}
      />
      <DataField
        className={styles.senderName}
        iconElement={<FiUser className={styles.icon} />}
        title="ارسال کننده"
        mode={mode}
        valueDisplay={
          message?.sent_by_user?.first_name +
          " " +
          message?.sent_by_user?.last_name
        }
      />
      <DataField
        className={styles.createdAt}
        iconElement={<FiCalendar className={styles.icon} />}
        title="تاریخ ارسال"
        mode={mode}
        valueDisplay={createdAtPersianDateTime}
        valueComponent={DateValueComponent}
        // valueClassname={styles.ltrRightAlign}
      />
      <DataField
        className={styles.updatedAt}
        iconElement={<FiCalendar className={styles.icon} />}
        title="تاریخ آخرین ویرایش"
        mode={mode}
        valueDisplay={updatedAtPersianDateTime}
        valueComponent={DateValueComponent}
        // valueClassname={styles.ltrRightAlign}
      />

      <div className={styles.buttons}>{buttonsContent}</div>

      <DataField
        className={styles.messageTitle}
        iconElement={<BiCommentDetail className={styles.icon} />}
        title="عنوان"
        mode={mode}
        isEditable={true}
        valueDisplay={message?.title}
        valueRef={messageTitleValueRef}
        // valueState={messageTitleState}
        // setValueState={setMessageTitleState}
        // inputComponent={MessageTitleInputComponent}
      />
      <DataField
        className={styles.messageBody}
        iconElement={<BiCommentDetail className={styles.icon} />}
        title="متن"
        mode={mode}
        isEditable={true}
        valueDisplay={message?.body}
        valueRef={messageBodyValueRef}
        // valueState={messageBodyState}
        // setValueState={setMessageBodyState}
        inputComponent={MessageBodyInputComponent}
        valueComponent={MessageBodyValueComponent}
      />
    </div>
  );
}

// DateField accepts component to render value of data
// or input to edit that value
// by default value is dispalyed insied <p> tag
// input is displayed with <input> tag

function DateValueComponent(props) {
  // only modifies default style inside DataField.js that has passed to <p> tag
  return (
    <p className={props.className + " " + styles.ltrRightAlign}>
      {props.children}
    </p>
  );
}

// function MessageTitleInputComponent(props) {
//   return <input {...props} />;
// }

// function MessageBodyInputComponent(props) {
//   return <textarea {...props} />;
// }

function MessageBodyValueComponent(props) {
  // TODO: return non editable lexical editor.
  // pass props.children to defaultValue prop of CustomEditor
  // return <pre {...props}>{props.children}</pre>;

  return (
    <CustomEditorWrapper
      {...props}
      defaultValue={props?.children}
      isEditable={false}
    />
  );
}

function MessageBodyInputComponent(props) {
  return <CustomEditorWrapper {...props} isEditable={true} />;
}

function CustomEditorWrapper({
  className,
  defaultValue,
  // onChange: onChangeProp,
  onChange,
  isEditable,
}) {
  // const onChange = (editorState) => {
  //   // this onChange callback that comes from props
  //   // will set editor state to a ref
  //   // the ref comes from DataField props that calls this component
  //   onChangeProp(editorState);
  //   // console.log('editorState', editorState);
  //   // console.log("root", editorState.toJSON()); // kills performance ?
  // };
  return (
    <CustomLexicalEditor
      namespace="messageDetailsEditor"
      onChange={onChange}
      defaultValue={defaultValue}
      classNames={{
        container: className,
      }}
      defaultValueIsRawText={true}
      placeholderComponent={placeholderComponent}
      isEditable={isEditable}
    />
  );

  function placeholderComponent(props) {
    return (
      <div className={props.className + " " + styles.placeholder}>متن پیام</div>
    );
  }
}

export default MessageInfo;
