import { settings } from "./settings";

const getAsnCode = (name:string) => {
    switch (true) {
        case name?.includes('Mobin Net Communication Company'):
            return 'MBN';
        case name?.includes('Andishe SABZ Khazar'):
            return 'ASK';
        case name?.includes('Mobile Communication Company of Iran'):
            return 'MCI';
        case name?.includes('Iran Cell Service and Communication Company'):
            return 'MTN';
        case name?.includes('Iran Telecommunication Company'):
            return 'MKH';
        case name?.includes('Rightel Communication Service Company'):
            return 'RTL';
        case name?.includes('Aria Shatel Company'):
        case name?.includes('Pardis Fanvari Partak'):
            return 'SHT';
        case name?.includes('Pars Online'):
            return 'PRS';
        case name?.includes('Asiatech Data Transfer'):
            return 'AST';
        case name?.includes('Afranet'):
            return 'AFT';
        case name?.includes('Respina Networks'):
            return 'RSP';
        case name?.includes('Rayaneh Danesh Golestan Complex'):
            return 'HWB';
        case name?.includes('Pishgaman Toseeh Ertebatat Company'):
            return 'PSM';
        case name?.includes('Farabord Dadeh Haye Iranian'):
            return 'ZTL';
        case name?.includes('Fanavari Ertebabat Pasargad Arian'):
            return 'ARX';
        case name?.includes('Fanava Group'):
            return 'FNV';
        case name?.includes('Negin Ertebatate Ava Company'):
            return 'APT';
        case name?.includes('Didehban Net Company'):
            return 'DBN';
        case name?.includes('Pardazeshgar Ray AZMA'):
            return 'RYN';
        default:
            return 'UNK';
    }
};

export async function getIspName() {
    try {
        const response = await fetch('https://api.my-ip.io/v2/ip.json');
        if (!response.ok) {
            return getAsnCode('');
        }
        const data = await response.json();
        const ispName = getAsnCode(data?.asn?.name);
        settings.set('asn', ispName);
        return ispName;
    } catch (error) {
        return getAsnCode('');
    }
}