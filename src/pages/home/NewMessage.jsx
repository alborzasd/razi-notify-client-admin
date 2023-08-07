import styles from "./NewMessage.module.scss";

import { useRef, useState, useMemo, useEffect } from "react";

import {
  useGetMyOwnChannelsQuery,
  useCreateMessageMutation,
} from "../../redux/apiSlice";

import Button from "../../components/shared/Button";
import RtlScrollbars from "../../components/shared/RtlScrollbars";

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
} from "../../components/shared/CustomToastContainer";

function NewMessage() {
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [channelId, setChannelId] = useState("");
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);

  // this value is not submitted to create channel
  // is submitted with another get query to search channels
  const [channelInputValue, setChannelInputValue] = useState("");
  // changed input is by selecting an item or is it by just typing in input
  const [isInputBySelect, setIsInputBySelect] = useState(false);

  const [triggerCreate] = useCreateMessageMutation();

  const toggleSmsEnabled = () => {
    setIsSmsEnabled((prev) => !prev);
  };

  const submitCreate = async () => {
    if (!messageTitle || !messageBody) {
      toast.error("عنوان و متن پیام نمی توانند خالی باشند", {
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

    let toastId;
    try {
      toastId = toast.loading(`در حال ارسال درخواست`, { type: "info" });
      await triggerCreate({
        channelId: channelId,
        title: messageTitle,
        body: messageBody,
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
      setMessageBody("");
      setIsSmsEnabled(false);
      // in order to reset channelId,
      // the form input must be reset also
      // becuase the selected channelId is hidden from user
      // he can only see the input value is typed
      setChannelId('');
      setChannelInputValue('');
      setIsInputBySelect(false);
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
      <textarea
        className={styles.input + " " + styles.messageBody}
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
        placeholder="متن"
      />
      <ChannelSelector
        className={styles.channelSelector}
        setChannelId={setChannelId}
        channelInputValue={channelInputValue}
        setChannelInputValue={setChannelInputValue}
        isInputBySelect={isInputBySelect}
        setIsInputBySelect={setIsInputBySelect}
      />
      <div className={styles.smsCheckbox} onClick={toggleSmsEnabled}>
        <div className={styles.checkBox}>
          {isSmsEnabled && <FaCheck className={styles.checkIcon} />}
        </div>
        ارسال پیامک به اعضا
      </div>
      <Button className={styles.messageSubmit} onClick={submitCreate}>
        <LuSend />
        ارسال پیام
      </Button>
    </div>
  );
}

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

const MessageSuccessToast = ({ messageTitle, crudOperationType }) => {
  const messageSlice = `پیام '${messageTitle}' با موفقیت `;
  const whatHappened =
    crudOperationType === "added"
      ? messageSlice + "ارسال شد."
      : crudOperationType === "edited"
      ? messageSlice + "ویرایش شد."
      : crudOperationType === "deleted"
      ? messageSlice + "حذف شد."
      : "عملیات با موفقیت انجام شد";
  return <p>{whatHappened}</p>;
};

const MessageErrorToast = ({ err }) => {
  const errorMessage = err?.message;
  const errorDetails =
    err?.responseData?.title ??
    err?.responseData?.body ??
    err?.responseData?.messagePersian ??
    err?.responseData?.message;

  return (
    <>
      <p>{errorMessage}</p>
      <pre>{errorDetails}</pre>
    </>
  );
};

export default NewMessage;
