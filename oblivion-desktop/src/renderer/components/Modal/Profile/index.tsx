import { FC } from 'react';
import classNames from 'classnames';
import useProfileModal from './useProfileModal';
import { defaultSettings } from '../../../../defaultSettings';
import Input from '../../Input';
import { Profile } from '../../../pages/Scanner/useScanner';

interface ProfileModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    profiles: Profile[];
    endpoint: string;
    setProfiles: (value: Profile[]) => void;
}

const ProfileModal: FC<ProfileModalProps> = ({
    title,
    isOpen,
    onClose,
    profiles,
    endpoint,
    setProfiles
}) => {
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        profilesInput,
        profileName,
        setProfileName,
        profileEndpoint,
        setProfileEndpoint,
        handleAddProfile,
        handleRemoveProfile,
        handleEditProfile,
        validEndpoint,
        handleOnClose,
        onSaveModal,
        onUpdateKeyDown,
        showModal,
        isEditing,
        cancelEdit,
        sanitizeName
    } = useProfileModal({
        isOpen,
        onClose,
        profiles,
        setProfiles
    });

    if (!isOpen) return <></>;

    return (
        <div className={classNames('dialog', !showModal ? 'no-opacity' : '')}>
            <div className='dialogBg' onClick={handleOnClose} role='presentation' />
            <div className='dialogBox'>
                <div className='container'>
                    <div className='line'>
                        <div className='miniLine' />
                    </div>
                    <h3>{title}</h3>
                    <div className='input-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={appLang?.modal?.profile_name}
                            minLength={3}
                            maxLength={10}
                            value={profileName}
                            onChange={(e) => {
                                setProfileName(sanitizeName(e.target.value));
                            }}
                        />
                        <Input
                            id='modal_profile_input'
                            value={profileEndpoint}
                            onChange={(e) => {
                                setProfileEndpoint(e.target.value);
                            }}
                            type='text'
                            placeholder={appLang?.modal?.profile_endpoint}
                        />
                        <div className='input-group-btn'>
                            <button
                                className='btn'
                                disabled={
                                    validEndpoint(profileEndpoint) === '' || profileName.length < 1
                                }
                                onClick={() => {
                                    handleAddProfile();
                                }}
                            >
                                {isEditing ? (
                                    <>
                                        <i className='material-icons'>&#xe3c9;</i>
                                    </>
                                ) : (
                                    <>
                                        <i className='material-icons'>&#xe145;</i>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {typeof profilesInput !== 'string' && profilesInput.length > 0 && (
                        <>
                            <div className='tagList'>
                                {profilesInput.map(
                                    (item: Profile, index: number) =>
                                        typeof item.endpoint === 'string' &&
                                        item.endpoint.length > 7 && (
                                            <>
                                                <div className='tagItem' key={index}>
                                                    <i
                                                        role='presentation'
                                                        className='material-icons closeIco'
                                                        onClick={() => {
                                                            handleRemoveProfile(index);
                                                        }}
                                                    >
                                                        &#xe5cd;
                                                    </i>
                                                    <i
                                                        role='presentation'
                                                        className='material-icons'
                                                        onClick={() => {
                                                            handleEditProfile(index);
                                                        }}
                                                    >
                                                        &#xe3c9;
                                                    </i>
                                                    <span title={item.endpoint}>{item.name}</span>
                                                </div>
                                            </>
                                        )
                                )}
                            </div>
                        </>
                    )}
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={isEditing ? cancelEdit : handleCancelButtonClick}
                        onKeyDown={isEditing ? cancelEdit : handleCancelButtonKeyDown}
                        role='button'
                        tabIndex={0}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={onUpdateKeyDown}
                        tabIndex={0}
                    >
                        {appLang?.modal?.update}
                    </div>
                    <div
                        role='button'
                        className={classNames(
                            'btn',
                            'btn-update',
                            defaultSettings.endpoint === endpoint ? 'hidden' : ''
                        )}
                        onClick={() => {
                            setProfileEndpoint(endpoint);
                        }}
                        tabIndex={0}
                    >
                        <i className={'material-icons'} title={appLang?.modal?.endpoint_paste}>
                            &#xea8e;
                        </i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
