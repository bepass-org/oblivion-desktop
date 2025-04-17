import { Language } from './type';

const indonesia: Language = {
    global: {},
    status: {
        connecting: 'Menghubungkan ...',
        connected: 'Terhubung',
        connected_confirm: 'Berhasil Terhubung',
        disconnecting: 'Memutuskan ...',
        disconnected: 'Terputus',
        ip_check: 'Mengecek IP ...',
        keep_trying: 'Silakan tunggu sebentar untuk mencoba lagi...',
        preparing_rulesets: 'Sedang menyiapkan set aturan...',
        downloading_rulesets_failed: 'Gagal mengunduh set aturan.'
    },
    home: {
        title_warp_based: 'Berbasis Warp',
        drawer_settings_warp: 'Pengaturan Warp',
        drawer_settings_routing_rules: 'Aturan Perutean',
        drawer_settings_app: 'Pengaturan Aplikasi',
        drawer_settings_scanner: 'Pengaturan Pemindai',
        drawer_settings_network: 'Pengaturan Jaringan',
        drawer_log: 'Log Aplikasi',
        drawer_update: 'Perbarui',
        drawer_update_label: 'Pembaruan Baru',
        drawer_speed_test: 'Uji kecepatan',
        drawer_about: 'Tentang Aplikasi',
        drawer_lang: 'Ganti Bahasa',
        drawer_singbox: 'Pengaturan Terowongan'
    },
    toast: {
        ip_check_please_wait: 'Mohon tunggu beberapa detik untuk mencoba kembali pemeriksaan!',
        ir_location:
            'Cloudflare telah tersambung ke IP dengan lokasi Iran, yang berbeda dengan IP Anda yang sebenarnya. Anda bisa menggunakannya untuk melewati penyaringan, tetapi tidak untuk sanksi. \nJangan khawatir! Anda bisa mengubah lokasi dalam pengaturan menggunakan opsi "Gool" atau "psiphon".',
        btn_submit: 'Mengerti',
        copied: 'Tersalin!',
        cleared: 'Log telah dibersihkan!',
        please_wait: 'Mohon Tunggu ...',
        offline: 'Anda sedang offline!',
        settings_changed: 'Menerapkan pengaturan memerlukan penyambungan ulang.',
        hardware_usage:
            'Mengaktifkan opsi ini akan meningkatkan penggunaan sumber daya perangkat keras.',
        config_added:
            'Konfigurasi telah berhasil ditambahkan, dan untuk menggunakannya, Anda harus mengklik koneksi.',
        profile_added: 'Titik akhir telah berhasil ditambahkan ke profil.',
        endpoint_added: 'Endpoint berhasil diganti.',
        new_update:
            'Versi baru aplikasi tersedia. Apakah Anda ingin mengunduh dan menyiapkannya untuk instalasi?'
    },
    settings: {
        title: 'Pengaturan Warp',
        more: 'Pengaturan Lebih',
        method_warp: 'Warp',
        method_warp_desc: 'Aktifkan Warp',
        method_gool: 'Gool',
        method_gool_desc: 'Aktifkan WarpInWarp',
        method_psiphon: 'Psiphon',
        method_psiphon_desc: 'Aktifkan Psiphon',
        method_psiphon_location: 'Negara',
        method_psiphon_location_auto: 'acak',
        method_psiphon_location_desc: 'Pilih IP negara yang diinginkan',
        endpoint: 'Titik Akhir',
        endpoint_desc: 'Kombinasi IP atau nama domain, bersama dengan port',
        license: 'Lisensi',
        license_desc: 'Konsumsi lisensi menjadi dua kali lipat',
        option: 'Pengaturan Aplikasi',
        network: 'Pengaturan Jaringan',
        proxy_mode: 'Konfigurasi',
        proxy_mode_desc: 'Menentukan Pengaturan Proxy',
        port: 'Port Proxy',
        port_desc: 'Tentukan port proxy aplikasi',
        share_vpn: 'Alamat ikat',
        share_vpn_desc: 'Bagikan proxy di jaringan',
        dns: 'DNS',
        dns_desc: 'Blokir iklan & konten dewasa',
        dns_error: 'Ini berlaku untuk metode Warp dan Gool',
        ip_data: 'Cek IP',
        ip_data_desc: 'Tampilkan IP & Lokasi setelah koneksi',
        data_usage: 'Penggunaan Data',
        data_usage_desc: 'Tampilkan penggunaan data & kecepatan waktu nyata',
        dark_mode: 'Mode Gelap',
        dark_mode_desc: 'Menentukan mode tampilan aplikasi',
        lang: 'Bahasa',
        lang_desc: 'Ganti bahasa antarmuka aplikasi',
        open_login: 'Mulai saat masuk',
        open_login_desc: 'Buka saat sistem dinyalakan',
        auto_connect: 'Koneksi Otomatis',
        auto_connect_desc: 'Hubungkan saat aplikasi dibuka',
        start_minimized: 'Mulai diminimalkan',
        start_minimized_desc: 'Minimalkan saat aplikasi dibuka',
        system_tray: 'Baki Sistem',
        system_tray_desc: 'Tidak menempatkan ikon program di bilah tugas',
        force_close: 'Paksa Tutup',
        force_close_desc: 'Jangan berada di baki sistem saat keluar',
        shortcut: 'Navigator',
        shortcut_desc: 'Pintasan di halaman beranda',
        sound_effect: 'efek suara',
        sound_effect_desc: 'memutar suara saat koneksi berhasil',
        restore: 'Pulihkan',
        restore_desc: 'Menerapkan pengaturan bawaan aplikasi',
        scanner: 'Pengaturan Pemindai',
        scanner_alert: 'Pemindai diaktifkan jika Anda menggunakan alamat titik akhir bawaan.',
        scanner_ip_type: 'Tipe Titik Akhir',
        scanner_ip_type_auto: 'Otomatis',
        scanner_ip_type_desc: 'Untuk mencari IP titik akhir',
        scanner_rtt: 'Selang Waktu',
        scanner_rtt_default: 'Bawaan',
        scanner_rtt_desc: 'Batas Pemindai RTT',
        scanner_reserved: 'Dicadangkan',
        scanner_reserved_desc: 'Mengesampingkan nilai cadangan penjaga keamanan',
        routing_rules: 'Daftar Hitam',
        routing_rules_desc: 'Mencegah lalu lintas agar tidak lewat warp',
        routing_rules_disabled: 'Dimatikan',
        routing_rules_items: 'Item',
        profile: 'Profil',
        profile_desc: 'Titik akhir yang disimpan oleh Anda',
        singbox: 'Pengaturan Singbox',
        close_singbox: 'Hentikan operasi',
        close_singbox_desc: 'Otomatis tutup sing-box saat terputus',
        close_helper: 'Hentikan pembantu',
        close_helper_desc: 'Tutup otomatis pembantu saat keluar',
        mtu: 'Nilai MTU',
        mtu_desc: 'Atur Maximum Transmission Unit',
        geo_block: 'Pemblokiran',
        geo_block_desc: 'Iklan, Malware, Phishing, dan Penambang Kripto',
        geo_rules_ip: 'Routing IP',
        geo_rules_ip_desc: 'Menerapkan aturan GeoIP',
        geo_rules_site: 'Routing Web',
        geo_rules_site_desc: 'Menerapkan aturan GeoSite',
        geo_nsfw_block: 'Penyaring Konten',
        geo_nsfw_block_desc: 'Blokir situs web NSFW',
        more_helper: 'Pengaturan Asisten',
        singbox_log: 'Pencatatan',
        singbox_log_desc: 'Atur Tingkat Pencatatan',
        singbox_stack: 'Tumpukan',
        singbox_stack_desc: 'Atur Jenis Tumpukan',
        singbox_sniff: 'Penyadapan',
        singbox_sniff_desc: 'Aktifkan Sniffing & Override Tujuan',
        singbox_addressing: 'Pengalamatan',
        singbox_addressing_desc: 'Atur Jenis Alamat Antarmuka',
        singbox_udp_block: 'Blokir UDP',
        singbox_udp_block_desc: 'Blokir semua lalu lintas UDP sepenuhnya',
        more_duties: 'Tugas lebih',
        beta_release: 'Pembaruan Beta',
        beta_release_desc: 'Tetap terinformasi tentang versi pra-rilis'
    },
    tabs: {
        home: 'Hubungkan',
        warp: 'Warp',
        network: 'Network',
        scanner: 'Scanner',
        app: 'App',
        singbox: 'Singbox'
    },
    modal: {
        endpoint_title: 'Endpoint',
        license_title: 'Lisensi',
        license_desc:
            'Program ini tidak memerlukan lisensi Warp untuk menjalankannya, tetapi jika Anda mau, Anda bisa memasukkan lisensi Anda di sini.',
        form_clear: 'Hapus',
        test_url_title: 'URL Uji',
        test_url_desc: 'Alamat uji konektivitas',
        test_url_update: 'Menerima saran',
        port_title: 'Port Proxy',
        restore_title: 'Pulihkan Perubahan',
        restore_desc:
            'Dengan mengonfirmasi operasi pemulihan perubahan, semua pengaturan program akan kembali ke kondisi bawaan dan koneksi Anda akan terputus.',
        routing_rules_sample: 'Sampel',
        routing_rules_alert_tun:
            'Hanya aturan perutean untuk domain, ip, dan aplikasi yang akan mempengaruhi konfigurasi Tun.',
        routing_rules_alert_system:
            'Kecuali aturan perutean aplikasi, aturan lainnya akan mempengaruhi konfigurasi Proxy Sistem.',
        form_default: 'Bawaan',
        endpoint_suggested: 'Disarankan',
        endpoint_latest: 'Terkini',
        endpoint_update: 'Menerima titik akhir yang disarankan',
        endpoint_paste: 'Menempelkan titik akhir aktif',
        profile_title: 'Profil',
        profile_name: 'Judul',
        profile_endpoint: 'Titik Akhir',
        profile_limitation: (value) => `Anda dapat menambahkan maksimal ${value} titik akhir.`,
        mtu_title: 'Nilai MTU',
        mtu_desc:
            'Maximum Transmission Unit (MTU) mengacu pada ukuran maksimum paket data, yang harus diatur antara 1000 hingga 9999.',
        custom_dns_title: 'DNS Kustom',
        confirm: 'Saya mengerti',
        update: 'Perbarui',
        cancel: 'Batalkan'
    },
    log: {
        title: 'Log Aplikasi',
        desc: 'Jika log dibuat oleh program, log akan ditampilkan di sini.',
        error_invalid_license: 'Lisensi yang dimasukkan tidak valid.',
        error_too_many_connected: 'Batas penggunaan lisensi sudah terisi.',
        error_access_denied: 'Jalankan program sebagai Administrator.',
        error_failed_set_endpoint: 'Periksa atau ganti nilai titik akhir, atau coba lagi.',
        error_warp_identity: 'Kesalahan otentikasi di cloudflare; Coba lagi.',
        error_script_failed: 'Program mengalami kesalahan; Coba lagi.',
        error_object_null: 'Program mengalami kesalahan; Coba lagi.',
        error_port_already_in_use: (value) => `Port ${value} sedang digunakan program lain.`,
        error_port_socket: 'Gunakan port lain.',
        error_port_restart: 'Port sedang digunakan; memulai ulang ...',
        error_unknown_flag: 'Perintah yang tidak valid dieksekusi di latar belakang.',
        error_deadline_exceeded: 'Waktu koneksi habis; Coba Lagi.',
        error_configuration_encountered: 'Konfigurasi proxy mengalami kesalahan!',
        error_desktop_not_supported: 'Lingkungan desktop tidak didukung!',
        error_configuration_not_supported:
            'Konfigurasi proxy tidak didukung pada sistem operasi Anda, tetapi Anda dapat menggunakan Warp Proxy secara manual.',
        error_configuring_proxy: (value) => `Kesalahan mengkonfigurasi proxy untuk ${value}!`,
        error_wp_not_found: 'File warp-plus tidak terletak di samping paket aplikasi!',
        error_wp_exclusions:
            'Kemungkinan file warp-plus telah dikarantina karena pemberitahuan positif palsu dan deteksi yang salah oleh antivirus, yang menyebabkan masalah dengan kemampuan program untuk mengakses internet secara bebas.\nProgram dapat menambahkan file tersebut ke daftar pengecualian di beberapa antivirus jika izin akses diberikan. Haruskah ini dilakukan?',
        error_wp_stopped: 'File warp-plus mengalami masalah saat dijalankan!',
        error_connection_failed: 'Koneksi ke 1.1.1.1 tidak berhasil.',
        error_country_failed: 'Tidak dapat terhubung ke negara yang dipilih.',
        error_singbox_failed_stop: 'Gagal menghentikan Sing-Box!',
        error_singbox_failed_start: 'Gagal memulai Sing-Box!',
        error_wp_reset_peer: 'Koneksi ke Cloudflare terputus secara tak terduga!',
        error_failed_connection: 'Gagal menjalin koneksi!',
        error_canceled_by_user: 'Operasi dibatalkan oleh pengguna.',
        error_helper_not_found: 'File pembantu tidak ditemukan di sebelah paket aplikasi!',
        error_singbox_ipv6_address:
            'Sistem operasi Anda tidak mendukung IPv6. Silakan pergi ke pengaturan Sing-box dan ubah pengalamatan ke IPv4.'
    },
    about: {
        title: 'Tentang Aplikasi',
        desc: 'Program ini merupakan versi tidak resmi, namun dapat diandalkan dari aplikasi Oblivion untuk Windows, Linux, dan Mac.\nProgram Oblivion Desktop dimodelkan berdasarkan antarmuka pengguna dari versi asli yang dikembangkan oleh Yousef Ghobadi. Program ini ditulis dan dipersiapkan untuk tujuan akses gratis ke Internet, dan perubahan nama atau penggunaan komersial apa pun tidak diperbolehkan..',
        slogan: 'Internet, untuk semua atau tidak sama sekali!'
    },
    systemTray: {
        connect: 'Hubungkan',
        connecting: 'Menghubungkan ...',
        connected: 'Terhubung',
        disconnecting: 'Memutuskan ...',
        settings: 'Pengaturan',
        settings_warp: 'Warp',
        settings_network: 'Jaringan',
        settings_scanner: 'Pemindai',
        settings_app: 'Aplikasi',
        about: 'Tentang',
        log: 'Log',
        speed_test: 'Uji Kecepatan',
        exit: 'Keluar'
    },
    update: {
        available: 'Pembaruan Tersedia',
        available_message: (value) =>
            `Versi terbaru dari ${value} sudah tersedia. Apakah ingin memperbarui sekarang?`,
        ready: 'Pembaruan telah Siap',
        ready_message: (value) =>
            `Versi terbaru dari ${value} sudah siap. Ini akan diinstal setelah restart. Apakah Anda ingin memulai ulang sekarang?`
    },
    speedTest: {
        title: 'Uji Kecepatan',
        initializing: 'Inisialisasi uji kecepatan ...',
        click_start: 'Klik tombol untuk memulai uji kecepatan.',
        error_msg: 'Terjadi kesalahan selama uji kecepatan. Silakan coba lagi.',
        server_unavailable: 'Server uji kecepatan tidak tersedia',
        download_speed: 'Kecepatan unduh',
        upload_speed: 'Kecepatan upload',
        latency: 'Latensi',
        jitter: 'Jitter'
    }
};
export default indonesia;
