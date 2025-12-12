<?php

/**
 * Basic configuration for API/Admin.
 * Override values via environment variables in cPanel.
 */
return [
    'db' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'name' => getenv('DB_NAME') ?: 'prevozko_prevozkop',
        'user' => getenv('DB_USER') ?: 'prevozko_dj',
        'pass' => getenv('DB_PASS') ?: 'djprevozkop',
    ],
    'cors' => [
        // Comma-separated origins, e.g. "https://prevozkop.rs,https://www.prevozkop.rs,https://your-vercel.app"
        'origins' => array_filter(array_map('trim', explode(',', getenv('CORS_ORIGINS') ?: 'https://prevozkop.rs,https://www.prevozkop.rs'))),
    ],
    'uploads' => [
        // Absolute path to uploads/projects
        'dir' => getenv('UPLOAD_DIR') ?: '/home/prevozko/public_html/uploads/projects',
        // Public base URL that points to the uploads dir (ideally served via same domain)
        'base_url' => getenv('UPLOAD_BASE_URL') ?: 'https://prevozkop.rs/uploads/projects',
        // Max upload size in bytes (should align with php.ini upload_max_filesize/post_max_size)
        'max_size' => (int) (getenv('UPLOAD_MAX_BYTES') ?: 32 * 1024 * 1024),
    ],
    'debug' => getenv('APP_DEBUG') === '1',
];
