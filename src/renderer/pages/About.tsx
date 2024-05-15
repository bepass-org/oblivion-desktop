import classNames from 'classnames';
import Nav from '../components/Nav';
import packageJsonData from '../../../package.json';
import gitHubMark from '../../../assets/img/github-mark.png';
import ircf from '../../../assets/img/ircf.png';
import { getLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

export default function About() {
    const appLang = getLang();

    useGoBackOnEscape();

    return (
        <>
            <Nav title={appLang?.about?.title} />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='container'>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{appLang?.about?.desc}</p>
                    <p>
                        <b>{appLang?.about?.slogan}</b>
                    </p>
                    <div className='socialMedia'>
                        <a
                            href='https://github.com/ircfofficial/oblivion-desktop'
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
                        <a href='https://ircf.space/contacts.php' target='_blank' rel='noreferrer'>
                            <div className='item'>
                                <div className='icon'>
                                    <img src={ircf} alt='ircf' />
                                </div>
                                <div className='host'>Website</div>
                                <div className='name'>ircf.space</div>
                            </div>
                        </a>
                        <p className='text-center'>
                            <small>
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
                                    alt='stars'
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
