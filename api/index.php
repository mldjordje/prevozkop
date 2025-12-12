<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

allow_cors($config);
session_start();

$pdo = db($config);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '';
$path = trim(preg_replace('#^/api#', '', $uri), '/');

if ($path === '' || $path === 'health') {
    send_json(['status' => 'ok', 'time' => gmdate('c')]);
}

// Public endpoints
if ($method === 'GET' && $path === 'projects') {
    list_projects($pdo, $config);
}

if ($method === 'GET' && preg_match('#^projects/([^/]+)$#', $path, $m)) {
    get_project($pdo, $config, $m[1]);
}

// Admin endpoints
if (str_starts_with($path, 'admin')) {
    admin_router($pdo, $config, $path, $method);
}

error_json(404, 'Not found');

// --- Controllers ---

function list_projects(PDO $pdo, array $config): void
{
    $isAdmin = isset($_SESSION['admin_id']);
    $limit = max(1, min(100, (int) ($_GET['limit'] ?? 20)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));
    $status = $_GET['status'] ?? 'published';

    if (!$isAdmin && $status !== 'published') {
        $status = 'published';
    }

    $where = $status === 'all' ? '1=1' : 'status = :status';
    $stmt = $pdo->prepare("SELECT id, title, slug, excerpt, hero_image, published_at, created_at FROM projects WHERE {$where} ORDER BY COALESCE(published_at, created_at) DESC LIMIT :limit OFFSET :offset");
    if ($status !== 'all') {
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $data = array_map(fn ($row) => map_project_brief($row, $config), $rows);

    send_json(['data' => $data, 'meta' => ['limit' => $limit, 'offset' => $offset]]);
}

function get_project(PDO $pdo, array $config, string $slug): void
{
    $isAdmin = isset($_SESSION['admin_id']);

    $stmt = $pdo->prepare('SELECT * FROM projects WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    $project = $stmt->fetch();

    if (!$project) {
        error_json(404, 'Project not found');
    }

    if (!$isAdmin && ($project['status'] ?? '') !== 'published') {
        error_json(404, 'Project not published');
    }

    $mediaStmt = $pdo->prepare('SELECT file_path, alt_text, sort_order FROM project_media WHERE project_id = :id ORDER BY sort_order ASC, id ASC');
    $mediaStmt->execute([':id' => $project['id']]);
    $media = $mediaStmt->fetchAll();

    $project = map_project_full($project, $media, $config);
    send_json($project);
}

function admin_router(PDO $pdo, array $config, string $path, string $method): void
{
    $sub = trim(substr($path, strlen('admin')), '/');

    if ($sub === 'login' && $method === 'POST') {
        admin_login($pdo);
    }

    if ($sub === 'logout' && $method === 'POST') {
        session_destroy();
        send_json(['ok' => true]);
    }

    if (!isset($_SESSION['admin_id'])) {
        error_json(401, 'Unauthorized');
    }

    if ($sub === 'projects' && $method === 'GET') {
        list_projects($pdo, $config);
    }

    if ($sub === 'projects' && $method === 'POST') {
        create_project($pdo, $config);
    }

    if (preg_match('#^projects/(\d+)$#', $sub, $m)) {
        $projectId = (int) $m[1];
        if ($method === 'PUT') {
            update_project($pdo, $config, $projectId);
        } elseif ($method === 'DELETE') {
            delete_project($pdo, $projectId);
        } elseif ($method === 'GET') {
            get_project_by_id($pdo, $config, $projectId);
        }
    }

    if (preg_match('#^projects/(\d+)/hero$#', $sub, $m) && $method === 'POST') {
        upload_hero($pdo, $config, (int) $m[1]);
    }

    if (preg_match('#^projects/(\d+)/media$#', $sub, $m) && $method === 'POST') {
        upload_media($pdo, $config, (int) $m[1]);
    }

    error_json(404, 'Admin route not found');
}

function admin_login(PDO $pdo): void
{
    $data = read_json_body();
    $email = strtolower(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        error_json(400, 'Email and password required');
    }

    $stmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        error_json(401, 'Invalid credentials');
    }

    $_SESSION['admin_id'] = (int) $admin['id'];
    send_json(['ok' => true]);
}

function create_project(PDO $pdo, array $config): void
{
    $data = read_json_body();
    $title = trim($data['title'] ?? '');
    $slug = trim($data['slug'] ?? '') ?: slugify($title);
    $excerpt = trim($data['excerpt'] ?? '');
    $body = trim($data['body'] ?? '');
    $status = $data['status'] ?? 'draft';
    $publishedAt = $data['published_at'] ?? null;
    $tags = $data['tags'] ?? null;

    if ($title === '') {
        error_json(400, 'Title is required');
    }

    $stmt = $pdo->prepare('INSERT INTO projects (title, slug, excerpt, body, status, published_at, tags) VALUES (:title, :slug, :excerpt, :body, :status, :published_at, :tags)');
    try {
        $stmt->execute([
            ':title' => $title,
            ':slug' => $slug,
            ':excerpt' => $excerpt,
            ':body' => $body,
            ':status' => $status,
            ':published_at' => $publishedAt ?: null,
            ':tags' => $tags ? json_encode($tags, JSON_UNESCAPED_UNICODE) : null,
        ]);
    } catch (PDOException $e) {
        error_json(400, 'Failed to create project (slug likely not unique)');
    }

    $id = (int) $pdo->lastInsertId();
    get_project_by_id($pdo, $config, $id, 201);
}

function update_project(PDO $pdo, array $config, int $id): void
{
    $data = read_json_body();
    $fields = [];
    $params = [':id' => $id];

    foreach (['title', 'slug', 'excerpt', 'body', 'status', 'published_at'] as $field) {
        if (array_key_exists($field, $data)) {
            $fields[] = "{$field} = :{$field}";
            $params[":{$field}"] = $data[$field] ?: null;
        }
    }

    if (array_key_exists('tags', $data)) {
        $fields[] = "tags = :tags";
        $params[':tags'] = $data['tags'] ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE) : null;
    }

    if (!$fields) {
        error_json(400, 'No fields to update');
    }

    $sql = 'UPDATE projects SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute($params);
    } catch (PDOException $e) {
        error_json(400, 'Failed to update project (slug maybe not unique)');
    }

    get_project_by_id($pdo, $config, $id);
}

