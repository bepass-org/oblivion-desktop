import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { defaultSettings } from '../../../../defaultSettings';
import { defaultToast } from '../../../lib/toasts';
import { Profile } from '../../../pages/Scanner/useScanner';
import { sanitizeProfileName, validEndpoint } from '../../../lib/inputSanitizer';
import useButtonKeyDown from '../../../hooks/useButtonKeyDown';
import { withDefault } from '../../../lib/withDefault';

type ProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    profiles: Profile[];
    setProfiles: (value: Profile[]) => void;
};
const useProfileModal = (props: ProfileModalProps) => {
    const { isOpen, onClose, profiles, setProfiles } = props;
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    const [profileName, setProfileName] = useState<string>('');
    const [profileEndpoint, setProfileEndpoint] = useState<string>('');
    const [profilesInput, setProfilesInput] = useState<Profile[]>(profiles);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const appLang = useTranslate();

    const handleAddProfile = useCallback(() => {
        if (editingIndex === null && profilesInput?.length > 6) {
            defaultToast(appLang.modal.profile_limitation('7'), 'PROFILE_LIMITATION', 5000);
        } else if (
            profileName !== '' &&
            validEndpoint(profileEndpoint) !== '' &&
            profileEndpoint.length > 7
        ) {
            const newProfile = { name: profileName, endpoint: profileEndpoint };
            if (editingIndex !== null) {
                const updatedProfiles = profilesInput.map((profile: Profile, index: number) =>
                    index === editingIndex ? newProfile : profile
                );
                setProfilesInput(updatedProfiles);
                setEditingIndex(null);
            } else {
                const isDuplicate =
                    Array.isArray(profilesInput) &&
                    profilesInput.some(
                        (item: Profile) =>
                            item?.name === profileName && item?.endpoint === profileEndpoint
                    );
                if (!isDuplicate) {
                    setProfilesInput([...profilesInput, newProfile]);
                }
            }
            toast.remove('PROFILE_LIMITATION');
        }
        setProfileName('');
        setProfileEndpoint('');
    }, [appLang.modal, editingIndex, profileEndpoint, profileName, profilesInput]);

    const handleRemoveProfile = (key: number) => {
        const updatedProfiles = profilesInput.filter((_, index: number) => index !== key);
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
            setProfiles(JSON.parse(withDefault(value, defaultSettings.profiles)));
        });
    }, []);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModal = useCallback(() => {
        if (
            profileName !== '' &&
            validEndpoint(profileEndpoint) !== '' &&
            profileEndpoint.length > 7
        ) {
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
        profileName,
        profileEndpoint
    ]);

    const onUpdateKeyDown = useButtonKeyDown(onSaveModal);

    const handleCancelButtonClick = useCallback(() => {
        setProfiles(profiles);
        setProfilesInput(profiles);
        setProfileName('');
        setProfileEndpoint('');
        handleOnClose();
    }, [profiles, setProfiles, handleOnClose, setProfileName, setProfileEndpoint]);

    const handleCancelButtonKeyDown = useButtonKeyDown(handleCancelButtonClick);

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
        validEndpoint,
        handleOnClose,
        isEditing: editingIndex !== null,
        sanitizeName: sanitizeProfileName
    };
};

export default useProfileModal;
