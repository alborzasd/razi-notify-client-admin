import styles from "./ChannelInfo.module.scss";

import { useState, useEffect } from "react";

import { useDispatch } from "react-redux";

import { useParams } from "react-router-dom";

import {
  useDeleteChannelMutation,
  useGetChannelByIdentifierQuery,
  useEditChannelMutation,
  useCreateChannelMutation,
} from "../../../redux/apiSlice";

import Image from "../../../components/shared/Image";
import channelLogo from "../../../assets/images/channel-logo.png";
import Button from "../../../components/shared/Button";
import {
  WarningModal,
  ChannelDeleteWarning,
} from "../../../components/shared/Modal";

import { BiCommentDetail } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import { FiUser } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ImCancelCircle } from "react-icons/im";
import { HiPlus } from "react-icons/hi";

import { ImpulseSpinner } from "react-spinners-kit";

import classNames from "classnames";

import { toPersianDateStr, persianDateNow } from "../../../utilities/utilities";

import { useSelector } from "react-redux";
import { selectUserInfo } from "../../../redux/authSlice";
import {
  selectIsChannelForUser,
  selectIsUserRootAdmin,
} from "../../../redux/authSlice";

import { toast } from "react-toastify";
import {
  resolvedToastOptions,
  customToastIds,
  ChannelSuccessToast,
  ChannelErrorToast,
} from "../../../components/shared/CustomToastContainer";

import { useNavigate } from "react-router-dom";

import { tableInstanceNames } from "../../../redux/tableInstances";
import { setFilterConfig } from "../../../redux/filterConfigSlice";

