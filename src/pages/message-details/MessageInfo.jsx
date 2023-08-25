import styles from "./MessageInfo.module.scss";

import { useState, useEffect, useRef, useCallback } from "react";

import { useSelector } from "react-redux";

import {
  useGetMessageQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from "../../redux/apiSlice";

import { canUserModifyChannel } from "../../redux/authSlice";

import { useParams, useNavigate } from "react-router-dom";

import DataField from "../../components/shared/DataField";
import { dataFieldModes } from "../../components/shared/DataField";

import Button from "../../components/shared/Button";
import CustomLexicalEditor from "../../lexical-editor/CustomLexicalEditor";
import Checkbox from "../../components/shared/Checkbox";
import {
  WarningModal,
  MessageDeleteWarning,
} from "../../components/shared/Modal";

import { toast } from "react-toastify";
import {
  resolvedToastOptions,
  customToastIds,
  MessageSuccessToast,
  MessageErrorToast,
} from "../../components/shared/CustomToastContainer";

import { BiCommentDetail } from "react-icons/bi";
import { TbSpeakerphone } from "react-icons/tb";
import { FiUser } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ImCancelCircle } from "react-icons/im";

import { availableNameSpaces } from "../../lexical-editor/constants/constants";
import { getEditorStateTextContent } from "../../lexical-editor/utilities/utilities";

import { toPersianDateTimeStr } from "../../utilities/utilities";

