import classNames from 'classnames';
import Nav from '../../components/Nav';
import packageJsonData from '../../../../package.json';
import gitHubMark from '../../../../assets/img/github-mark.png';
import ircf from '../../../../assets/img/ircf.png';
import twitter from '../../../../assets/img/twitter.png';
import useTranslate from '../../../localization/useTranslate';

export default function About() {
    const appLang = useTranslate();
    return (
        <>
            <Nav title={appLang?.about?.title} />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='container'>
                    <p style={{ whiteSpace: 'pre-wrap' }} role='note'>
                        {appLang?.about?.desc}
                    </p>
                    <p role='note'>
                        <b>{appLang?.about?.slogan}</b>
                    </p>
                    <div className='socialMedia'>
                        <a
                            href='https://github.com/bepass-org/oblivion-desktop'
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div className='item'>
                                <div className='icon'>
                                    <img src={gitHubMark} alt='github' />
                                </div>
                                <div className='host'>Github</div>
                                <div className='name'>Oblivion-Desktop</div>
                            </div>
                        </a>
                        <a href='https://ircf.space/contacts' target='_blank' rel='noreferrer'>
                            <div className='item'>
                                <div className='icon'>
                                    <img src={ircf} alt='ircf' />
                                </div>
                                <div className='host'>Website</div>
                                <div className='name'>ircf.space</div>
                            </div>
                        </a>
                        <a href='https://twitter.com/ircfspace' target='_blank' rel='noreferrer'>
                            <div className='item'>
                                <div className='icon'>
                                    <img src={twitter} alt='ircf' />
                                </div>
                                <div className='host'>Twitter</div>
                                <div className='name'>ircfspace</div>
                            </div>
                        </a>
                        <a
                            href='https://github.com/bepass-org/oblivion-desktop/blob/main/FAQ.md'
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div className='item'>
                                <div className='icon'>
                                    <i className='material-icons'>&#xf04c;</i>
                                </div>
                                <div className='host'>Github</div>
                                <div className='name'>Frequently asked questions</div>
                            </div>
                        </a>
                        <a
                            href='https://github.com/bepass-org/oblivion-desktop/wiki'
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div className='item'>
                                <div className='icon'>
                                    <i className='material-icons'>&#xe0e0;</i>
                                </div>
                                <div className='host'>Github</div>
                                <div className='name'>Wiki</div>
                            </div>
                        </a>
                        <p className='text-center'>
                            <small role='note'>
                                v<b>{packageJsonData.version}</b>
                            </small>
                            <a
                                href='https://github.com/ircfofficial/oblivion-desktop'
                                target='_blank'
                                rel='noreferrer'
                            >
                                <img
                                    className='starBadge'
                                    src='https://img.shields.io/github/stars/bepass-org/oblivion-desktop?style=flat&label=Stars&color=tomato'
                                    alt='star Badge'
                                />
                            </a>
                        </p>
                        <div className='clearfix' />
                        <hr />
                        <a
                            href='https://github.com/bepass-org/warp-plus'
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div className='item'>
                                <div className='icon'>
                                    <i className='material-icons'>&#xe86f;</i>
                                </div>
                                <div className='host'>Core</div>
                                <div className='name'>bepass-org/Warp-Plus</div>
                            </div>
                        </a>
                        <a
                            href='https://github.com/bepass-org/oblivion'
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div className='item'>
                                <div className='icon'>
                                    <i className='material-icons'>&#xe859;</i>
                                </div>
                                <div className='host'>Android</div>
                                <div className='name'>bepass-org/Oblivion</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
