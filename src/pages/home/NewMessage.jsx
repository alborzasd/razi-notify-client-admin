import styles from "./NewMessage.module.scss";

import React from "react";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";

import {
  useGetMyOwnChannelsQuery,
  useCreateMessageMutation,
} from "../../redux/apiSlice";

import Button from "../../components/shared/Button";
import RtlScrollbars from "../../components/shared/RtlScrollbars";
import Checkbox from "../../components/shared/Checkbox";

import classNames from "classnames";

import { CircleSpinner } from "react-spinners-kit";

import { FiMessageSquare } from "react-icons/fi";
import { LuSend } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
// import { HiOutlineSearch } from "react-icons/hi";

import { toast } from "react-toastify";
import {
  resolvedToastOptions,
  customToastIds,
  MessageSuccessToast,
  MessageErrorToast
} from "../../components/shared/CustomToastContainer";

import CustomLexicalEditor from "../../lexical-editor/CustomLexicalEditor";
import { getEditorStateTextContent } from "../../lexical-editor/utilities/utilities";
import { availableNameSpaces } from "../../lexical-editor/constants/constants";

function NewMessage() {
  const [messageTitle, setMessageTitle] = useState("");
  const [channelId, setChannelId] = useState("");
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);

  const messageBodyRef = useRef();
  // will be toggled between 0, 1 when we want to reset content
  const [editorComponentKey, setEditorComponentKey] = useState(0);

  const [checkboxComponentKey, setCheckboxComponentKey] = useState(0);

  // this value is not submitted to create channel
  // is submitted with another get query to search channels
  const [channelInputValue, setChannelInputValue] = useState("");
  // changed input is by selecting an item or is it by just typing in input
  const [isInputBySelect, setIsInputBySelect] = useState(false);

  const [triggerCreate] = useCreateMessageMutation();

  const toggleSmsEnabled = () => {
    setIsSmsEnabled((prev) => !prev);
  };

  const toggleEditorComponentKey = useCallback(() => {
    setEditorComponentKey((prev) => (prev === 0 ? 1 : 0));
  }, []);

  const toggleCheckboxComponentKey = useCallback(() => {
    setCheckboxComponentKey((prev) => (prev === 0 ? 1 : 0));
  }, []);

  const handleEditorStateChange = useCallback(
    (editorState) => {
      messageBodyRef.current = editorState;
    },
    [messageBodyRef]
  );

  const submitCreate = async () => {
    if (!messageTitle) {
      toast.error("عنوان پیام نمی تواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    if (!messageBodyRef.current) {
      toast.error("متن پیام نمی تواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    if (!channelId) {
      toast.error("کانالی برای ارسال، انتخاب نشده است.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    // get editor state json and raw text
    const messageRawText = await getEditorStateTextContent(
      messageBodyRef.current
    );
    // maybe messageBodyRef is not empty (points to existing editorState obecjt)
    // but text content is empty
    if (!messageRawText) {
      toast.error("متن پیام خالی است.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }
    const messageJsonStr = JSON.stringify(messageBodyRef.current);

    let toastId;
    try {
      toastId = toast.loading(`در حال ارسال درخواست`, { type: "info" });
      await triggerCreate({
        channelId: channelId,
        title: messageTitle,
        body: messageJsonStr,
        bodyRawPreview: messageRawText.substring(0, 100),
        // send to sms service
        der_bodyRaw: messageRawText,
        smsEnabled: isSmsEnabled,
      }).unwrap();
      toast.success(
        <MessageSuccessToast
          messageTitle={messageTitle}
          crudOperationType="added"
        />,
        resolvedToastOptions
      );
      setMessageTitle("");
      setIsSmsEnabled(false);
      // in order to reset channelId,
      // the form input must be reset also
      // becuase the selected channelId is hidden from user
      // he can only see the input value is typed
      setChannelId("");
      setChannelInputValue("");
      setIsInputBySelect(false);
      // unmount current editor
      // then mount a new empty editor
      toggleEditorComponentKey();
      toggleCheckboxComponentKey();
    } catch (err) {
      toast.error(<MessageErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className={styles.NewMessage}>
      <h2 className={styles.cardTitle}>
        <FiMessageSquare />
        ارسال پیام جدید
      </h2>

      <input
        type="text"
        className={styles.input + " " + styles.messageTitle}
        value={messageTitle}
        onChange={(e) => setMessageTitle(e.target.value)}
        placeholder="عنوان"
      />

      <CustomEditorWrapper
        key={"editor" + editorComponentKey}
        onChange={handleEditorStateChange}
      />

      <ChannelSelector
        className={styles.channelSelector}
        setChannelId={setChannelId}
        channelInputValue={channelInputValue}
        setChannelInputValue={setChannelInputValue}
        isInputBySelect={isInputBySelect}
        setIsInputBySelect={setIsInputBySelect}
      />

      <Checkbox
        key={"checkbox" + checkboxComponentKey}
        className={styles.smsCheckbox}
        label="ارسال همراه با پیامک"
        onClick={(_newValue) => toggleSmsEnabled()}
        isCheckedProp={isSmsEnabled}
      />

      <Button className={styles.messageSubmit} onClick={submitCreate}>
        <LuSend />
        ارسال پیام
      </Button>
    </div>
  );
}

// memoize editor component
// to prevent rerender
// every time user types in other fields (title, channle name, ...)
const CustomEditorWrapper = React.memo(({ onChange }) => {
  const handleChange = useCallback(
    (editorState) => {
      if (typeof onChange !== "function") return;
      onChange(editorState);
    },
    [onChange]
  );
  return (
    <CustomLexicalEditor
      namespace={availableNameSpaces.mainPageEditor}
      onChange={handleChange}
      classNames={{ container: styles.messageBody }}
      isEditable={true}
    />
  );
});

function ChannelSelector({
  className,
  setChannelId,
  channelInputValue,
  setChannelInputValue,
  isInputBySelect,
  setIsInputBySelect,
}) {
  // const [channelInputValue, setChannelInputValue] = useState("");

  // if user changes input value and 1s passes, the new input value will assign to this
  // the query hook follows this search value and trigger a request
  // if value is different from previous search value
  const [querySearchValue, setQuerySearchValue] = useState("");
  const duration = useMemo(() => 1000, []); // wait 1s to trigger new search query

  // // changed input is by selecting an item or is it by just typing in input
  // const [isInputBySelect, setIsInputBySelect] = useState(false);

  useEffect(() => {
    let timeoutId;

    // if we remove this condition
    // when user selects 1 of search results
    // channelInputValue changes
    // this change runs this useEffect again
    // so another network request with selected text will fire
    // but we dont want this duplicate request
    if (!isInputBySelect) {
      timeoutId = setTimeout(
        () => setQuerySearchValue(channelInputValue),
        duration
      );
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [channelInputValue, duration, isInputBySelect]);

  const {
    data: channels,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetMyOwnChannelsQuery(querySearchValue);

  const handleChannelItemClick = (channel) => {
    setChannelId(channel?._id);
    setChannelInputValue(channel?.title);
    setIsInputBySelect(true);
  };

  const handleOnChangeInputValue = (e) => {
    setIsInputBySelect(false);
    setChannelId("");
    setChannelInputValue(e.target.value);
  };

  const inputClassname = classNames(styles.input, styles.searchInput, {
    [styles.pseudoDisabled]: isInputBySelect,
  });

  let content;
  if (isLoading || isFetching) {
    content = (
      <StatusContainer>
        <CircleSpinner color={styles.primaryColor} />
      </StatusContainer>
    );
  } else if (isError) {
    content = (
      <StatusContainer>
        <div className={styles.errorMessage}>{error?.message}</div>
        <div className={styles.errorMessage}>
          {error?.responseData?.message}
        </div>
      </StatusContainer>
    );
  } else if (isSuccess && channels?.length === 0) {
    content = (
      <StatusContainer>
        <div>موردی یافت نشد</div>
      </StatusContainer>
    );
  } else if (isSuccess) {
    content = (
      <div className={styles.channelList}>
        {channels.map((channel) => (
          <ChannelItem
            key={channel?._id}
            channel={channel}
            onItemClick={handleChannelItemClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.ChannelSelector + " " + className}>
      <input
        type="text"
        className={inputClassname}
        value={channelInputValue}
        onChange={handleOnChangeInputValue}
        placeholder="ارسال به کانال ... (نام یا شناسه)"
      />
      <div className={styles.channelListContainer}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>
    </div>
  );
}

function ChannelItem({ channel, onItemClick }) {
  const handleClick = () => {
    onItemClick(channel);
  };

  return (
    <div className={styles.ChannelItem} onClick={handleClick}>
      <span>{channel?.title}</span>&nbsp;
      <span className={styles.channelIdentifier}>{channel?.identifier}</span>
    </div>
  );
}

function StatusContainer({ children }) {
  return <div className={styles.StatusContainer}>{children}</div>;
}

export default NewMessage;