function MessageInfo() {
  const { identifier, messageId } = useParams();

  const navigate = useNavigate();

  const [triggerEdit] = useEditMessageMutation();
  const [triggerDelete] = useDeleteMessageMutation();

  const [isEditEnabled, setIsEditEnabled] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const messageTitleValueRef = useRef(null);
  const messageBodyValueRef = useRef(null);
  const isSmsEnabled = useRef(false);

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

  const canModify = useSelector((state) =>
    canUserModifyChannel(state, message?.channel?.owner_id)
  );

  const resetRefs = useCallback(() => {
    messageTitleValueRef.current = message?.title;
    messageBodyValueRef.current = message?.body;
    isSmsEnabled.current = false;
  }, [messageTitleValueRef, messageBodyValueRef, isSmsEnabled, message]);

  useEffect(() => {
    if (isSuccess) {
      resetRefs();
    }
  }, [isSuccess]);

  const handleEnableEdit = useCallback(() => {
    setIsEditEnabled(true);
  }, [setIsEditEnabled]);

  const handleDisableEdit = useCallback(() => {
    resetRefs();
    setIsEditEnabled(false);
  }, [setIsEditEnabled, resetRefs]);

  const openWarningModal = useCallback(() => {
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const closeWarningModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleSubmitEdit = useCallback(async () => {
    // after first render
    // the ref.current for title and body is null
    // after message load
    // ref.current will be the fetched value (string)
    // after edit title
    // titleRef.current is string
    // after edit body
    // bodyRef.current is object (editorState)

    // null or ''
    if (!messageTitleValueRef?.current) {
      toast.error("عنوان پیام نمی تواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    // null
    if (!messageBodyValueRef?.current) {
      toast.error("متن پیام نمی تواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    const messageTitle = messageTitleValueRef?.current;
    const messageBodyEditorState = messageBodyValueRef?.current;
    const messageBodyJsonStr = JSON.stringify(messageBodyEditorState);

    // if nothing changed and user wants to submit
    // titleRef.current is same string
    // bodyRef.current is string (not editorState object)
    // or json str of bodyRef.current is same as fetched json str
    //  (user typed somthing but removed it)
    // we should prevent submit in this case
    if (
      messageTitle === message?.title &&
      (typeof messageBodyEditorState === "string" ||
        messageBodyJsonStr === message?.body)
    ) {
      toast.error("عنوان و متن پیام تغییری نکردند.", {
        toastId: customToastIds.unchangedInput,
      });
      return;
    }

    // when we reach here
    // user may changed  message title, but not message body
    // in this case, the messageBodyEditorState is still a json str
    // (not editorState object)
    // the below line will call messageBodyEditorState.read() so throws error
    // to prevent this bug
    // we trigger an update on the editor object (editor.update(<noeffect callback>))
    // so on the editor first(or second) render, the onChange will be called
    // in the onChagnge body will always assign editorState to the passed ref
    // see TriggerUpdate plugin in lexical-editor folder
    const messageBodyRawText = await getEditorStateTextContent(
      messageBodyEditorState
    );
    if (!messageBodyRawText) {
      toast.error("متن پیام خالی است.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست`, { type: "info" });

      await triggerEdit({
        channelId: message?.channel?._id,
        messageId: message?._id,
        title: messageTitle,
        body: messageBodyJsonStr,
        bodyRawPreview: messageBodyRawText.substring(0, 100),
        // send to sms service
        bodyRaw: isSmsEnabled ? messageBodyRawText : "",
        smsEnabled: isSmsEnabled?.current,
      }).unwrap();

      toast.success(
        <MessageSuccessToast
          messageTitle={message?.title}
          crudOperationType="edited"
        />,
        resolvedToastOptions
      );

      setIsEditEnabled(false);
    } catch (err) {
      toast.error(<MessageErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, [messageTitleValueRef, messageBodyValueRef, message]);

  const handleSubmitDelete = useCallback(async () => {
    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست...`, { type: "info" });
      await triggerDelete({
        channelId: message?.channel?._id,
        messageId: message?._id,
      }).unwrap();
      toast.success(
        <MessageSuccessToast
          messageTitle={message?.title}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
      navigate(`/channels/${message?.channel?.identifier}`);
    } catch (err) {
      toast.error(<MessageErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, [message]);

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
  if (!canModify) {
    buttonsContent = null;
  } else if (isSuccess && !isEditEnabled) {
    buttonsContent = (
      <>
        <Button
          onClick={handleEnableEdit}
          className={styles.actionBtn + " " + styles.editBtn}
        >
          <BiEdit />
          ویرایش
        </Button>
        <Button
          className={styles.actionBtn + " " + styles.deleteBtn}
          onClick={openWarningModal}
        >
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
        <Button
          onClick={handleSubmitEdit}
          className={styles.actionBtn + " " + styles.submitEditBtn}
        >
          <BiEdit />
          اعمال
        </Button>
      </>
    );
  }

  const renderedCheckBox =
    canModify && isSuccess && isEditEnabled ? (
      <Checkbox
        className={styles.smsCheckbox}
        label="ویرایش همراه با ارسال پیامک"
        onClick={(newValue) => (isSmsEnabled.current = newValue)}
        isCheckedProp={isSmsEnabled?.current}
      />
    ) : null;

  const createdAtPersianDateTime = toPersianDateTimeStr(message?.createdAt);
  const updatedAtPersianDateTime =
    message?.createdAt === message?.updatedAt
      ? "_"
      : toPersianDateTimeStr(message?.updatedAt);

  return (
    <>
      <WarningModal
        data={message}
        WarningParagraph={MessageDeleteWarning}
        isModalOpen={isModalOpen}
        closeModal={closeWarningModal}
        onConfirmClick={handleSubmitDelete}
        confirmButtonText="حذف"
      />

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
        />
        <DataField
          className={styles.updatedAt}
          iconElement={<FiCalendar className={styles.icon} />}
          title="تاریخ آخرین ویرایش"
          mode={mode}
          valueDisplay={updatedAtPersianDateTime}
          valueComponent={DateValueComponent}
        />

        <div className={styles.buttons}>{buttonsContent}</div>
        {renderedCheckBox}

        <DataField
          className={styles.messageTitle}
          iconElement={<BiCommentDetail className={styles.icon} />}
          title="عنوان"
          mode={mode}
          isEditable={true}
          valueDisplay={message?.title}
          valueRef={messageTitleValueRef}
        />
        <DataField
          className={styles.messageBody}
          iconElement={<BiCommentDetail className={styles.icon} />}
          title="متن"
          mode={mode}
          isEditable={true}
          valueDisplay={message?.body}
          valueRef={messageBodyValueRef}
          inputComponent={MessageBodyInputComponent}
          valueComponent={MessageBodyValueComponent}
        />
      </div>
    </>
  );
}

// DateField accepts component to render value of data
// or input to edit that value
// by default value is dispalyed insied <p> tag
// input is displayed inside <input> tag

function DateValueComponent(props) {
  // only modifies default style inside DataField.js that has passed to <p> tag
  return (
    <p className={props.className + " " + styles.DateValue}>{props.children}</p>
  );
}

function MessageBodyValueComponent(props) {
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
  onChange,
  isEditable,
}) {
  return (
    <CustomLexicalEditor
      namespace={availableNameSpaces.messageDetailsPageEditor}
      onChange={onChange}
      defaultValue={defaultValue}
      classNames={{
        container: className,
      }}
      isEditable={isEditable}
    />
  );
}

export default MessageInfo;
