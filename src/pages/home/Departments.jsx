import styles from "./Departments.module.scss";

import { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";

import { canUserModifyDepartment } from "../../redux/authSlice";

import {
  useGetDepartmentsReportQuery,
  useCreateDepartmentMutation,
  useEditDepartmentMutation,
  useDeleteDepartmentMutation,
  useEditDepartmentProfileImageMutation,
  useDeleteDepartmentProfileImageMutation,
} from "../../redux/apiSlice";

import { apiUrl, staticFilePath } from "../../config";

import Image, { ImagePicker } from "../../components/shared/Image";
import TextOverflow from "../../components/shared/TextOverflow";
import Button from "../../components/shared/Button";

import emptyPhoto from "../../assets/images/empty-photo.png";
import invalidPhoto from "../../assets/images/invalid-photo.png";

import { toast } from "react-toastify";
import {
  resolvedToastOptions,
  customToastIds,
  DepartmentSuccessToast,
  DepartmentErrorToast,
} from "../../components/shared/CustomToastContainer";

import { PiBuildingsBold } from "react-icons/pi";
import { TbBuilding } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";
import { TbSpeakerphone } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ImCancelCircle } from "react-icons/im";
import { HiPlus } from "react-icons/hi";

import generateClassNames from "classnames";

const departmentItemsModes = {
  DISPLAY: "DISPLAY",
  ADD: "ADD",
  EDIT: "EDIT",
};

// TODO: remove
// const tempImageSrc =
//   "https://omrani.razi.ac.ir/documents/584165/1437408/2/6d0092a1-f753-bc7e-dc16-508feb0cdfce?t=1634670068098&download=true";

// // const tempImageSrc = '';

function Departments() {
  const canModify = useSelector(canUserModifyDepartment);

  const { data: departments, isSuccess } = useGetDepartmentsReportQuery();

  let renderedDepartments;
  if (isSuccess) {
    renderedDepartments = departments.map((department) => (
      <DepartmentItem key={department?._id} department={department} />
    ));
  }

  return (
    <div className={styles.Departments}>
      <h2 className={styles.cardTitle}>
        <PiBuildingsBold className={styles.titleIcon} />
        دانشکده ها / بخش ها
      </h2>
      <div className={styles.departmentList}>
        {canModify && <DepartmentItem initialMode={departmentItemsModes.ADD} />}
        {renderedDepartments}
      </div>
    </div>
  );
}