function ChannelInfo() {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectUserInfo);

  const navigate = useNavigate();

  const [triggerEdit] = useEditChannelMutation();
  const [triggerDelete] = useDeleteChannelMutation();
  const [triggerCreate] = useCreateChannelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // if identifier is undefined, it means we are in the /channels/add route
  // The ChannelAddPage in this route has called this component
  // the 'add' is a fixed string that is configured in router config
  const { identifier } = useParams();

  // declare a boolean for component mode (add or show/edit) to use in render logic
  // in /channels/add route we only show input and a submit button
  // in /channels/:identifier route we send a request to find a channel by the identifier
  const isAddingMode = identifier === undefined;

  // if false, the values are shown inside a <p> tag
  // if true, the data field values are shown in textinputs to enable edit and submit
  // submit and cancel button will be shown to user
  // if adding mode is enabled, we must show the text inputs with empty values
  // also the button to disable edit mode is not available in adding mode (cancel button)
  const [isEditingMode, setIsEditingMode] = useState(isAddingMode);

  const [channelTitleState, setChannelTitleState] = useState("");
  const [channelIdentifierState, setChannelIdentifierState] = useState("");
  const [channelDescriptionState, setChannelDescriptionState] = useState("");

  const {
    data: channel,
    // isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetChannelByIdentifierQuery(identifier, {
    skip: isAddingMode,
  });

  const isChannelForUser = useSelector((state) =>
    selectIsChannelForUser(state, channel?.owner_id)
  );
  const isRootAdmin = useSelector(selectIsUserRootAdmin);

  useEffect(() => {
    if (isSuccess) {
      setChannelTitleState(channel?.title);
      setChannelIdentifierState(channel?.identifier);
      setChannelDescriptionState(channel?.description);

      // if fetch channel by identifier was successful
      // get _id of channel and change filter config of messagesTable
      // data table for messages watches the filter config
      // if it has changed and channelId is defined
      // then the data table sends query to fetch messages of the channel
      dispatch(
        setFilterConfig({
          instanceName: tableInstanceNames.messagesOfChannel,
          config: {
            channelId: channel?._id,
          },
        })
      );
      // also for usersOfChannelTable
      dispatch(
        setFilterConfig({
          instanceName: tableInstanceNames.usersOfChannel,
          config: {
            channelId: channel?._id,
          },
        })
      );
    }
  }, [
    channel?._id,
    channel?.description,
    channel?.identifier,
    channel?.title,
    dispatch,
    isSuccess,
  ]);

  const enableEditingMode = () => {
    setIsEditingMode(true);
  };

  const disableEditingMode = () => {
    setIsEditingMode(false);
  };

  const openWarningModal = () => {
    setIsModalOpen(true);
  };
  const closeWarningModal = () => {
    setIsModalOpen(false);
  };

  const submitEdit = async () => {
    if (!channelTitleState || !channelIdentifierState) {
      toast.error("نام کانال و شناسه کانال نباید خالی باشند.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    if (
      channel?.title === channelTitleState &&
      channel?.identifier === channelIdentifierState &&
      channel?.description === channelDescriptionState
    ) {
      toast.error("مقادیر وارد شده تغییری نکردند.", {
        toastId: customToastIds.unchangedInput,
      });
      return;
    }

    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست`, { type: "info" });
      await triggerEdit({
        id: channel?._id,
        title: channelTitleState,
        identifier: channelIdentifierState,
        description: channelDescriptionState,
      }).unwrap();
      toast.success(
        <ChannelSuccessToast
          channelTitle={channel?.title}
          crudOperationType="edited"
        />,
        resolvedToastOptions
      );
      setIsEditingMode(false); // only if success
      //redirect to new identifier if it has been edited
      if (channel?.identifier !== channelIdentifierState) {
        navigate(`/channels/${channelIdentifierState}`);
      }
    } catch (err) {
      toast.error(<ChannelErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  const submitCreate = async () => {
    if (!channelTitleState || !channelIdentifierState) {
      toast.error("نام کانال و شناسه کانال نباید خالی باشند.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست`, { type: "info" });
      await triggerCreate({
        title: channelTitleState,
        identifier: channelIdentifierState,
        description: channelDescriptionState,
      }).unwrap();
      toast.success(
        <ChannelSuccessToast
          channelTitle={channelTitleState}
          crudOperationType="added"
        />,
        resolvedToastOptions
      );
      navigate(`/channels/${channelIdentifierState}`);
    } catch (err) {
      toast.error(<ChannelErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  const submitDelete = async () => {
    let id;
    try {
      id = toast.loading(`در حال حذف کانال ${channel?.title}`, {
        type: "info",
      });
      await triggerDelete(channel?._id).unwrap();
      toast.success(
        <ChannelSuccessToast
          channelTitle={channel?.title}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
      navigate("/channels");
    } catch (err) {
      toast.error(<ChannelErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  // render logic for deciding which button(s) to show
  let buttonsToShow;
  if (!isAddingMode && !isEditingMode && (isChannelForUser || isRootAdmin)) {
    buttonsToShow = (
      <>
        <Button onClick={enableEditingMode} className={styles.editBtn}>
          <BiEdit />
          ویرایش
        </Button>
        <Button onClick={openWarningModal} className={styles.deleteBtn}>
          <RiDeleteBin6Line />
          حذف
        </Button>
      </>
    );
  } else if (
    !isAddingMode &&
    isEditingMode &&
    (isChannelForUser || isRootAdmin)
  ) {
    buttonsToShow = (
      <>
        <Button onClick={disableEditingMode} className={styles.cancelEditBtn}>
          <ImCancelCircle />
          لغو ویرایش
        </Button>
        <Button onClick={submitEdit} className={styles.submitEditBtn}>
          <BiEdit />
          اعمال
        </Button>
      </>
    );
  } else if (isAddingMode) {
    buttonsToShow = (
      <>
        <Button onClick={submitCreate} className={styles.submitAddBtn}>
          <HiPlus />
          افزودن
        </Button>
      </>
    );
  }

  // render logic for data field values
  const channelTitleElement = !isEditingMode ? (
    <p className={styles.value}>{channel?.title}</p>
  ) : (
    <input
      className={styles.input}
      value={channelTitleState}
      onChange={(e) => setChannelTitleState(e.target.value)}
    />
  );

  const channelIdentifierElement = !isEditingMode ? (
    <p className={styles.value}>{channel?.identifier}</p>
  ) : (
    <input
      className={styles.input}
      value={channelIdentifierState}
      onChange={(e) => setChannelIdentifierState(e.target.value)}
    />
  );

  const channelDescriptionElement = !isEditingMode ? (
    <pre className={styles.value}>{channel?.description}</pre>
  ) : (
    <textarea
      className={styles.input}
      value={channelDescriptionState}
      onChange={(e) => setChannelDescriptionState(e.target.value)}
    />
  );

  // render logic for showing overlay on fetching data
  let overlayContent;
  if (isLoading || isFetching) {
    overlayContent = (
      <ImpulseSpinner
        frontColor={styles.primaryColor}
        backColor={styles.backColor}
      />
    );
  } else if (isError) {
    overlayContent = (
      <>
        <div className={styles.error}>{error?.message}</div>
        <div className={styles.error}>
          {error?.responseData?.messagePersian}
        </div>
      </>
    );
  } else if (isSuccess) {
    overlayContent = <></>;
  }

  const overlayClassname = classNames(styles.overlay, {
    [styles.active]: isLoading || isFetching || isError,
  });

  const asideClassname = classNames(styles.aside, {
    [styles.hidden]: isLoading || isFetching || isError,
  });

  const mainClassname = classNames(styles.main, {
    [styles.hidden]: isLoading || isFetching || isError,
  });

  return (
    <>
      <WarningModal
        data={channel}
        WarningParagraph={ChannelDeleteWarning}
        isModalOpen={isModalOpen}
        closeModal={closeWarningModal}
        onConfirmClick={submitDelete}
        confirmButtonText={"حذف"}
      />

      <div className={styles.ChannelInfo}>
        <div className={overlayClassname}>{overlayContent}</div>

        <aside className={asideClassname}>
          <Image
            className={styles.channelProfileImage}
            src={channel?.profile_image_url}
            fallbackSrc={channelLogo}
            alt={"channel profile"}
          />
          <div className={styles.buttons}>{buttonsToShow}</div>
          <div className={styles.field + " " + styles.owner}>
            <h2 className={styles.label}>
              <FiUser />
              مدیر کانال:
            </h2>
            <p className={styles.value}>
              {isAddingMode
                ? currentUser?.first_name + " " + currentUser?.last_name
                : channel?.owner?.first_name + " " + channel?.owner?.last_name}
            </p>
          </div>
          <div className={styles.field + " " + styles.createdAt}>
            <h2 className={styles.label}>
              <FiCalendar />
              تاریخ ایجاد:
            </h2>
            <p className={styles.value}>
              {isAddingMode
                ? persianDateNow()
                : toPersianDateStr(channel?.createdAt)}
            </p>
          </div>
        </aside>

        <main className={mainClassname}>
          <div className={styles.field + " " + styles.title}>
            <h2 className={styles.label}>
              <BiCommentDetail />
              نام کانال:
            </h2>
            {channelTitleElement}
          </div>
          <div className={styles.field + " " + styles.identifier}>
            <h2 className={styles.label}>
              <BiCommentDetail />
              شناسه کانال:
            </h2>
            {channelIdentifierElement}
          </div>
          <div className={styles.field + " " + styles.description}>
            <h2 className={styles.label}>
              <BiCommentDetail />
              توضیحات:
            </h2>
            {channelDescriptionElement}
          </div>
        </main>
      </div>
    </>
  );
}

export default ChannelInfo;