function delete_project(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM projects WHERE id = :id');
    $stmt->execute([':id' => $id]);
    send_json(['ok' => true]);
}

function get_project_by_id(PDO $pdo, array $config, int $id, int $status = 200): void
{
    $stmt = $pdo->prepare('SELECT * FROM projects WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $project = $stmt->fetch();

    if (!$project) {
        error_json(404, 'Project not found');
    }

    $mediaStmt = $pdo->prepare('SELECT file_path, alt_text, sort_order FROM project_media WHERE project_id = :id ORDER BY sort_order ASC, id ASC');
    $mediaStmt->execute([':id' => $id]);
    $media = $mediaStmt->fetchAll();

    $project = map_project_full($project, $media, $config);
    send_json($project, $status);
}

function upload_hero(PDO $pdo, array $config, int $projectId): void
{
    $project = fetch_project($pdo, $projectId);
    if (!$project) {
        error_json(404, 'Project not found');
    }

    try {
        $relative = store_upload($config, $_FILES['file'] ?? [], $projectId, ['image/jpeg', 'image/png', 'image/webp']);
    } catch (RuntimeException $e) {
        error_json(400, $e->getMessage());
    }

    $stmt = $pdo->prepare('UPDATE projects SET hero_image = :hero WHERE id = :id');
    $stmt->execute([':hero' => $relative, ':id' => $projectId]);

    send_json(['hero_image' => build_file_url($config, $relative)]);
}

function upload_media(PDO $pdo, array $config, int $projectId): void
{
    $project = fetch_project($pdo, $projectId);
    if (!$project) {
        error_json(404, 'Project not found');
    }

    try {
        $relative = store_upload($config, $_FILES['file'] ?? [], $projectId, ['image/jpeg', 'image/png', 'image/webp']);
    } catch (RuntimeException $e) {
        error_json(400, $e->getMessage());
    }

    $stmt = $pdo->prepare('INSERT INTO project_media (project_id, file_path, alt_text, sort_order) VALUES (:project_id, :file_path, :alt_text, :sort_order)');
    $stmt->execute([
        ':project_id' => $projectId,
        ':file_path' => $relative,
        ':alt_text' => $_POST['alt'] ?? null,
        ':sort_order' => (int) ($_POST['sort'] ?? 0),
    ]);

    send_json(['file' => build_file_url($config, $relative)]);
}

// --- Utilities ---

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function fetch_project(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM projects WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function build_file_url(array $config, ?string $relative): ?string
{
    if (!$relative) {
        return null;
    }
    return rtrim($config['uploads']['base_url'], '/') . '/' . ltrim($relative, '/');
}

function map_project_brief(array $row, array $config): array
{
    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'excerpt' => $row['excerpt'],
        'hero_image' => build_file_url($config, $row['hero_image'] ?? null),
        'published_at' => $row['published_at'],
        'created_at' => $row['created_at'],
    ];
}

function map_project_full(array $project, array $media, array $config): array
{
    $gallery = array_map(function ($item) use ($config) {
        return [
            'src' => build_file_url($config, $item['file_path']),
            'alt' => $item['alt_text'],
            'sort_order' => (int) $item['sort_order'],
        ];
    }, $media);

    return [
        'id' => (int) $project['id'],
        'title' => $project['title'],
        'slug' => $project['slug'],
        'excerpt' => $project['excerpt'],
        'body' => $project['body'],
        'hero_image' => build_file_url($config, $project['hero_image'] ?? null),
        'gallery' => $gallery,
        'status' => $project['status'],
        'tags' => $project['tags'] ? json_decode($project['tags'], true) : null,
        'published_at' => $project['published_at'],
        'created_at' => $project['created_at'],
        'updated_at' => $project['updated_at'],
    ];
}
