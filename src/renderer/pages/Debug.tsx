import Nav from '../components/Nav';

export default function Debug() {
  return (
    <>
      <Nav title="درباره برنامه" />
      <p>{`
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
      time=2024-04-12T14:20:24.134+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=ad.doubleclick.net:443
      time=2024-04-12T14:20:24.139+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.142+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh4.googleusercontent.com:443
      time=2024-04-12T14:20:24.439+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.442+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.442+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.443+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.444+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      time=2024-04-12T14:20:24.567+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=returnyoutubedislikeapi.com:443
      time=2024-04-12T14:20:24.791+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=accounts.youtube.com:443
      time=2024-04-12T14:20:25.309+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=jnn-pa.googleapis.com:443
      time=2024-04-12T14:20:32.737+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5e6nss.googlevideo.com:443
      time=2024-04-12T14:20:35.958+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr3---sn-4g5e6ns7.googlevideo.com:443
      time=2024-04-12T14:20:37.234+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5e6nzl.googlevideo.com:443
      time=2024-04-12T14:20:38.717+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5e6nzl.googlevideo.com:443
      time=2024-04-12T14:20:43.096+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5e6nzl.googlevideo.com:443
      time=2024-04-12T14:20:44.054+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5e6nsd.googlevideo.com:443
      time=2024-04-12T14:20:44.076+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5e6nsd.googlevideo.com:443
      time=2024-04-12T14:20:44.219+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5lznls.googlevideo.com:443
      time=2024-04-12T14:20:49.496+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:20:50.553+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edn6y.googlevideo.com:443
      time=2024-04-12T14:20:54.392+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=play.google.com:443
      time=2024-04-12T14:21:04.122+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr3---sn-4g5ednkl.googlevideo.com:443
      time=2024-04-12T14:21:04.368+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr4---sn-4g5edns7.googlevideo.com:443
      time=2024-04-12T14:21:04.900+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5lzne6.googlevideo.com:443
      time=2024-04-12T14:21:05.636+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5e6nzs.googlevideo.com:443
      time=2024-04-12T14:21:06.437+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=content-autofill.googleapis.com:443
      time=2024-04-12T14:21:08.635+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr3---sn-4g5lznes.googlevideo.com:443
      time=2024-04-12T14:21:09.528+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.gstatic.com:443
      time=2024-04-12T14:21:16.622+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=i1.ytimg.com:443
      time=2024-04-12T14:21:29.393+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh6.googleusercontent.com:443
      time=2024-04-12T14:21:29.396+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh3.googleusercontent.com:443
      time=2024-04-12T14:21:29.701+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh6.googleusercontent.com:443
      time=2024-04-12T14:21:35.501+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr3---sn-4g5e6nze.googlevideo.com:443
      time=2024-04-12T14:21:37.488+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5lzned.googlevideo.com:443
      time=2024-04-12T14:21:48.299+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5lzned.googlevideo.com:443
      time=2024-04-12T14:21:48.798+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5lznes.googlevideo.com:443
      time=2024-04-12T14:21:49.130+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=history.google.com:443
      time=2024-04-12T14:21:49.547+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:21:50.064+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edndk.googlevideo.com:443
      time=2024-04-12T14:21:51.355+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=mtalk.google.com:5228
      time=2024-04-12T14:21:53.593+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5ednsz.googlevideo.com:443
      time=2024-04-12T14:21:56.270+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr3---sn-4g5lznl7.googlevideo.com:443
      time=2024-04-12T14:22:00.761+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5ednd7.googlevideo.com:443
      time=2024-04-12T14:22:02.473+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5e6nsz.googlevideo.com:443
      time=2024-04-12T14:22:06.226+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edn6y.googlevideo.com:443
      time=2024-04-12T14:22:06.461+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5e6nsd.googlevideo.com:443
      time=2024-04-12T14:22:06.621+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5lznls.googlevideo.com:443
      time=2024-04-12T14:22:07.190+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edndz.googlevideo.com:443
      time=2024-04-12T14:22:08.695+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr1---sn-4g5lznes.googlevideo.com:443
      time=2024-04-12T14:22:13.762+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edndz.googlevideo.com:443
      time=2024-04-12T14:22:13.812+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr2---sn-4g5edndd.googlevideo.com:443
      time=2024-04-12T14:22:14.362+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=pagead2.googlesyndication.com:443
      time=2024-04-12T14:22:14.892+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=ad.doubleclick.net:443
      time=2024-04-12T14:22:14.911+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=pagead2.googlesyndication.com:443
      time=2024-04-12T14:22:14.912+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=ade.googlesyndication.com:443
      time=2024-04-12T14:22:15.380+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=tpc.googlesyndication.com:443
      time=2024-04-12T14:22:22.839+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=ad.doubleclick.net:443
      time=2024-04-12T14:22:45.323+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=rr5---sn-4g5edndz.googlevideo.com:443
      time=2024-04-12T14:22:49.598+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:23:49.649+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:26:14.566+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=returnyoutubedislikeapi.com:443
      time=2024-04-12T14:26:22.009+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=mtalk.google.com:5228
      time=2024-04-12T14:26:39.136+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.167.91:443
      time=2024-04-12T14:26:39.137+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=[2001:67c:4e8:f004::a]:443
      time=2024-04-12T14:26:40.289+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.167.41:443
      time=2024-04-12T14:26:40.289+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=[2001:67c:4e8:f002::a]:443
      time=2024-04-12T14:26:40.289+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.167.41:80
      time=2024-04-12T14:26:40.290+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.167.91:443
      time=2024-04-12T14:26:40.291+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.167.91:80
      time=2024-04-12T14:26:40.292+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=[2001:67c:4e8:f004::a]:443
      time=2024-04-12T14:26:43.177+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.165.136:443
      time=2024-04-12T14:26:43.177+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.165.136:80
      time=2024-04-12T14:26:43.178+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=[2001:67c:4e8:f004::b]:443
      time=2024-04-12T14:26:48.020+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:26:48.460+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:26:48.538+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:26:48.948+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello.com:443
      time=2024-04-12T14:26:48.948+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello.com:443
      time=2024-04-12T14:26:49.058+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=lh3.googleusercontent.com:443
      time=2024-04-12T14:26:49.823+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=history.google.com:443
      time=2024-04-12T14:26:51.265+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=api.atlassian.com:443
      time=2024-04-12T14:26:51.433+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello.com:443
      time=2024-04-12T14:26:51.512+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=o55978.ingest.sentry.io:443
      time=2024-04-12T14:26:51.576+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=api.atlassian.com:443
      time=2024-04-12T14:26:51.577+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=api.atlassian.com:443
      time=2024-04-12T14:26:52.776+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=content-autofill.googleapis.com:443
      time=2024-04-12T14:26:53.003+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello-members.s3.amazonaws.com:443
      time=2024-04-12T14:26:54.057+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=d2k1ftgv7pobq7.cloudfront.net:443
      time=2024-04-12T14:26:54.090+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=xp.atlassian.com:443
      time=2024-04-12T14:26:54.102+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello-backgrounds.s3.amazonaws.com:443
      time=2024-04-12T14:26:55.095+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=views.unsplash.com:443
      time=2024-04-12T14:27:03.137+03:30 level=WARN msg="read tcp 127.0.0.1:8086->127.0.0.1:59048: read: connection reset by peer" gool=inner subsystem=vtun
      time=2024-04-12T14:27:17.818+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=trello-members.s3.amazonaws.com:443
      time=2024-04-12T14:27:22.381+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=app.butlerfortrello.com:443
      time=2024-04-12T14:27:23.485+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=p.trellocdn.com:443
      time=2024-04-12T14:27:28.019+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=googleads.g.doubleclick.net:443
      time=2024-04-12T14:29:07.808+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=open-vsx.org:443
      time=2024-04-12T14:29:08.069+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=api.github.com:443
      time=2024-04-12T14:29:21.033+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.165.136:443
      time=2024-04-12T14:29:21.033+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=149.154.165.136:80
      time=2024-04-12T14:29:21.033+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=[2001:67c:4e8:f004::b]:443
      time=2024-04-12T14:30:29.090+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=accounts.youtube.com:443
      time=2024-04-12T14:30:29.394+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=accounts.youtube.com:443
      time=2024-04-12T14:30:29.395+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=accounts.youtube.com:443
      time=2024-04-12T14:30:50.006+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=www.google.com:443
      time=2024-04-12T14:30:52.572+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=mtalk.google.com:5228
      time=2024-04-12T14:31:34.036+03:30 level=INFO msg="handling connection" gool=inner subsystem=vtun protocol=tcp destination=yt3.ggpht.com:443
      `}</p>
    </>
  );
}
