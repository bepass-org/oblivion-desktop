import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { defaultSettings } from '../../../../defaultSettings';

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

    const checkValidEndpoint = (value: string) => {
        const endpoint = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
        let regex = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d{1,5})$/;
        if (endpoint.startsWith('[')) {
            regex =
                /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))/;
        }
        return regex.test(endpoint) ? endpoint : '';
    };

    const handleAddProfile = () => {
        if (checkValidEndpoint(profileEndpoint) !== '') {
            const newProfile = { name: profileName, endpoint: profileEndpoint };
            const isDuplicate = profilesInput.some(
                (item: any) => item?.name === profileName && item?.endpoint === profileEndpoint
            );
            if (!isDuplicate) {
                setProfilesInput([...profilesInput, newProfile]);
            }
        }
        setProfileName('');
        setProfileEndpoint('');
    };

    const handleRemoveProfile = (key: number) => {
        const updatedProfiles = profilesInput.filter((item: any, index: number) => index !== key);
        setProfilesInput(updatedProfiles);
    };

    useEffect(() => {
        settings.get('profiles').then((value) => {
            setProfilesInput(
                typeof value === 'undefined' ? defaultSettings.profiles : JSON.parse(value)
            );
        });
    }, []);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModal = useCallback(() => {
        settings.set('profiles', JSON.stringify(profilesInput));
        setProfilesInput(profilesInput);
        setProfiles(profilesInput);
        setProfileName('');
        setProfileEndpoint('');
        handleOnClose();
    }, [
        profilesInput,
        setProfilesInput,
        setProfiles,
        handleOnClose,
        setProfileName,
        setProfileEndpoint
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
        checkValidEndpoint,
        handleOnClose
    };
};

export default useProfileModal;
