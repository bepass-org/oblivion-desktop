import { Language } from './type';

const spanish: Language = {
    global: {},
    status: {
        connecting: 'Conectando ...',
        connected: 'Conectado',
        connected_confirm: 'Conectado',
        disconnecting: 'Desconectando ...',
        disconnected: 'Desconectado',
        ip_check: 'Comprobando IP ...',
        keep_trying: 'Por favor espera un momento para intentar nuevamente...',
        preparing_rulesets: 'Preparando conjuntos de reglas...',
        downloading_rulesets_failed: 'Error al descargar los conjuntos de reglas.'
    },
    home: {
        title_warp_based: 'Basado en Warp',
        drawer_settings_warp: 'Configuraciones de Warp',
        drawer_settings_routing_rules: 'Reglas de Enrutamiento',
        drawer_settings_app: 'Configuraciones de la Aplicación',
        drawer_settings_scanner: 'Configuraciones del Escáner',
        drawer_settings_network: 'Configuraciones de Red',
        drawer_log: 'Registro de la Aplicación',
        drawer_update: 'Actualizar',
        drawer_update_label: 'Nueva Actualización',
        drawer_speed_test: 'Prueba de Velocidad',
        drawer_about: 'Acerca de la Aplicación',
        drawer_lang: 'Cambiar Idioma',
        drawer_singbox: 'Configuraciones del Túnel'
    },
    toast: {
        ip_check_please_wait:
            'Por favor espera unos segundos para volver a intentar la comprobación!',
        ir_location:
            'Cloudflare se ha conectado a una IP con ubicación en Irán, lo cual es diferente a tu IP real. Puedes usarlo para eludir filtros, pero no sanciones. ¡No te preocupes! Puedes cambiar la ubicación en las configuraciones usando la opción "Gool" o "psiphon".',
        btn_submit: 'Entendido',
        copied: '¡Copiado!',
        cleared: '¡El registro ha sido borrado!',
        please_wait: 'Por favor espera ...',
        offline: '¡Estás Offline!',
        settings_changed: 'Se requiere reconectar para aplicar los cambios de configuración.',
        hardware_usage: 'Habilitar esta opción aumentará el uso de recursos de hardware.',
        config_added:
            'La configuración ha sido añadida con éxito, y para usarla debes hacer clic en la conexión.',
        profile_added: 'El endpoint ha sido añadido correctamente al perfil.',
        endpoint_added: 'El endpoint fue reemplazado correctamente.',
        new_update:
            'Hay una nueva versión de la aplicación disponible. ¿Te gustaría descargarla y prepararla para la instalación?',
        exit_pending:
            'La aplicación está completando su proceso de salida; por favor, espere un momento antes de volver a iniciarla.'
    },
    settings: {
        title: 'Configuraciones de Warp',
        more: 'Más configuraciones',
        method_warp: 'Warp',
        method_warp_desc: 'Habilitar Warp',
        method_gool: 'Gool',
        method_gool_desc: 'Habilitar WarpInWarp',
        method_psiphon: 'Psiphon',
        method_psiphon_desc: 'Habilitar Psiphon',
        method_psiphon_location: 'País',
        method_psiphon_location_auto: 'Aleatorio',
        method_psiphon_location_desc: 'Seleccionar la IP del país deseado',
        endpoint: 'Endpoint',
        endpoint_desc: 'Combinación de IP o nombre de dominio, junto con el puerto',
        license: 'Licencia',
        license_desc: 'El consumo de la licencia está duplicado',
        option: 'Configuraciones de la Aplicación',
        network: 'Configuraciones de Red',
        proxy_mode: 'Configuración',
        proxy_mode_desc: 'Definir configuraciones de proxy',
        port: 'Puerto de Proxy',
        port_desc: 'Definir el puerto del proxy de la aplicación',
        share_vpn: 'Dirección de enlace',
        share_vpn_desc: 'Compartir un proxy en la red',
        dns: 'DNS',
        dns_desc: 'Bloquear anuncios y contenido para adultos',
        dns_error: 'Aplicable a los métodos Warp & Gool',
        ip_data: 'Comprobación de IP',
        ip_data_desc: 'Mostrar IP y ubicación después de la conexión',
        data_usage: 'Uso de Datos',
        data_usage_desc: 'Mostrar el uso de datos y la velocidad en tiempo real',
        dark_mode: 'Modo Oscuro',
        dark_mode_desc: 'Especificar el modo de visualización de la aplicación',
        lang: 'Idioma',
        lang_desc: 'Cambiar el idioma de la interfaz de la aplicación',
        open_login: 'Iniciar al inicio',
        open_login_desc: 'Abrir al inicio del sistema',
        auto_connect: 'Conexión Automática',
        auto_connect_desc: 'Conectar al abrir la aplicación',
        start_minimized: 'Iniciar minimizado',
        start_minimized_desc: 'Minimizar cuando se abre la aplicación',
        system_tray: 'Bandeja del sistema',
        system_tray_desc: 'No colocar el ícono del programa en la barra de tareas',
        force_close: 'Cerrar Forzadamente',
        force_close_desc: 'No dejar el programa en la bandeja del sistema al salir',
        shortcut: 'Navegador',
        shortcut_desc: 'Accesos directos en la página principal',
        sound_effect: 'efecto de sonido',
        sound_effect_desc: 'reproduce un sonido al conectarse con éxito',
        restore: 'Restaurar',
        restore_desc: 'Aplicar los ajustes predeterminados de la aplicación',
        scanner: 'Configuraciones del Escáner',
        scanner_alert:
            'El escáner se activa si estás utilizando la dirección predeterminada del endpoint.',
        scanner_ip_type: 'Tipo de Endpoint',
        scanner_ip_type_auto: 'Automático',
        scanner_ip_type_desc: 'Para encontrar la IP del endpoint',
        scanner_rtt: 'Intervalo',
        scanner_rtt_default: 'Predeterminado',
        scanner_rtt_desc: 'Límite de RTT del escáner',
        scanner_reserved: 'Reservado',
        scanner_reserved_desc: 'Anular el valor reservado de WireGuard',
        routing_rules: 'Lista Negra',
        routing_rules_desc: 'Evitar que el tráfico pase por Warp',
        routing_rules_disabled: 'Deshabilitado',
        routing_rules_items: 'Elementos',
        profile: 'Perfil',
        profile_desc: 'Endpoints guardados por ti',
        singbox: 'Configuraciones de Singbox',
        close_singbox: 'Detener operación',
        close_singbox_desc: 'Cerrar automáticamente Sing-Box al desconectarse',
        close_helper: 'Detener asistente',
        close_helper_desc: 'Cerrar automáticamente el asistente al salir',
        mtu: 'Valor MTU',
        mtu_desc: 'Establecer la Unidad Máxima de Transmisión',
        geo_block: 'Bloqueo',
        geo_block_desc: 'Anuncios, Malware, Phishing & Mineros de Criptomonedas',
        geo_rules_ip: 'Enrutamiento por IP',
        geo_rules_ip_desc: 'Aplicar reglas de GeoIP',
        geo_rules_site: 'Enrutamiento Web',
        geo_rules_site_desc: 'Aplicar reglas de GeoSite',
        geo_nsfw_block: 'Filtro de contenido',
        geo_nsfw_block_desc: 'Bloquear sitios web NSFW',
        more_helper: 'Configuraciones del Asistente',
        singbox_log: 'Registro',
        singbox_log_desc: 'Establecer Nivel de Registro',
        singbox_stack: 'Pila',
        singbox_stack_desc: 'Establecer tipo de Pila',
        singbox_sniff: 'Sniff',
        singbox_sniff_desc: 'Habilitar Sniffing y Anular Destino',
        singbox_addressing: 'Direccionamiento',
        singbox_addressing_desc: 'Establecer tipo de dirección de interfaz',
        singbox_udp_block: 'Bloquear UDP',
        singbox_udp_block_desc: 'Bloquear completamente todo el tráfico UDP',
        more_duties: 'Más responsabilidades',
        beta_release: 'Actualización Beta',
        beta_release_desc: 'Mantente informado sobre versiones previas al lanzamiento'
    },
    tabs: {
        home: 'Conectar',
        warp: 'Warp',
        network: 'Red',
        scanner: 'Escáner',
        app: 'Aplicación',
        singbox: 'Singbox'
    },
    modal: {
        endpoint_title: 'Endpoint',
        license_title: 'Licencia',
        license_desc:
            'El programa no necesita necesariamente una licencia Warp para funcionar, pero si lo deseas, puedes ingresar tu licencia aquí.',
        form_clear: 'Limpiar',
        test_url_title: 'URL de prueba',
        test_url_desc: 'Dirección de prueba de conectividad',
        test_url_update: 'Recibir sugerencias',
        port_title: 'Puerto de Proxy',
        restore_title: 'Restaurar Cambios',
        restore_desc:
            'Al confirmar la operación de restaurar los cambios, todas las configuraciones del programa volverán a su estado predeterminado y tu conexión será desconectada.',
        routing_rules_sample: 'Muestra',
        routing_rules_alert_tun:
            'Solo las reglas de enrutamiento para dominio, IP y aplicación afectarán la configuración de Tun.',
        routing_rules_alert_system:
            'Excepto por la regla de enrutamiento de la aplicación, las otras reglas afectarán la configuración del Proxy del Sistema.',
        form_default: 'Predeterminado',
        endpoint_suggested: 'Sugerido',
        endpoint_latest: 'Último',
        endpoint_update: 'Recibir endpoints sugeridos',
        endpoint_paste: 'Pegar endpoint activo',
        profile_title: 'Perfil',
        profile_name: 'Título',
        profile_endpoint: 'Endpoint',
        profile_limitation: (value) => `Puedes agregar un máximo de ${value} endpoints.`,
        mtu_title: 'Valor MTU',
        mtu_desc:
            'La Unidad Máxima de Transmisión (MTU) se refiere al tamaño máximo de los paquetes de datos, que debe establecerse entre 1000 y 9999.',
        custom_dns_title: 'DNS personalizado',
        confirm: 'Confirmo',
        update: 'Actualizar',
        cancel: 'Cancelar'
    },
    log: {
        title: 'Registro de la Aplicación',
        desc: 'Si se crea un registro por el programa, se mostrará aquí.',
        error_invalid_license: 'La licencia ingresada no es válida; Elimínala.',
        error_too_many_connected: 'El límite de uso de la licencia está lleno; Elimínala.',
        error_access_denied: 'Ejecuta el programa como Administrador.',
        error_failed_set_endpoint:
            'Verifica o reemplaza el valor del endpoint, o intenta nuevamente.',
        error_warp_identity: 'Error de autenticación en Cloudflare; Intenta nuevamente.',
        error_script_failed: 'El programa encontró un error; Intenta nuevamente.',
        error_object_null: 'El programa encontró un error; Intenta nuevamente.',
        error_port_already_in_use: (value) =>
            `El puerto ${value} está siendo usado por otro programa; Cámbialo.`,
        error_port_socket: 'Usa otro puerto.',
        error_port_restart: 'El puerto está en uso; reiniciando ...',
        error_unknown_flag: 'Se ejecutó un comando inválido en segundo plano.',
        error_deadline_exceeded: 'Se agotó el tiempo de conexión; Intenta nuevamente.',
        error_configuration_encountered: '¡Hubo un error en la configuración del Proxy!',
        error_desktop_not_supported: '¡El entorno de escritorio no es compatible!',
        error_configuration_not_supported:
            'La configuración del Proxy no es compatible con tu sistema operativo, pero puedes usar Warp Proxy manualmente.',
        error_configuring_proxy: (value) => `¡Error configurando el proxy para ${value}!`,
        error_wp_not_found:
            '¡El archivo warp-plus no está ubicado junto al paquete de la aplicación!',
        error_wp_exclusions:
            'Es probable que el archivo warp-plus haya sido puesto en cuarentena debido a una alerta de falso positivo y una detección incorrecta por parte del antivirus, lo que ha provocado problemas con la capacidad del programa para acceder libremente a Internet.\nEl programa puede agregar el archivo mencionado a la lista de exclusiones en algunos antivirus si se otorgan permisos de acceso. ¿Se debe hacer esto?',
        error_wp_stopped: '¡El archivo warp-plus encontró un problema al ejecutarse!',
        error_connection_failed: 'No se pudo establecer conexión con 1.1.1.1.',
        error_country_failed: 'No se puede conectar al país seleccionado.',
        error_singbox_failed_stop: '¡No se pudo detener Sing-Box!',
        error_singbox_failed_start: '¡No se pudo iniciar Sing-Box!',
        error_wp_reset_peer: '¡La conexión con Cloudflare se interrumpió inesperadamente!',
        error_failed_connection: '¡No se pudo establecer la conexión!',
        error_canceled_by_user: 'La operación fue cancelada por el usuario.',
        error_helper_not_found:
            '¡El archivo auxiliar no se encuentra junto al paquete de la aplicación!',
        error_singbox_ipv6_address:
            'Tu sistema operativo no es compatible con IPv6. Por favor, ve a la configuración de Sing-box y cambia la dirección a IPv4.'
    },
    about: {
        title: 'Acerca de la Aplicación',
        desc: 'Este programa es una versión no oficial, pero confiable de la aplicación Oblivion para Windows, Linux y Mac.\nEl programa de escritorio Oblivion está basado en la interfaz de usuario de la versión original desarrollada por Yousef Ghobadi. Fue escrito y preparado con el propósito de un acceso libre a Internet, y no se permite el cambio de nombre ni el uso comercial de él.',
        slogan: '¡Internet, para todos o para nadie!'
    },
    systemTray: {
        connect: 'Conectar',
        connecting: 'Conectando ...',
        connected: 'Conectado',
        disconnecting: 'Desconectando ...',
        settings: 'Configuraciones',
        settings_warp: 'Warp',
        settings_network: 'Red',
        settings_scanner: 'Escáner',
        settings_app: 'Aplicación',
        about: 'Acerca de',
        log: 'Registro',
        speed_test: 'Prueba de Velocidad',
        exit: 'Salir'
    },
    update: {
        available: 'Actualización Disponible',
        available_message: (value) =>
            `Una nueva versión de ${value} está disponible. ¿Quieres actualizar ahora?`,
        ready: 'Actualización Lista',
        ready_message: (value) =>
            `Una nueva versión de ${value} está lista. Se instalará después de un reinicio. ¿Quieres reiniciar ahora?`
    },
    speedTest: {
        title: 'Prueba de Velocidad',
        initializing: 'Inicializando prueba de velocidad ...',
        click_start: 'Haz clic en el botón para iniciar la prueba de velocidad',
        error_msg:
            'Ocurrió un error durante la prueba de velocidad. Por favor, inténtalo de nuevo.',
        server_unavailable: 'Servidor de prueba de velocidad no disponible',
        download_speed: 'Velocidad de Descarga',
        upload_speed: 'Velocidad de Subida',
        latency: 'Latencia',
        jitter: 'Jitter'
    }
};
export default spanish;
