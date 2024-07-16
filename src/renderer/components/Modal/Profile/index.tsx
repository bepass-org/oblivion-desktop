import { FC } from 'react';
import classNames from 'classnames';
import useProfileModal from './useProfileModal';

interface ProfileModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    profiles: any;
    setProfiles: (value: any) => void;
}

const ProfileModal: FC<ProfileModalProps> = ({ title, isOpen, onClose, profiles, setProfiles }) => {
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
        checkValidEndpoint,
        handleOnClose,
        onSaveModal,
        onUpdateKeyDown,
        showModal
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
                            disabled={profilesInput?.length > 6}
                            onChange={(e) => {
                                setProfileName(e.target.value);
                            }}
                        />
                        <input
                            type='text'
                            className='form-control'
                            placeholder={appLang?.modal?.profile_endpoint}
                            value={profileEndpoint}
                            disabled={profilesInput?.length > 6}
                            onChange={(e) => {
                                setProfileEndpoint(e.target.value);
                            }}
                        />
                        <div className='input-group-btn'>
                            <button
                                className='btn'
                                disabled={
                                    checkValidEndpoint(profileEndpoint) === '' ||
                                    profilesInput?.length > 6
                                }
                                onClick={() => {
                                    handleAddProfile();
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    {typeof profilesInput !== 'string' && profilesInput.length > 0 && (
                        <>
                            <div className='tagList'>
                                {profilesInput.map((item: any, index: number) => (
                                    <div className='tagItem'>
                                        <i
                                            role='presentation'
                                            className='material-icons'
                                            onClick={() => {
                                                handleRemoveProfile(index);
                                            }}
                                        >
                                            &#xe5cd;
                                        </i>
                                        <span title={item.endpoint}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        onKeyDown={handleCancelButtonKeyDown}
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
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
