import classNames from 'classnames';

export default function Modal({ title }: { title: string }) {
    return (
        <>
            <div className="dialog">
                <div className="dialogBg"></div>
                <div className="dialogBox">
                    <div className='container'>
                        <div className="line">
                            <div className="miniLine"></div>
                        </div>
                        <h3>{title}</h3>
                        <input value="127.0.0.1" className="form-control" />
                        <div className="clearfix"/>
                        <div className={classNames(
                            "btn",
                            "btn-cancel",
                        )}>انصراف</div>
                        <div className={classNames(
                            "btn",
                            "btn-save"
                        )}>بروزرسانی</div>
                    </div>
                </div>
            </div>
        </>
    );
}
