<?php

declare(strict_types=1);

function allow_cors(array $config): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, $config['cors']['origins'], true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function send_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_json(int $status, string $message): void
{
    send_json(['error' => $message], $status);
}

function slugify(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    $value = trim($value, '-');
    return $value ?: 'item-' . uniqid();
}

function sanitize_filename(string $name): string
{
    $name = preg_replace('/[^a-zA-Z0-9-_\.]/', '_', $name) ?? 'file';
    return trim($name, '_');
}

function ensure_upload_dir(array $config, int $projectId): string
{
    $dir = rtrim($config['uploads']['dir'], '/\\') . '/' . $projectId;
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Cannot create upload directory');
    }
    return $dir;
}

function store_upload(array $config, array $file, int $projectId, array $allowedMime): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed with code ' . ($file['error'] ?? 'unknown'));
    }

    if (($file['size'] ?? 0) <= 0 || $file['size'] > $config['uploads']['max_size']) {
        throw new RuntimeException('File too large');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!$mime || !in_array($mime, $allowedMime, true)) {
        throw new RuntimeException('Invalid mime type');
    }

    $ext = match ($mime) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        default => 'bin',
    };

    $dir = ensure_upload_dir($config, $projectId);
    $name = pathinfo($file['name'] ?? ('file.' . $ext), PATHINFO_FILENAME);
    $safe = sanitize_filename($name);
    $target = $dir . '/' . $safe . '-' . uniqid() . '.' . $ext;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        throw new RuntimeException('Failed to move upload');
    }

    // Store relative path (without uploads/projects prefix) so base_url can prepend correctly.
    $relative = $projectId . '/' . basename($target);
    return $relative;
}