function DepartmentItem({ department, initialMode }) {
  const [triggerCreate] = useCreateDepartmentMutation();
  const [triggerEdit] = useEditDepartmentMutation();
  const [triggerDelete] = useDeleteDepartmentMutation();
  const [triggerEditProfile] = useEditDepartmentProfileImageMutation();
  const [triggerDeleteProfile] = useDeleteDepartmentProfileImageMutation();

  // we can not move from (display, edit) to add mode and vice versa
  // we need a prop to get the inital mode
  const [mode, setMode] = useState(initialMode || departmentItemsModes.DISPLAY);

  const [titleValueState, setTitleValueState] = useState(department?.title);

  // if ref.current is undefined
  //  in add mode it means, no image uploaded
  //  in edit mode it means, initial image has not changed
  // if ref.current is null
  //  in add mode it means, the new uploaded image is removed
  //  in edit mode it means, the initial uploaded image is removed
  //    (and may be after that a new image is uploaded and then removed)
  //    in the last case we should remove image in the backend
  const imageFileRef = useRef(undefined);

  const canModify = useSelector(canUserModifyDepartment);

  const handleEnableEdit = useCallback(() => {
    setMode(departmentItemsModes.EDIT);
  }, [setMode]);

  const handleDisableEdit = useCallback(() => {
    setMode(departmentItemsModes.DISPLAY);
    // reset title state
    setTitleValueState(department?.title);
  }, [setMode]);

  const handleChangeImageFile = useCallback((newImageFile) => {
    // new image file can null if image is removed by user
    imageFileRef.current = newImageFile;
  });

  const submitEditProfileImage = useCallback(async (departmentInfo) => {
    let id;
    try {
      id = toast.loading(`در حال آپلود تصویر`, { type: "info" });
      await triggerEditProfile({
        departmentId: departmentInfo?._id,
        // axios will make FormData from this object
        body: { "department-image": imageFileRef?.current },
      }).unwrap();
      toast.success(
        <DepartmentSuccessToast
          departmentTitle={departmentInfo?.title}
          isImage={true}
          crudOperationType="edited"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<DepartmentErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, []);

  const submitDeleteProfileImage = useCallback(async (departmentInfo) => {
    let id;
    try {
      id = toast.loading(`در حال آپلود تصویر`, { type: "info" });
      await triggerEditProfile({
        departmentId: departmentInfo?._id,
        // axios will make FormData from this object
        body: { "department-image": imageFileRef?.current },
      }).unwrap();
      toast.success(
        <DepartmentSuccessToast
          departmentTitle={departmentInfo?.title}
          isImage={true}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<DepartmentErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, []);

  const handleSubmitCreate = useCallback(async () => {
    if (!titleValueState) {
      toast.error("عنوان دانشکده نمیتواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست`, { type: "info" });
      const departmentInfo = await triggerCreate({
        title: titleValueState,
      }).unwrap();
      toast.success(
        <DepartmentSuccessToast
          departmentTitle={titleValueState}
          crudOperationType="added"
        />,
        resolvedToastOptions
      );
      setTitleValueState("");
      // if any image file is added by user
      // submit another request to upload image
      if (imageFileRef.current) {
        // set a delay to prevent 4 toasts come together
        setTimeout(() => submitEditProfileImage(departmentInfo), 4000);
      }
    } catch (err) {
      toast.error(<DepartmentErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, [titleValueState, department]);

  const handleSubmitEdit = useCallback(async () => {
    if (!titleValueState) {
      toast.error("عنوان دانشکده نمیتواند خالی باشد.", {
        toastId: customToastIds.emptyInput,
      });
      return;
    }

    if (
      titleValueState === department?.title &&
      imageFileRef?.current === undefined
    ) {
      toast.error("عنوان دانشکده تغییری نکرده است.", {
        toastId: customToastIds.unchangedInput,
      });
      return;
    }

    // at this point
    // title is changed
    // or image is changed
    // or both

    let shouldUploadNewImage = false;
    let shouldDeleteCurrentImage = false;
    let timeoutAfterEditTitle = 0;
    // if imageRef becomes null and there was an uploaded image before
    // it means the old image should be deleted
    // maybe imageRef becomes null, but there wasn't any uploaded image before
    // so we dont do anything in this case
    if (imageFileRef?.current === null && department?.profile_image_filename) {
      shouldDeleteCurrentImage = true;
    } else if (imageFileRef?.current) {
      shouldUploadNewImage = true;
    }

    if (titleValueState !== department?.title) {
      let id;
      try {
        id = toast.loading(`در حال ارسال درخواست`, { type: "info" });
        await triggerEdit({
          departmentId: department?._id,
          title: titleValueState,
        }).unwrap();
        toast.success(
          <DepartmentSuccessToast
            departmentTitle={department?.title}
            crudOperationType="edited"
          />,
          resolvedToastOptions
        );
        setMode(departmentItemsModes.DISPLAY);
        timeoutAfterEditTitle = 4000;
      } catch (err) {
        toast.error(<DepartmentErrorToast err={err} />, resolvedToastOptions);
      } finally {
        toast.dismiss(id);
      }
    }

    if (shouldDeleteCurrentImage) {
      setTimeout(
        () => submitDeleteProfileImage(department),
        timeoutAfterEditTitle
      );
      setMode(departmentItemsModes.DISPLAY);
    } else if (shouldUploadNewImage) {
      setTimeout(
        () => submitEditProfileImage(department),
        timeoutAfterEditTitle
      );
      setMode(departmentItemsModes.DISPLAY);
    }
  }, [titleValueState, department]);

  const handleSubmitDelete = useCallback(async () => {
    let id;
    try {
      id = toast.loading("در حال ارسال درخواست", {
        type: "info",
      });
      await triggerDelete({ departmentId: department?._id }).unwrap();
      toast.success(
        <DepartmentSuccessToast
          departmentTitle={department?.title}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<DepartmentErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  }, [department]);

  const departmentItemClassName = generateClassNames(styles.DepartmentItem, {
    [styles.editableDisplayMode]:
      canModify && mode === departmentItemsModes.DISPLAY,
  });

  return (
    <div className={departmentItemClassName}>
      {mode === departmentItemsModes.DISPLAY && (
        <Image
          className={styles.image}
          fallbackSrc={emptyPhoto}
          src={
            apiUrl +
            staticFilePath.departmentImage +
            department?.profile_image_filename
          }
        />
      )}

      {(mode === departmentItemsModes.EDIT ||
        mode === departmentItemsModes.ADD) && (
        <ImagePicker
          containerClassName={styles.image}
          initialSrc={
            mode === departmentItemsModes.ADD ||
            !department?.profile_image_filename
              ? null
              : apiUrl +
                staticFilePath.departmentImage +
                department?.profile_image_filename
          }
          emptyImageSrc={emptyPhoto}
          fallbackSrc={invalidPhoto}
          onImageChange={handleChangeImageFile}
        />
      )}

      {mode === departmentItemsModes.DISPLAY && (
        <div className={styles.body}>
          <div title={department?.title} className={styles.title}>
            <TbBuilding className={styles.icon + " " + styles.departmentIcon} />
            <div className={styles.titleValue}>{department?.title}</div>
          </div>
          <TextOverflow className={styles.info}>
            <FiUsers className={styles.icon + " " + styles.userIcon} />
            تعداد اعضا: &nbsp;
            {department?.users_count}
          </TextOverflow>
          <TextOverflow className={styles.info}>
            <TbSpeakerphone
              className={styles.icon + " " + styles.channelIcon}
            />
            تعداد کانال ها: &nbsp;
            {department?.channels_count}
          </TextOverflow>
        </div>
      )}

      {mode === departmentItemsModes.EDIT && (
        <div className={styles.bodyEditable}>
          <textarea
            className={styles.titleInput}
            placeholder="عنوان دانشکده / بخش سازمانی"
            value={titleValueState}
            onChange={(e) => setTitleValueState(e.target.value)}
          />
          <Button
            className={styles.button + " " + styles.cancelButton}
            onClick={handleDisableEdit}
          >
            <ImCancelCircle />
            لغو ویرایش
          </Button>
          <Button
            className={styles.button + " " + styles.submitEditButton}
            onClick={handleSubmitEdit}
          >
            <BiEdit />
            اعمال
          </Button>
        </div>
      )}

      {mode === departmentItemsModes.ADD && (
        <div className={styles.bodyEditable}>
          <textarea
            className={styles.titleInput}
            placeholder="عنوان دانشکده / بخش سازمانی"
            value={titleValueState}
            onChange={(e) => setTitleValueState(e.target.value)}
          />
          <Button
            className={styles.button + " " + styles.submitAddButton}
            onClick={handleSubmitCreate}
          >
            <HiPlus />
            افزودن
          </Button>
        </div>
      )}

      {canModify && mode === departmentItemsModes.DISPLAY ? (
        <div className={styles.miniButtonsContainer}>
          <Button
            title="حذف"
            className={styles.button + " " + styles.deleteButton}
            onClick={handleSubmitDelete}
          >
            <RiDeleteBin6Line />
          </Button>
          <Button
            title="ویرایش"
            className={styles.button + " " + styles.editButton}
            onClick={handleEnableEdit}
          >
            <BiEdit />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default Departments;
