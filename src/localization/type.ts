export interface Global {}

export interface Status {
    connecting: string;
    connected: string;
    connected_confirm: string;
    disconnecting: string;
    disconnected: string;
    ip_check: string;
    keep_trying: string;
}

export interface Home {
    title_warp_based: string;
    drawer_settings_warp: string;
    drawer_settings_routing_rules: string;
    drawer_settings_app: string;
    drawer_settings_scanner: string;
    drawer_settings_network: string;
    drawer_log: string;
    drawer_update: string;
    drawer_update_label: string;
    drawer_speed_test: string;
    drawer_about: string;
    drawer_lang: string;
    drawer_singbox: string;
}

export interface Toast {
    ip_check_please_wait: string;
    ir_location: string;
    btn_submit: string;
    copied: string;
    cleared: string;
    please_wait: string;
    offline: string;
    settings_changed: string;
    hardware_usage: string;
    config_added: string;
    profile_added: string;
    endpoint_added: string;
}

export interface Settings {
    title: string;
    more: string;
    method_warp: string;
    method_warp_desc: string;
    method_gool: string;
    method_gool_desc: string;
    method_psiphon: string;
    method_psiphon_desc: string;
    method_psiphon_location: string;
    method_psiphon_location_auto: string;
    method_psiphon_location_desc: string;
    endpoint: string;
    endpoint_desc: string;
    license: string;
    license_desc: string;
    option: string;
    network: string;
    proxy_mode: string;
    proxy_mode_desc: string;
    port: string;
    port_desc: string;
    share_vpn: string;
    share_vpn_desc: string;
    dns: string;
    dns_desc: string;
    dns_error: string;
    ip_data: string;
    ip_data_desc: string;
    data_usage: string;
    data_usage_desc: string;
    dark_mode: string;
    dark_mode_desc: string;
    lang: string;
    lang_desc: string;
    open_login: string;
    open_login_desc: string;
    auto_connect: string;
    auto_connect_desc: string;
    system_tray: string;
    system_tray_desc: string;
    force_close: string;
    force_close_desc: string;
    shortcut: string;
    shortcut_desc: string;
    restore: string;
    restore_desc: string;
    scanner: string;
    scanner_alert: string;
    scanner_ip_type: string;
    scanner_ip_type_auto: string;
    scanner_ip_type_desc: string;
    scanner_rtt: string;
    scanner_rtt_default: string;
    scanner_rtt_desc: string;
    scanner_reserved: string;
    scanner_reserved_desc: string;
    routing_rules: string;
    routing_rules_desc: string;
    routing_rules_disabled: string;
    routing_rules_items: string;
    profile: string;
    profile_desc: string;
    singbox: string;
    close_singbox: string;
    close_singbox_desc: string;
    close_helper: string;
    close_helper_desc: string;
    mtu: string;
    mtu_desc: string;
    geo_block: string;
    geo_block_desc: string;
    geo_rules_ip: string;
    geo_rules_ip_desc: string;
    geo_rules_site: string;
    geo_rules_site_desc: string;
    more_helper: string;
    singbox_log: string;
    singbox_log_desc: string;
    singbox_stack: string;
    singbox_stack_desc: string;
    singbox_sniff: string;
    singbox_sniff_desc: string;
    more_duties: string;
    beta_release: string;
    beta_release_desc: string;
}

export interface Tabs {
    home: string;
    warp: string;
    network: string;
    scanner: string;
    app: string;
    singbox: string;
}

export interface Modal {
    endpoint_title: string;
    license_title: string;
    license_desc: string;
    license_clear: string;
    port_title: string;
    restore_title: string;
    restore_desc: string;
    routing_rules_sample: string;
    routing_rules_alert_system: string;
    routing_rules_alert_tun: string;
    endpoint_default: string;
    endpoint_suggested: string;
    endpoint_latest: string;
    endpoint_update: string;
    endpoint_paste: string;
    profile_title: string;
    profile_name: string;
    profile_endpoint: string;
    profile_limitation: (value: string) => string;
    mtu_title: string;
    mtu_desc: string;
    confirm: string;
    update: string;
    cancel: string;
}

export interface Log {
    title: string;
    desc: string;
    error_invalid_license: string;
    error_too_many_connected: string;
    error_access_denied: string;
    error_failed_set_endpoint: string;
    error_warp_identity: string;
    error_script_failed: string;
    error_object_null: string;
    error_port_already_in_use: (value: string) => string;
    error_port_socket: string;
    error_port_restart: string;
    error_unknown_flag: string;
    error_country_failed: string;
    error_deadline_exceeded: string;
    error_configuration_encountered: string;
    error_desktop_not_supported: string;
    error_configuration_not_supported: string;
    error_configuring_proxy: (value: string) => string;
    error_wp_not_found: string;
    error_wp_stopped: string;
    error_connection_failed: string;
    error_singbox_failed_stop: string;
    error_singbox_failed_start: string;
    error_wp_reset_peer: string;
    error_failed_connection: string;
    error_canceled_by_user: string;
}

export interface About {
    title: string;
    desc: string;
    slogan: string;
}

export interface SystemTray {
    connect: string;
    connecting: string;
    connected: string;
    disconnecting: string;
    settings: string;
    settings_warp: string;
    settings_network: string;
    settings_scanner: string;
    settings_app: string;
    about: string;
    log: string;
    speed_test: string;
    exit: string;
}

export interface Update {
    available: string;
    available_message: (value: string) => string;
    ready: string;
    ready_message: (value: string) => string;
}

export interface SpeedTest {
    title: string;
    initializing: string;
    click_start: string;
    error_msg: string;
    server_unavailable: string;
    download_speed: string;
    upload_speed: string;
    latency: string;
    jitter: string;
}

export interface Language {
    global: Global;
    status: Status;
    home: Home;
    toast: Toast;
    settings: Settings;
    tabs: Tabs;
    modal: Modal;
    log: Log;
    about: About;
    systemTray: SystemTray;
    update: Update;
    speedTest: SpeedTest;
}
