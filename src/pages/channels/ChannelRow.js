import styles from './ChannelRow.module.scss';

import { 
    // selectAllChannels,
    selectCurrentPaginationInfo,
    selectError,
    // selectFilterCallback,
    selectLoadingStatus,
    selectPaginatedChannels,
    // selectPaginationConfig,
    statusEnum
} from '../../redux/channelsSlice';

import Image from '../../components/shared/Image';
import channelLogo from '../../assets/images/channel-logo.png';

import Button from '../../components/shared/Button';

import {BsInfoSquare} from 'react-icons/bs';
import {RiDeleteBin6Line} from 'react-icons/ri';


// coponents to render inside table cells

function RowIndex({data}) {
    return <p>{data.rowNum}</p>;
}

function ProfileImage({data}){
    return (
        <Image
            className={styles.profile}
            fallbackSrc={channelLogo}
            src={data.profil_image_url}
            alt='channel profile image'
        />
    );
}

function Title({data}) {
    return (
        <p>{data.title}</p>
    );
}

function Identifier({data}){
    return (
        <p>{data.identifier}</p>
    );
}

function Description({data}) {
    return (
        <p>{data.description}</p>
    );
}

function UsersNum({data}){
    return (
        <p>{data.count_users}</p>
    );
}

function MessagesNum({data}){
    return (
        <p>{data.count_messages}</p>
    );
}

function CreatedAt({data}){
    return (
        <p>{data.createdAt}</p>
    );
}

function Owner({data}){
    return (
        <p>{data.owner.first_name + ' ' + data.owner.last_name}</p>
    );
}

function Actions({linkTo, handleDelete}) {
    return (
        <div className={styles.buttons}>
            <Button title="مشاهده/ویرایش" className={styles.detailsBtn}><BsInfoSquare/></Button>
            <Button title="حذف" className={styles.removeBtn}><RiDeleteBin6Line/></Button>
        </div>
    );
}

export const config = {
    entityName: 'کانال ها',
    // sliceName: 'Channels',
    selectors: {
        // selectAll: selectAllChannels,
        // selectFilterCallback: selectFilterCallback,
        selectPaginatedData: selectPaginatedChannels,
        selectLoadingStatus: selectLoadingStatus,
        selectError: selectError,
        selectCurrentPaginationInfo: selectCurrentPaginationInfo
        // selectPaginationConfig: selectPaginationConfig
    },
    loadingStatusEnum: statusEnum,
    columns: {
        'ردیف': {
            component: RowIndex
        },
        'پروفایل': {
            component: ProfileImage
        },
        'نام کانال': {
            component: Title
        },
        'شناسه کانال': {
            component: Identifier
        },
        'توضیحات': {
            component: Description
        },
        'تعداد کاربران': {
            component: UsersNum
        },
        'تعداد پیام ها': {
            component: MessagesNum
        },
        'تاریخ ایجاد': {
            component: CreatedAt
        },
        'مدیر کانال': {
            component: Owner
        },
        'عملیات': {
            component: Actions
        }
    }
}

