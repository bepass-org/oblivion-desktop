import { useState, useEffect } from 'react';
import classNames from "classnames";
import defFlag from "../../../assets/img/flags/xx.svg";

export default function IpLocation({ isConnected }: {
    isConnected: boolean
}) {
    const [ipInfo, setIpInfo] = useState({countryCode: false, ip: '127.0.0.1' });

    useEffect(() => {
        fetch('https://api.ipify.org/?format=json')
            .then(response => response.json())
            .then(data => {
                const userIp = data?.ip;
                fetch(`https://api.iplocation.net/?ip=${userIp}`)
                    .then(response => response.json())
                    .then(locationData => {
                        setIpInfo({
                            countryCode: (locationData.country_code2).toLowerCase(),
                            ip: locationData.ip
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching IP location:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching user IP:', error);
            });
    }, []);

    return (
        <>
            <div
                className={classNames(
                    'ip',
                    isConnected && ipInfo?.countryCode ? 'connected' : '',
                )}
            >
                <img
                    src={ ipInfo.countryCode
                        ? '../../../assets/img/flags/'+ipInfo.countryCode+'.svg'
                        : defFlag
                    }
                    alt='flag'
                />
                <span>{ipInfo?.ip}</span>
            </div>
        </>
    );
}



