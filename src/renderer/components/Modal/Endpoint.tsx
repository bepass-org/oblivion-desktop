import { useState } from "react";
import classNames from 'classnames';
import {loadSettings, saveSettings} from "../../lib/utils";

export default function EndpointModal({ title, isOpen, onClose, defValue }: {
    title: string,
    isOpen: boolean,
    onClose: any,
    defValue: string
}) {

    const [endpoint, setEndpoint] = useState(loadSettings('OBLIVION_ENDPOINT') || defValue);
    if (!isOpen) return null;

    const onSaveModal = () => {
        if ( endpoint.trim() === "") {
            setEndpoint(defValue);
        }
        saveSettings('OBLIVION_ENDPOINT', endpoint);
        onClose();
    };

    return (
        <>
            <div className="dialog">
                <div className="dialogBg" onClick={onClose} />
                <div className="dialogBox">
                    <div className='container'>
                        <div className="line">
                            <div className="miniLine" />
                        </div>
                        <h3>{title}</h3>
                        <input
                            value={endpoint}
                            className="form-control"
                            onChange={(event) => {
                                setEndpoint(event.target.value);
                            }}
                        />
                        <div className="clearfix"/>
                        <div
                            className={classNames(
                                "btn",
                                "btn-cancel",
                            )}
                            onClick={onClose}
                        >انصراف</div>
                        <div
                            className={classNames(
                                "btn",
                                "btn-save"
                            )}
                            onClick={() => {
                                onSaveModal()
                            }}
                        >بروزرسانی</div>
                    </div>
                </div>
            </div>
        </>
    );
}
