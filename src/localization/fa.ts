import { Language } from './type';

const persian: Language = {
    global: {},
    status: {
        connecting: 'درحال اتصال ...',
        connected: 'اتصال برقرار شد',
        connected_confirm: 'متصل هستید',
        disconnecting: 'قطع ارتباط ...',
        disconnected: 'متصل نیستید',
        ip_check: 'دریافت اطلاعات ...'
    },
    home: {
        title_warp_based: 'بر پایه وارپ',
        drawer_settings_warp: 'تنظیمات وارپ',
        drawer_settings_routing_rules: 'قوانین مسیریابی',
        drawer_settings_app: 'تنظیمات برنامه',
        drawer_settings_scanner: 'تنظیمات اسکنر',
        drawer_settings_network: 'تنظیمات شبکه',
        drawer_log: 'لاگ برنامه',
        drawer_update: 'بروزرسانی',
        drawer_update_label: 'نسخه جدید',
        drawer_speed_test: 'تست سرعت',
        drawer_about: 'درباره برنامه',
        drawer_lang: 'تغییر زبان'
    },
    toast: {
        ip_check_please_wait: 'برای بررسی مجدد چندثانیه دیگر تلاش کنید!',
        ir_location:
            'کلودفلر به یک IP با لوکیشن ایران که متفاوت از آیپی اصلیته وصلت کرده که باهاش میتونی فیلترینگ‌رو دور بزنی، اما تحریم‌هارو نه. نگران نباش! در تنظیمات میتونی توسط گزینه «گول» یا «سایفون» لوکیشن رو تغییر بدی.',
        btn_submit: 'متوجه شدم',
        copied: 'کپی شد!',
        cleared: 'لاگ پاکسازی شد!',
        please_wait: 'کمی صبر کنید ...',
        offline: 'به اینترنت متصل نیستید!',
        settings_changed: 'اعمال تنظیمات نیازمند اتصال مجدد می\u200Cباشد.'
    },
    settings: {
        title: 'تنظیمات وارپ',
        more: 'سایر تنظیمات',
        method_warp: 'وارپ',
        method_warp_desc: 'فعالسازی Warp',
        method_gool: 'گول',
        method_gool_desc: 'فعالسازی WarpInWarp',
        method_psiphon: 'سایفون',
        method_psiphon_desc: 'فعالسازی Psiphon',
        method_psiphon_location: 'انتخاب کشور',
        method_psiphon_location_auto: 'Automatic',
        method_psiphon_location_desc: 'انتخاب آی\u200Cپی کشور موردنظر',
        endpoint: 'اندپوینت',
        endpoint_desc: 'ترکیبی از IP یا نام دامنه، به\u200Cهمراه پورت',
        license: 'لایسنس',
        license_desc: 'لایسنس ۲ برابر مصرف می‌شود',
        option: 'تنظیمات برنامه',
        network: 'تنظیمات شبکه',
        proxy_mode: 'پیکربندی',
        proxy_mode_desc: 'انتخاب نحوه تنظیم پروکسی',
        port: 'پورت پروکسی',
        port_desc: 'تعیین پورت پروکسی برنامه',
        share_vpn: 'اتصال از LAN',
        share_vpn_desc: 'اشتراک\u200Cگذاری پروکسی بر روی شبکه',
        dns: 'تغییر DNS',
        dns_desc: 'استفاده از DNS عمومی گوگل',
        ip_data: 'بررسی IP',
        ip_data_desc: 'نمایش آی\u200Cپی و لوکیشن پس\u200Cاز اتصال',
        dark_mode: 'حالت تیره',
        dark_mode_desc: 'مشخص\u200Cکردن حالت نمایش برنامه',
        lang: 'زبان برنامه',
        lang_desc: 'تغییر زبان رابط کاربری برنامه',
        open_login: 'اجرای خودکار',
        open_login_desc: 'بازشدن هنگام روشن\u200Cشدن سیستم',
        auto_connect: 'اتصال خودکار',
        auto_connect_desc: 'متصل‌شدن هنگام بازشدن برنامه',
        system_tray: 'مخفی\u200Cسازی',
        system_tray_desc: 'قرار نگرفتن آیکون برنامه در تسک\u200Cبار',
        restore: 'بازگردانی',
        restore_desc: 'اعمال تنظیمات پیشفرض برنامه',
        scanner: 'تنظیمات اسکنر',
        scanner_alert:
            'اسکنر درصورتی فعال می\u200Cشود که درحال استفاده از آدرس اندپوینت پیشفرض برنامه باشید.',
        scanner_ip_type: 'نوع اندپوینت',
        scanner_ip_type_auto: 'Automatic',
        scanner_ip_type_desc: 'جهت یافتن IP اندپوینت',
        scanner_rtt: 'وقفه زمانی',
        scanner_rtt_default: 'Default',
        scanner_rtt_desc: 'تعیین میزان RTT',
        scanner_reserved: 'رزرو',
        scanner_reserved_desc: 'استفاده از Reserved سفارشی وایرگارد',
        routing_rules: 'لیست سیاه',
        routing_rules_desc: 'جلوگیری از عبور ترافیک از وارپ',
        routing_rules_disabled: 'غیرفعال',
        routing_rules_items: 'مورد'
    },
    tabs: {
        home: 'اتصال',
        warp: 'وارپ',
        network: 'شبکه',
        scanner: 'اسکنر',
        app: 'برنامه'
    },
    modal: {
        endpoint_title: 'اندپوینت',
        license_title: 'لایسنس',
        license_desc:
            'برنامه برای اجرا لزوماً به لایسنس وارپ نیاز نداشته، اما درصورت تمایل می\u200Cتوانید لایسنس خود را اینجا وارد کنید.',
        port_title: 'پورت پروکسی',
        license_clear: 'حذف',
        restore_title: 'بازگردانی تغییرات',
        restore_desc:
            'با تایید عملیات بازگردانی تغییرات، تمامی تنظیمات برنامه به\u200Cحالت پیشفرض بازگشته و اتصال شما قطع می\u200Cگردد.',
        routing_rules_sample: 'نمونه',
        endpoint_default: 'پیشفرض',
        endpoint_suggested: 'پیشنهادی',
        endpoint_latest: 'اخیر',
        confirm: 'تایید می\u200Cکنم',
        update: 'بروزرسانی',
        cancel: 'انصراف'
    },
    log: {
        title: 'لاگ برنامه',
        desc: 'درصورت ایجاد لاگ توسط برنامه، اینجا نمایش داده می\u200Cشود.',
        error_invalid_license: 'لایسنس وارد شده معتبر نیست؛ آن‌را حذف کنید.',
        error_too_many_connected: 'سقف استفاده از لایسنس پر شده؛ آن‌را حذف کنید.',
        error_access_denied: 'برنامه را به‌صورت Run as Administrator اجرا کنید.',
        error_failed_set_endpoint:
            'خطای تنظیم اندپوینت؛ مقدار آن‌را بررسی کرده یا دوباره تلاش کنید.',
        error_warp_identity: 'خطای احراز هویت در کلودفلر؛ دوباره تلاش کنید.',
        error_script_failed: 'برنامه با خطا مواجه شد؛ دوباره تلاش کنید.',
        error_object_null: 'برنامه با خطا مواجه شد؛ دوباره تلاش کنید.',
        error_port_already_in_use: (value) =>
            `پورت ${value} توسط برنامه دیگری درحال استفاده است؛ آن‌را تغییر دهید.`,
        error_port_socket: 'از یک پورت دیگر استفاده نمایید.',
        error_unknown_flag: 'یک دستور نادرست در پس‌زمینه اجرا شده است.',
        error_deadline_exceeded: 'مهلت اتصال پایان یافت؛ دوباره تلاش کنید.',
        error_configuration_encountered: 'پیکربندی پروکسی با خطا مواجه شد!',
        error_desktop_not_supported: 'محیط دسکتاپ پشتیبانی نمی‌شود!',
        error_configuration_not_supported:
            'پیکربندی پروکسی در سیستم عامل شما پشتیبانی نمی‌شود، اما می‌توانید به‌صورت دستی از پروکسی وارپ استفاده کنید.',
        error_configuring_proxy: (value) => `خطای پیکربندی پروکسی برای ${value}!`,
        error_wp_not_found: `فایل warp-plus در کنار بسته برنامه وجود ندارد!`
    },
    about: {
        title: 'درباره برنامه',
        desc: 'این\u200Cبرنامه یک نسخه غیررسمی، اما قابل اطمینان از اپ Oblivion یا فراموشی است که برای ویندوز، لینوکس و مک ارائه گردیده است.\nبرنامه Oblivion Desktop با الگو گرفتن از رابط کاربری نسخه اصلی که توسط یوسف قبادی برنامه\u200Cنویسی شده بود، با هدف دسترسی آزاد به اینترنت تهیه گردیده و هرگونه تغییر نام یا استفاده تجاری از آن مجاز نمی\u200Cباشد.',
        slogan: 'اینترنت برای همه، یا هیچ\u200Cکس!'
    },
    systemTray: {
        connect: 'اتصال',
        connecting: 'درحال اتصال ...',
        connected: 'متصل هستید',
        disconnecting: 'لغو اتصال ...',
        settings: 'تنظیمات',
        settings_warp: '   وارپ   ',
        settings_network: '   شبکه   ',
        settings_scanner: '   اسکنر   ',
        settings_app: '   برنامه   ',
        about: 'درباره',
        log: 'لاگ',
        exit: 'خروج'
    },
    update: {
        available: 'بروزرسانی جدید',
        available_message: (value) => `بروزرسانی جدیدی از ${value} در دسترس است. دریافت می‌کنید؟`,
        ready: 'دریافت شد',
        ready_message: (value) =>
            `برنامه ${value} برای آغاز فرایند بروزرسانی آماده است. راه‌اندازی شود؟`
    }
};
export default persian;
