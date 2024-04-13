import classNames from "classnames";
import Nav from '../components/Nav';
import packageJsonData from "../../../package.json";

export default function Debug() {
    return (
        <>
            <Nav title='لاگ برنامه' />
            <div className={classNames(
                "myApp",
                "normalPage",
                "logPage"
            )}>
                <div className="container">
                    <div className="logOptions">
                        <i className="material-icons">&#xf0ff;</i>
                        <i className="material-icons">&#xe14d;</i>
                    </div>
                    <p className="dirLeft logText">{`
      time=2024-04-12T14:19:56.684+03:30 level=INFO msg="scanner mode enabled" max-rtt=1s
      time=2024-04-12T14:19:56.689+03:30 level=INFO msg="successfully generated wireguard configuration" subsystem=warp/account
      time=2024-04-12T14:19:56.691+03:30 level=INFO msg="successfully generated wireguard configuration" subsystem=warp/account
      time=2024-04-12T14:19:58.693+03:30 level=INFO msg="scan results" endpoints="[{AddrPort:162.159.195.213:946 RTT:159.023755ms CreatedAt:2024-04-12 14:19:58.328083603 +0330 +0330 m=+1.690991518} {AddrPort:188.114.96.141:4177 RTT:385.796001ms CreatedAt:2024-04-12 14:19:57.753373932 +0330 +0330 m=+1.116281848}]"
      time=2024-04-12T14:19:58.693+03:30 level=INFO msg="using warp endpoints" endpoints="[162.159.195.213:946 188.114.96.141:4177]"
      time=2024-04-12T14:19:58.693+03:30 level=INFO msg="running in warp-in-warp (gool) mode"
      time=2024-04-12T14:20:01.071+03:30 level=INFO msg="serving proxy" address=127.0.0.1:8086
      time=2024-04-12T14:20:20.061+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.youtube.com:443
      time=2024-04-12T14:20:20.068+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=fonts.googleapis.com:443
      time=2024-04-12T14:20:20.068+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=fonts.gstatic.com:443
      time=2024-04-12T14:20:20.370+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.youtube.com:443
      time=2024-04-12T14:20:21.052+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=i.ytimg.com:443
      time=2024-04-12T14:20:21.180+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=fonts.gstatic.com:443
      time=2024-04-12T14:20:21.647+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=googleads.g.doubleclick.net:443
      time=2024-04-12T14:20:23.780+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh5.googleusercontent.com:443
      time=2024-04-12T14:20:24.116+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=i4.ytimg.com:443
      `}</p>
                </div>
            </div>
        </>
    );
}
