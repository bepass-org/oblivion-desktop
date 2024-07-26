import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { defaultSettings } from '../../../../defaultSettings';
import { defaultToast } from '../../../lib/toasts';

type ProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    profiles: any;
    setProfiles: (value: any) => void;
};
const useProfileModal = (props: ProfileModalProps) => {
    const { isOpen, onClose, profiles, setProfiles } = props;
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    const [profileName, setProfileName] = useState<string>('');
    const [profileEndpoint, setProfileEndpoint] = useState<string>('');
    const [profilesInput, setProfilesInput] = useState<any>(profiles);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const appLang = useTranslate();

    const checkValidEndpoint = useCallback((value: string) => {
        const endpoint = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
        let regex = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d{1,5})$/;
        if (endpoint.startsWith('[')) {
            regex =
                /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))/;
        }
        return regex.test(endpoint) ? endpoint : '';
    }, []);

    const handleAddProfile = useCallback(() => {
        if (editingIndex === null && profilesInput?.length > 6) {
            defaultToast(appLang.modal.profile_limitation('7'), 'PROFILE_LIMITATION', 5000);
        } else if (profileName !== '' && checkValidEndpoint(profileEndpoint) !== '') {
            const newProfile = { name: profileName, endpoint: profileEndpoint };
            if (editingIndex !== null) {
                const updatedProfiles = profilesInput.map((profile: any, index: number) =>
                    index === editingIndex ? newProfile : profile
                );
                setProfilesInput(updatedProfiles);
                setEditingIndex(null);
            } else {
                const isDuplicate = profilesInput.some(
                    (item: any) => item?.name === profileName && item?.endpoint === profileEndpoint
                );
                if (!isDuplicate) {
                    setProfilesInput([...profilesInput, newProfile]);
                }
            }
            toast.remove('PROFILE_LIMITATION');
        }
        setProfileName('');
        setProfileEndpoint('');
    }, [
        appLang.modal,
        checkValidEndpoint,
        editingIndex,
        profileEndpoint,
        profileName,
        profilesInput
    ]);

    const handleRemoveProfile = (key: number) => {
        const updatedProfiles = profilesInput.filter((item: any, index: number) => index !== key);
        setProfilesInput(updatedProfiles);
    };

    const handleEditProfile = (index: number) => {
        const profile = profilesInput[index];
        setProfileName(profile.name);
        setProfileEndpoint(profile.endpoint);
        setEditingIndex(index);
    };

    const cancelEdit = () => {
        setProfileName('');
        setProfileEndpoint('');
        setEditingIndex(null);
    };

    useEffect(() => {
        settings.get('profiles').then((value) => {
            setProfilesInput(
                typeof value === 'undefined' ? defaultSettings.profiles : JSON.parse(value)
            );
        });
    }, []);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModal = useCallback(() => {
        if (profileName !== '' && checkValidEndpoint(profileEndpoint)) {
            handleAddProfile();
        } else {
            settings.set('profiles', JSON.stringify(profilesInput));
            setProfilesInput(profilesInput);
            setProfiles(profilesInput);
            setProfileName('');
            setProfileEndpoint('');
            handleOnClose();
        }
    }, [
        profilesInput,
        setProfilesInput,
        setProfiles,
        handleOnClose,
        //setProfileName,
        //setProfileEndpoint,
        handleAddProfile,
        checkValidEndpoint,
        profileName,
        profileEndpoint
    ]);

    const onUpdateKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                onSaveModal();
            }
        },
        [onSaveModal]
    );

    const handleCancelButtonClick = useCallback(() => {
        setProfiles(profiles);
        setProfilesInput(profiles);
        setProfileName('');
        setProfileEndpoint('');
        handleOnClose();
    }, [profiles, setProfiles, handleOnClose, setProfileName, setProfileEndpoint]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    return {
        showModal,
        appLang,
        onSaveModal,
        onUpdateKeyDown,
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
        cancelEdit,
        checkValidEndpoint,
        handleOnClose,
        isEditing: editingIndex !== null
    };
};

export default useProfileModal;
