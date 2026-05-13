<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

allow_cors($config);

$sessionLifetime = (int) ($config['admin_session']['lifetime'] ?? 60 * 60 * 24 * 90);
ini_set('session.gc_maxlifetime', (string) $sessionLifetime);
session_set_cookie_params([
    'lifetime' => $sessionLifetime,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$pdo = db($config);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '';
$path = trim(preg_replace('#^/api#', '', $uri), '/');

if (str_starts_with($path, 'uploads/products/')) {
    serve_product_upload($config, $path);
}

if (str_starts_with($path, 'uploads/projects/')) {
    serve_project_upload($config, $path);
}

if ($path === '' || $path === 'health') {
    send_json(['status' => 'ok', 'time' => gmdate('c')]);
}

// Public create order
if ($method === 'POST' && $path === 'orders') {
    create_order($pdo, $config);
}

// Public endpoints
if ($method === 'GET' && $path === 'projects') {
    list_projects($pdo, $config);
}

if ($method === 'GET' && preg_match('#^projects/([^/]+)$#', $path, $m)) {
    get_project($pdo, $config, $m[1]);
}

if ($method === 'GET' && $path === 'products') {
    list_products($pdo, $config);
}

if ($method === 'GET' && preg_match('#^products/([^/]+)$#', $path, $m)) {
    get_product($pdo, $config, $m[1]);
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

    $cacheTtl = cache_ttl($config);
    if (!$isAdmin && $cacheTtl > 0) {
        $cacheKey = cache_key('projects', [$status, $limit, $offset]);
        $cached = cache_get($config, $cacheKey);
        if ($cached) {
            send_json_cached($cached, 200, $cacheTtl);
        }
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

    $payload = ['data' => $data, 'meta' => ['limit' => $limit, 'offset' => $offset]];
    if (!$isAdmin && $cacheTtl > 0) {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            cache_put($config, $cacheKey ?? cache_key('projects', [$status, $limit, $offset]), $json);
            send_json_cached($json, 200, $cacheTtl);
        }
    }

    if (!$isAdmin) {
        set_public_cache_headers($cacheTtl);
    }
    send_json($payload);
}

function get_project(PDO $pdo, array $config, string $slug): void
{
    $isAdmin = isset($_SESSION['admin_id']);

    $cacheTtl = cache_ttl($config);
    if (!$isAdmin && $cacheTtl > 0) {
        $cacheKey = cache_key('project', [$slug]);
        $cached = cache_get($config, $cacheKey);
        if ($cached) {
            send_json_cached($cached, 200, $cacheTtl);
        }
    }

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
    if (!$isAdmin && $cacheTtl > 0) {
        $json = json_encode($project, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            cache_put($config, $cacheKey ?? cache_key('project', [$slug]), $json);
            send_json_cached($json, 200, $cacheTtl);
        }
    }

    if (!$isAdmin) {
        set_public_cache_headers($cacheTtl);
    }
    send_json($project);
}

function list_products(PDO $pdo, array $config): void
{
    $isAdmin = isset($_SESSION['admin_id']);
    $limit = max(1, min(100, (int) ($_GET['limit'] ?? 50)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));
    $status = $_GET['status'] ?? 'published';
    $category = trim((string) ($_GET['category'] ?? ''));
    $query = trim((string) ($_GET['q'] ?? ''));

    if (!$isAdmin && $status !== 'published') {
        $status = 'published';
    }

    $cacheTtl = cache_ttl($config);
    if (!$isAdmin && $cacheTtl > 0) {
        $cacheKey = cache_key('products', [$status, $category, $query, $limit, $offset]);
        $cached = cache_get($config, $cacheKey);
        if ($cached) {
            send_json_cached($cached, 200, $cacheTtl);
        }
    }

    $where = [];
    $params = [];

    if ($status !== 'all') {
        if ($status === 'published') {
            $where[] = '(status = :status OR status IS NULL OR status = \'\')';
            $params[':status'] = $status;
        } else {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }
    }
    if ($category !== '') {
        $where[] = 'category = :category';
        $params[':category'] = $category;
    }
    if ($query !== '') {
        $where[] = '(name LIKE :q OR short_description LIKE :q)';
        $params[':q'] = '%' . $query . '%';
    }

    if ($isAdmin) {
        $sql = 'SELECT * FROM products';
    } else {
        $sql = 'SELECT id, name, slug, category, product_type, short_description, image, document_path, status, sort_order, created_at, updated_at FROM products';
    }
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY sort_order ASC, id DESC LIMIT :limit OFFSET :offset';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    if ($isAdmin) {
        $data = array_map(function ($row) use ($pdo, $config) {
            $mediaStmt = $pdo->prepare('SELECT id, file_path, alt_text, sort_order FROM product_media WHERE product_id = :id ORDER BY sort_order ASC, id ASC');
            $mediaStmt->execute([':id' => $row['id']]);
            $media = $mediaStmt->fetchAll();
            return map_product_full($row, $config, $media);
        }, $rows);
    } else {
        $data = array_map(fn ($row) => map_product_brief($row, $config), $rows);
    }
    $payload = ['data' => $data, 'meta' => ['limit' => $limit, 'offset' => $offset]];

    if (!$isAdmin && $cacheTtl > 0) {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            cache_put($config, $cacheKey ?? cache_key('products', [$status, $category, $query, $limit, $offset]), $json);
            send_json_cached($json, 200, $cacheTtl);
        }
    }

    if (!$isAdmin) {
        set_public_cache_headers($cacheTtl);
    }
    send_json($payload);
}

function get_product(PDO $pdo, array $config, string $slug): void
{
    $isAdmin = isset($_SESSION['admin_id']);

    $cacheTtl = cache_ttl($config);
    if (!$isAdmin && $cacheTtl > 0) {
        $cacheKey = cache_key('product', [$slug]);
        $cached = cache_get($config, $cacheKey);
        if ($cached) {
            send_json_cached($cached, 200, $cacheTtl);
        }
    }

    $stmt = $pdo->prepare('SELECT * FROM products WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    $product = $stmt->fetch();

    if (!$product) {
        error_json(404, 'Product not found');
    }

    if (!$isAdmin) {
        $status = trim((string) ($product['status'] ?? ''));
        if ($status !== '' && $status !== 'published') {
            error_json(404, 'Product not published');
        }
    }

    $mediaStmt = $pdo->prepare('SELECT id, file_path, alt_text, sort_order FROM product_media WHERE product_id = :id ORDER BY sort_order ASC, id ASC');
    $mediaStmt->execute([':id' => $product['id']]);
    $media = $mediaStmt->fetchAll();

    $product = map_product_full($product, $config, $media);

    if (!$isAdmin && $cacheTtl > 0) {
        $json = json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            cache_put($config, $cacheKey ?? cache_key('product', [$slug]), $json);
            send_json_cached($json, 200, $cacheTtl);
        }
    }

    if (!$isAdmin) {
        set_public_cache_headers($cacheTtl);
    }
    send_json($product);
}

function admin_router(PDO $pdo, array $config, string $path, string $method): void
{
    $sub = trim(substr($path, strlen('admin')), '/');

    if ($sub === 'login' && $method === 'POST') {
        admin_login($pdo);
    }

    if ($sub === 'logout' && $method === 'POST') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
        send_json(['ok' => true]);
    }

    if (!isset($_SESSION['admin_id'])) {
        error_json(401, 'Unauthorized');
    }

    if ($sub === 'projects' && $method === 'GET') {
        list_projects($pdo, $config);
    }

    if ($sub === 'products' && $method === 'GET') {
        list_products($pdo, $config);
    }

    if ($sub === 'orders' && $method === 'GET') {
        list_orders($pdo);
    }

    if ($sub === 'manual-offers' && $method === 'POST') {
        create_manual_offer($pdo, (int) ($_SESSION['admin_id'] ?? 0));
    }

    if (preg_match('#^orders/(\d+)$#', $sub, $m) && $method === 'PUT') {
        update_order($pdo, (int) $m[1]);
    }

    if (preg_match('#^orders/(\d+)$#', $sub, $m) && $method === 'DELETE') {
        delete_order($pdo, (int) $m[1]);
    }

    if (preg_match('#^orders/(\d+)/notes$#', $sub, $m) && $method === 'POST') {
        create_order_note($pdo, (int) $m[1], (int) ($_SESSION['admin_id'] ?? 0));
    }

    if (preg_match('#^orders/(\d+)/notes$#', $sub, $m) && $method === 'GET') {
        list_order_notes($pdo, (int) $m[1]);
    }

    if (preg_match('#^orders/(\d+)/offers$#', $sub, $m) && $method === 'GET') {
        list_order_offers($pdo, (int) $m[1]);
    }

    if (preg_match('#^orders/(\d+)/offers$#', $sub, $m) && $method === 'POST') {
        create_order_offer($pdo, (int) $m[1], (int) ($_SESSION['admin_id'] ?? 0));
    }

    if (preg_match('#^offers/(\d+)$#', $sub, $m) && $method === 'PUT') {
        update_order_offer($pdo, (int) $m[1]);
    }

    if (preg_match('#^offers/(\d+)/print$#', $sub, $m) && $method === 'GET') {
        render_order_offer_print($pdo, (int) $m[1]);
    }

    if (preg_match('#^offers/(\d+)/pdf$#', $sub, $m) && $method === 'GET') {
        download_order_offer_pdf($pdo, (int) $m[1]);
    }

    if ($sub === 'projects' && $method === 'POST') {
        create_project($pdo, $config);
    }

    if ($sub === 'products' && $method === 'POST') {
        create_product($pdo, $config);
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

    if (preg_match('#^products/(\d+)$#', $sub, $m)) {
        $productId = (int) $m[1];
        if ($method === 'PUT') {
            update_product($pdo, $config, $productId);
        } elseif ($method === 'DELETE') {
            delete_product($pdo, $productId);
        } elseif ($method === 'GET') {
            get_product_by_id($pdo, $config, $productId);
        }
    }

    if (preg_match('#^projects/(\d+)/hero$#', $sub, $m) && $method === 'POST') {
        upload_hero($pdo, $config, (int) $m[1]);
    }

    if (preg_match('#^projects/(\d+)/media$#', $sub, $m) && $method === 'POST') {
        upload_media($pdo, $config, (int) $m[1]);
    }

    if (preg_match('#^projects/(\d+)/media/(\d+)$#', $sub, $m) && $method === 'DELETE') {
        delete_media($pdo, $config, (int) $m[1], (int) $m[2]);
    }

    if (preg_match('#^products/(\d+)/image$#', $sub, $m) && $method === 'POST') {
        upload_product_image($pdo, $config, (int) $m[1]);
    }

    if (preg_match('#^products/(\d+)/media$#', $sub, $m) && $method === 'POST') {
        upload_product_media($pdo, $config, (int) $m[1]);
    }

    if (preg_match('#^products/(\d+)/media/(\d+)$#', $sub, $m) && $method === 'DELETE') {
        delete_product_media($pdo, $config, (int) $m[1], (int) $m[2]);
    }

    if (preg_match('#^products/(\d+)/document$#', $sub, $m) && $method === 'POST') {
        upload_product_document($pdo, $config, (int) $m[1]);
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

    session_regenerate_id(true);
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

    $mediaStmt = $pdo->prepare('SELECT id, file_path, alt_text, sort_order FROM project_media WHERE project_id = :id ORDER BY sort_order ASC, id ASC');
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
        $relative = store_upload(
            $config,
            $_FILES['file'] ?? [],
            $projectId,
            ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        );
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
        $relative = store_upload(
            $config,
            $_FILES['file'] ?? [],
            $projectId,
            ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        );
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

    $id = (int) $pdo->lastInsertId();

    send_json([
        'id' => $id,
        'file' => build_file_url($config, $relative),
        'file_path' => $relative,
    ]);
}

function delete_media(PDO $pdo, array $config, int $projectId, int $mediaId): void
{
    $stmt = $pdo->prepare('SELECT id, project_id, file_path FROM project_media WHERE id = :id AND project_id = :project_id LIMIT 1');
    $stmt->execute([':id' => $mediaId, ':project_id' => $projectId]);
    $media = $stmt->fetch();

    if (!$media) {
        error_json(404, 'Media not found');
    }

    $stmt = $pdo->prepare('DELETE FROM project_media WHERE id = :id');
    $stmt->execute([':id' => $mediaId]);

    $fullPath = rtrim($config['uploads']['dir'], '/\\') . '/' . ltrim($media['file_path'], '/\\');
    if (is_file($fullPath)) {
        @unlink($fullPath);
    }

    send_json(['ok' => true]);
}

function create_product(PDO $pdo, array $config): void
{
    $data = read_json_body();
    $name = trim($data['name'] ?? '');
    $slug = trim($data['slug'] ?? '') ?: slugify($name);
    $category = trim($data['category'] ?? '');
    $productType = trim($data['product_type'] ?? '') ?: null;
    $shortDescription = trim($data['short_description'] ?? '');
    $description = trim($data['description'] ?? '');
    $applications = trim($data['applications'] ?? '');
    $image = trim($data['image'] ?? '') ?: null;
    $documentPath = trim($data['document_path'] ?? '') ?: null;
    $status = $data['status'] ?? 'draft';
    $sortOrder = (int) ($data['sort_order'] ?? 0);
    $specs = $data['specs'] ?? null;

    if ($name === '' || $category === '') {
        error_json(400, 'Name and category are required');
    }

    if ($specs !== null && !is_array($specs)) {
        $specs = null;
    }

    $stmt = $pdo->prepare('INSERT INTO products (name, slug, category, product_type, short_description, description, applications, specs, image, document_path, status, sort_order) VALUES (:name, :slug, :category, :product_type, :short_description, :description, :applications, :specs, :image, :document_path, :status, :sort_order)');
    try {
        $stmt->execute([
            ':name' => $name,
            ':slug' => $slug,
            ':category' => $category,
            ':product_type' => $productType,
            ':short_description' => $shortDescription,
            ':description' => $description,
            ':applications' => $applications,
            ':specs' => $specs ? json_encode($specs, JSON_UNESCAPED_UNICODE) : null,
            ':image' => $image,
            ':document_path' => $documentPath,
            ':status' => $status,
            ':sort_order' => $sortOrder,
        ]);
    } catch (PDOException $e) {
        error_json(400, 'Failed to create product (slug likely not unique)');
    }

    $id = (int) $pdo->lastInsertId();
    get_product_by_id($pdo, $config, $id, 201);
}

function update_product(PDO $pdo, array $config, int $id): void
{
    $data = read_json_body();
    $fields = [];
    $params = [':id' => $id];

    foreach (['name', 'slug', 'category', 'product_type', 'short_description', 'description', 'applications', 'image', 'document_path', 'status', 'sort_order'] as $field) {
        if (array_key_exists($field, $data)) {
            $fields[] = "{$field} = :{$field}";
            $params[":{$field}"] = $data[$field] !== '' ? $data[$field] : null;
        }
    }

    if (array_key_exists('specs', $data)) {
        $fields[] = "specs = :specs";
        $specs = is_array($data['specs']) ? $data['specs'] : null;
        $params[':specs'] = $specs ? json_encode($specs, JSON_UNESCAPED_UNICODE) : null;
    }

    if (!$fields) {
        error_json(400, 'No fields to update');
    }

    $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute($params);
    } catch (PDOException $e) {
        error_json(400, 'Failed to update product (slug maybe not unique)');
    }

    get_product_by_id($pdo, $config, $id);
}

function delete_product(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
    $stmt->execute([':id' => $id]);
    send_json(['ok' => true]);
}

function upload_product_image(PDO $pdo, array $config, int $productId): void
{
    $product = fetch_product($pdo, $productId);
    if (!$product) {
        error_json(404, 'Product not found');
    }

    try {
        $relative = store_product_upload(
            $config,
            $_FILES['file'] ?? [],
            $productId,
            ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        );
    } catch (RuntimeException $e) {
        error_json(400, $e->getMessage());
    }

    $stmt = $pdo->prepare('UPDATE products SET image = :image WHERE id = :id');
    $stmt->execute([':image' => $relative, ':id' => $productId]);

    send_json(['image' => build_product_file_url($config, $relative)]);
}

function upload_product_media(PDO $pdo, array $config, int $productId): void
{
    $product = fetch_product($pdo, $productId);
    if (!$product) {
        error_json(404, 'Product not found');
    }

    try {
        $relative = store_product_upload(
            $config,
            $_FILES['file'] ?? [],
            $productId,
            ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        );
    } catch (RuntimeException $e) {
        error_json(400, $e->getMessage());
    }

    $stmt = $pdo->prepare('INSERT INTO product_media (product_id, file_path, alt_text, sort_order) VALUES (:product_id, :file_path, :alt_text, :sort_order)');
    $stmt->execute([
        ':product_id' => $productId,
        ':file_path' => $relative,
        ':alt_text' => $_POST['alt'] ?? null,
        ':sort_order' => (int) ($_POST['sort'] ?? 0),
    ]);

    $id = (int) $pdo->lastInsertId();

    send_json([
        'id' => $id,
        'file' => build_product_file_url($config, $relative),
        'file_path' => $relative,
    ]);
}

function delete_product_media(PDO $pdo, array $config, int $productId, int $mediaId): void
{
    $stmt = $pdo->prepare('SELECT id, product_id, file_path FROM product_media WHERE id = :id AND product_id = :product_id LIMIT 1');
    $stmt->execute([':id' => $mediaId, ':product_id' => $productId]);
    $media = $stmt->fetch();

    if (!$media) {
        error_json(404, 'Media not found');
    }

    $stmt = $pdo->prepare('DELETE FROM product_media WHERE id = :id');
    $stmt->execute([':id' => $mediaId]);

    $fullPath = rtrim($config['uploads_products']['dir'], '/\\') . '/' . ltrim($media['file_path'], '/\\');
    if (is_file($fullPath)) {
        @unlink($fullPath);
    }

    send_json(['ok' => true]);
}

function upload_product_document(PDO $pdo, array $config, int $productId): void
{
    $product = fetch_product($pdo, $productId);
    if (!$product) {
        error_json(404, 'Product not found');
    }

    $mimeMap = [
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.ms-excel' => 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
    ];

    try {
        $relative = store_product_upload(
            $config,
            $_FILES['file'] ?? [],
            $productId,
            array_keys($mimeMap),
            $mimeMap
        );
    } catch (RuntimeException $e) {
        error_json(400, $e->getMessage());
    }

    $stmt = $pdo->prepare('UPDATE products SET document_path = :doc WHERE id = :id');
    $stmt->execute([':doc' => $relative, ':id' => $productId]);

    send_json(['document' => build_product_file_url($config, $relative)]);
}

function get_product_by_id(PDO $pdo, array $config, int $id, int $status = 200): void
{
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();

    if (!$product) {
        error_json(404, 'Product not found');
    }

    $mediaStmt = $pdo->prepare('SELECT id, file_path, alt_text, sort_order FROM product_media WHERE product_id = :id ORDER BY sort_order ASC, id ASC');
    $mediaStmt->execute([':id' => $product['id']]);
    $media = $mediaStmt->fetchAll();

    $product = map_product_full($product, $config, $media);
    send_json($product, $status);
}

function create_order(PDO $pdo, array $config): void
{
    $data = read_json_body();
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $concreteType = trim($data['concrete_type'] ?? '');
    $message = trim($data['message'] ?? '');
    $serviceType = trim($data['service_type'] ?? '');
    $quantity = trim((string) ($data['quantity'] ?? ''));
    $quantityUnit = trim((string) ($data['quantity_unit'] ?? ''));
    $citySlug = trim((string) ($data['city_slug'] ?? ''));
    $sourcePage = trim((string) ($data['source_page'] ?? ''));
    $utmSource = trim((string) ($data['utm_source'] ?? ''));
    $utmMedium = trim((string) ($data['utm_medium'] ?? ''));
    $utmCampaign = trim((string) ($data['utm_campaign'] ?? ''));

    if ($name === '' || $email === '' || $message === '') {
        error_json(400, 'Name, email and message are required');
    }

    if (!in_array($serviceType, ['', 'beton', 'behaton', 'other'], true)) {
        $serviceType = 'other';
    }

    $stmt = $pdo->prepare(
        'INSERT INTO orders (
            name, email, phone, subject, concrete_type, message, status,
            service_type, quantity, quantity_unit, city_slug, pipeline_stage, source_page,
            utm_source, utm_medium, utm_campaign
        ) VALUES (
            :name, :email, :phone, :subject, :concrete_type, :message, :status,
            :service_type, :quantity, :quantity_unit, :city_slug, :pipeline_stage, :source_page,
            :utm_source, :utm_medium, :utm_campaign
        )'
    );
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':subject' => $subject,
        ':concrete_type' => $concreteType,
        ':message' => $message,
        ':status' => 'new',
        ':service_type' => $serviceType ?: null,
        ':quantity' => $quantity !== '' ? $quantity : null,
        ':quantity_unit' => $quantityUnit !== '' ? $quantityUnit : null,
        ':city_slug' => $citySlug !== '' ? $citySlug : null,
        ':pipeline_stage' => 'new',
        ':source_page' => $sourcePage !== '' ? $sourcePage : null,
        ':utm_source' => $utmSource !== '' ? $utmSource : null,
        ':utm_medium' => $utmMedium !== '' ? $utmMedium : null,
        ':utm_campaign' => $utmCampaign !== '' ? $utmCampaign : null,
    ]);

    $id = (int) $pdo->lastInsertId();

    $sent = notify_order_via_email($config, [
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'subject' => $subject,
        'concrete_type' => $concreteType,
        'message' => $message,
        'service_type' => $serviceType,
        'quantity' => $quantity,
        'quantity_unit' => $quantityUnit,
        'city_slug' => $citySlug,
        'source_page' => $sourcePage,
        'utm_source' => $utmSource,
        'utm_medium' => $utmMedium,
        'utm_campaign' => $utmCampaign,
    ]);
    if (!$sent && ($config['debug'] ?? false)) {
        error_log('Order email notification failed for order id ' . $id);
    }

    send_json(['ok' => true, 'id' => $id], 201);
}

function list_orders(PDO $pdo): void
{
    $status = $_GET['status'] ?? 'all';
    $pipelineStage = trim((string) ($_GET['pipeline_stage'] ?? 'all'));
    $serviceType = trim((string) ($_GET['service_type'] ?? 'all'));
    $citySlug = trim((string) ($_GET['city_slug'] ?? ''));
    $from = trim((string) ($_GET['from'] ?? ''));
    $to = trim((string) ($_GET['to'] ?? ''));
    $query = trim((string) ($_GET['q'] ?? ''));
    $limit = max(1, min(500, (int) ($_GET['limit'] ?? 200)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));

    $where = [];
    $params = [];

    if ($status !== 'all') {
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }
    if ($pipelineStage !== '' && $pipelineStage !== 'all') {
        $where[] = 'pipeline_stage = :pipeline_stage';
        $params[':pipeline_stage'] = $pipelineStage;
    }
    if ($serviceType !== '' && $serviceType !== 'all') {
        $where[] = 'service_type = :service_type';
        $params[':service_type'] = $serviceType;
    }
    if ($citySlug !== '') {
        $where[] = 'city_slug = :city_slug';
        $params[':city_slug'] = $citySlug;
    }
    if ($from !== '') {
        $where[] = 'created_at >= :from_date';
        $params[':from_date'] = $from . ' 00:00:00';
    }
    if ($to !== '') {
        $where[] = 'created_at <= :to_date';
        $params[':to_date'] = $to . ' 23:59:59';
    }
    if ($query !== '') {
        $where[] = '(name LIKE :q OR email LIKE :q OR phone LIKE :q OR subject LIKE :q OR message LIKE :q)';
        $params[':q'] = '%' . $query . '%';
    }

    $sqlWhere = $where ? implode(' AND ', $where) : '1=1';
    $stmt = $pdo->prepare(
        "SELECT
            id, name, email, phone, subject, concrete_type, message, status, created_at,
            service_type, quantity, quantity_unit, city_slug, pipeline_stage, lead_score,
            next_follow_up_at, lost_reason, source_page, utm_source, utm_medium, utm_campaign
         FROM orders
         WHERE {$sqlWhere}
         ORDER BY created_at DESC
         LIMIT :limit OFFSET :offset"
    );
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    send_json(['data' => array_map('map_order', $rows)]);
}

function update_order(PDO $pdo, int $id): void
{
    $data = read_json_body();
    $fields = [];
    $params = [':id' => $id];

    if (array_key_exists('status', $data)) {
        $status = (string) $data['status'];
        if (!in_array($status, ['new', 'in_progress', 'done'], true)) {
            error_json(400, 'Invalid status');
        }
        $fields[] = 'status = :status';
        $params[':status'] = $status;
    }

    if (array_key_exists('pipeline_stage', $data)) {
        $pipelineStage = (string) $data['pipeline_stage'];
        if (!in_array($pipelineStage, ['new', 'qualified', 'offered', 'negotiation', 'won', 'lost'], true)) {
            error_json(400, 'Invalid pipeline stage');
        }
        $fields[] = 'pipeline_stage = :pipeline_stage';
        $params[':pipeline_stage'] = $pipelineStage;
    }

    if (array_key_exists('next_follow_up_at', $data)) {
        $nextFollowUpAt = trim((string) ($data['next_follow_up_at'] ?? ''));
        $fields[] = 'next_follow_up_at = :next_follow_up_at';
        $params[':next_follow_up_at'] = $nextFollowUpAt !== '' ? $nextFollowUpAt : null;
    }

    if (array_key_exists('lost_reason', $data)) {
        $lostReason = trim((string) ($data['lost_reason'] ?? ''));
        $fields[] = 'lost_reason = :lost_reason';
        $params[':lost_reason'] = $lostReason !== '' ? $lostReason : null;
    }

    if (!$fields) {
        error_json(400, 'No fields to update');
    }

    $sql = 'UPDATE orders SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $stmt = $pdo->prepare(
        'SELECT
            id, name, email, phone, subject, concrete_type, message, status, created_at,
            service_type, quantity, quantity_unit, city_slug, pipeline_stage, lead_score,
            next_follow_up_at, lost_reason, source_page, utm_source, utm_medium, utm_campaign
         FROM orders WHERE id = :id'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) {
        error_json(404, 'Order not found');
    }
    send_json(map_order($row));
}

function create_order_note(PDO $pdo, int $orderId, int $adminId): void
{
    $stmt = $pdo->prepare('SELECT id FROM orders WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $orderId]);
    if (!$stmt->fetch()) {
        error_json(404, 'Order not found');
    }

    $data = read_json_body();
    $note = trim((string) ($data['note'] ?? ''));
    if ($note === '') {
        error_json(400, 'Note is required');
    }

    $stmt = $pdo->prepare(
        'INSERT INTO order_notes (order_id, note, created_by) VALUES (:order_id, :note, :created_by)'
    );
    $stmt->execute([
        ':order_id' => $orderId,
        ':note' => $note,
        ':created_by' => $adminId > 0 ? $adminId : null,
    ]);

    send_json([
        'id' => (int) $pdo->lastInsertId(),
        'order_id' => $orderId,
        'note' => $note,
        'created_by' => $adminId > 0 ? $adminId : null,
        'created_at' => gmdate('Y-m-d H:i:s'),
    ], 201);
}

function list_order_notes(PDO $pdo, int $orderId): void
{
    $stmt = $pdo->prepare('SELECT id FROM orders WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $orderId]);
    if (!$stmt->fetch()) {
        error_json(404, 'Order not found');
    }

    $stmt = $pdo->prepare(
        'SELECT id, order_id, note, created_by, created_at
         FROM order_notes
         WHERE order_id = :order_id
         ORDER BY created_at DESC, id DESC'
    );
    $stmt->execute([':order_id' => $orderId]);
    $rows = $stmt->fetchAll();
    send_json(['data' => $rows]);
}

function list_order_offers(PDO $pdo, int $orderId): void
{
    ensure_order_exists($pdo, $orderId);

    $stmt = $pdo->prepare(
        'SELECT *
         FROM order_offers
         WHERE order_id = :order_id
         ORDER BY created_at DESC, id DESC'
    );
    $stmt->execute([':order_id' => $orderId]);
    $rows = $stmt->fetchAll();
    send_json(['data' => array_map('map_order_offer', $rows)]);
}

function create_order_offer(PDO $pdo, int $orderId, int $adminId): void
{
    ensure_order_exists($pdo, $orderId);

    $data = read_json_body();
    $offer = insert_order_offer($pdo, $orderId, $adminId, $data);
    send_json($offer, 201);
}

function create_manual_offer(PDO $pdo, int $adminId): void
{
    $data = read_json_body();
    $customer = is_array($data['customer'] ?? null) ? $data['customer'] : [];
    $order = is_array($data['order'] ?? null) ? $data['order'] : [];
    $offerData = is_array($data['offer'] ?? null) ? $data['offer'] : [];

    $name = trim((string) ($customer['name'] ?? ''));
    $email = trim((string) ($customer['email'] ?? 'ponuda@prevozkop.rs')) ?: 'ponuda@prevozkop.rs';
    $phone = trim((string) ($customer['phone'] ?? ''));
    $subject = trim((string) ($order['subject'] ?? 'Rucna komercijalna ponuda')) ?: 'Rucna komercijalna ponuda';
    $serviceType = trim((string) ($order['service_type'] ?? 'other'));
    $citySlug = trim((string) ($order['city_slug'] ?? ''));
    $message = trim((string) ($order['message'] ?? 'Ponuda kreirana rucno u admin panelu.')) ?: 'Ponuda kreirana rucno u admin panelu.';

    if ($name === '') {
        error_json(400, 'Customer name is required');
    }
    if (!in_array($serviceType, ['beton', 'behaton', 'other'], true)) {
        $serviceType = 'other';
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO orders (
                name, email, phone, subject, message, status, service_type, city_slug,
                pipeline_stage, source_page
            ) VALUES (
                :name, :email, :phone, :subject, :message, :status, :service_type, :city_slug,
                :pipeline_stage, :source_page
            )'
        );
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone !== '' ? $phone : null,
            ':subject' => $subject,
            ':message' => $message,
            ':status' => 'in_progress',
            ':service_type' => $serviceType,
            ':city_slug' => $citySlug !== '' ? $citySlug : null,
            ':pipeline_stage' => 'offered',
            ':source_page' => 'admin-manual-offer',
        ]);
        $orderId = (int) $pdo->lastInsertId();
        $offer = insert_order_offer($pdo, $orderId, $adminId, $offerData);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    $stmt = $pdo->prepare(
        'SELECT
            id, name, email, phone, subject, concrete_type, message, status, created_at,
            service_type, quantity, quantity_unit, city_slug, pipeline_stage, lead_score,
            next_follow_up_at, lost_reason, source_page, utm_source, utm_medium, utm_campaign
         FROM orders WHERE id = :id'
    );
    $stmt->execute([':id' => $orderId]);
    send_json(['order' => map_order($stmt->fetch()), 'offer' => $offer], 201);
}

function insert_order_offer(PDO $pdo, int $orderId, int $adminId, array $data): array
{
    $items = normalize_offer_items($data['items'] ?? []);
    if (!$items) {
        error_json(400, 'At least one offer item is required');
    }

    $taxRate = max(0, min(100, (float) ($data['tax_rate'] ?? 0)));
    $subtotal = calculate_offer_subtotal($items);
    $taxAmount = round($subtotal * ($taxRate / 100), 2);
    $total = round($subtotal + $taxAmount, 2);
    $offerNumber = generate_offer_number($pdo);

    $stmt = $pdo->prepare(
        'INSERT INTO order_offers (
            order_id, offer_number, status, items, subtotal, tax_rate, tax_amount, total,
            currency, valid_until, payment_terms, delivery_terms, note, created_by
         ) VALUES (
            :order_id, :offer_number, :status, :items, :subtotal, :tax_rate, :tax_amount, :total,
            :currency, :valid_until, :payment_terms, :delivery_terms, :note, :created_by
         )'
    );
    $stmt->execute([
        ':order_id' => $orderId,
        ':offer_number' => $offerNumber,
        ':status' => 'draft',
        ':items' => json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':subtotal' => $subtotal,
        ':tax_rate' => $taxRate,
        ':tax_amount' => $taxAmount,
        ':total' => $total,
        ':currency' => trim((string) ($data['currency'] ?? 'RSD')) ?: 'RSD',
        ':valid_until' => normalize_date_or_null($data['valid_until'] ?? null),
        ':payment_terms' => trim((string) ($data['payment_terms'] ?? '')) ?: null,
        ':delivery_terms' => trim((string) ($data['delivery_terms'] ?? '')) ?: null,
        ':note' => trim((string) ($data['note'] ?? '')) ?: null,
        ':created_by' => $adminId > 0 ? $adminId : null,
    ]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM order_offers WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    return map_order_offer($stmt->fetch());
}

function update_order_offer(PDO $pdo, int $offerId): void
{
    $data = read_json_body();
    $fields = [];
    $params = [':id' => $offerId];

    if (array_key_exists('status', $data)) {
        $status = (string) $data['status'];
        if (!in_array($status, ['draft', 'sent', 'accepted', 'paid', 'rejected'], true)) {
            error_json(400, 'Invalid offer status');
        }
        $fields[] = 'status = :status';
        $params[':status'] = $status;
    }

    if (!$fields) {
        error_json(400, 'No fields to update');
    }

    $stmt = $pdo->prepare('UPDATE order_offers SET ' . implode(', ', $fields) . ' WHERE id = :id');
    $stmt->execute($params);

    $stmt = $pdo->prepare('SELECT * FROM order_offers WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $offerId]);
    $row = $stmt->fetch();
    if (!$row) {
        error_json(404, 'Offer not found');
    }
    send_json(map_order_offer($row));
}

function render_order_offer_print(PDO $pdo, int $offerId): void
{
    $row = fetch_order_offer_with_order($pdo, $offerId);
    $offer = map_order_offer($row);
    $itemsHtml = '';
    foreach ($offer['items'] as $index => $item) {
        $itemsHtml .= '<tr>'
            . '<td>' . ($index + 1) . '</td>'
            . '<td>' . html_escape((string) ($item['description'] ?? '')) . '</td>'
            . '<td class="num">' . offer_number((float) ($item['quantity'] ?? 0)) . '</td>'
            . '<td>' . html_escape((string) ($item['unit'] ?? '')) . '</td>'
            . '<td class="num">' . offer_money((float) ($item['unit_price'] ?? 0)) . '</td>'
            . '<td class="num">' . offer_money((float) ($item['line_total'] ?? 0)) . '</td>'
            . '</tr>';
    }

    $validUntil = !empty($offer['valid_until']) ? html_escape((string) $offer['valid_until']) : 'Po dogovoru';
    $paymentTerms = html_escape((string) ($offer['payment_terms'] ?? 'Po dogovoru'));
    $deliveryTerms = html_escape((string) ($offer['delivery_terms'] ?? 'Po dogovoru'));
    $note = trim((string) ($offer['note'] ?? ''));
    $noteHtml = $note !== ''
        ? '<div class="note"><strong>Napomena:</strong><br>' . nl2br(html_escape($note)) . '</div>'
        : '';
    $companyLegal = 'Dragoslav Marjanovic PR PREVOZ KOP-BETONSKA BAZA<br>Lipa 014/A, 18000, Donja Vrezina, Srbija<br>PIB 112152599 | MB 65910756';
    $logoDataUri = offer_logo_data_uri();
    $logoHtml = $logoDataUri !== ''
        ? '<img class="logo" src="' . $logoDataUri . '" alt="Prevoz Kop logo">'
        : '<div class="brand">Prevoz Kop</div>';

    $html = '<!doctype html><html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>Ponuda ' . html_escape((string) $offer['offer_number']) . '</title>'
        . '<style>'
        . '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#111827;font-family:Arial,sans-serif}.sheet{max-width:210mm;margin:0 auto;background:#fff;padding:18mm 16mm;border:1px solid #e5e7eb}.header{display:flex;justify-content:space-between;gap:24px;border-bottom:4px solid #f4a100;padding-bottom:18px}.logo{width:118px;height:auto;display:block}.brand{font-size:28px;font-weight:700}.legal{margin-top:10px;font-size:12px;line-height:1.45;color:#374151}.meta{text-align:right;font-size:13px;line-height:1.6}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}.panel{border:1px solid #e5e7eb;border-radius:10px;padding:14px}.panel h2{margin:0 0 10px;font-size:14px;text-transform:uppercase;color:#6b7280}.panel p{margin:4px 0;font-size:14px}.title{margin:26px 0 12px;font-size:24px;font-weight:700}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}th,td{padding:10px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}th{background:#111827;color:#fff;text-align:left}.num{text-align:right;white-space:nowrap}.totals{margin-left:auto;margin-top:16px;width:320px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.totals div{display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #e5e7eb}.totals div:last-child{border-bottom:0;background:#fff7ed;font-size:18px;font-weight:700}.terms{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}.note{margin-top:18px;border-left:4px solid #f4a100;background:#fffbeb;padding:12px 14px;font-size:14px;line-height:1.5}.footer{margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;display:flex;justify-content:space-between;gap:16px}.actions{max-width:210mm;margin:14px auto;display:flex;justify-content:flex-end}.actions button{border:0;border-radius:999px;background:#f4a100;color:#111827;font-weight:700;padding:12px 18px;cursor:pointer}@media print{body{background:#fff}.sheet{border:0;padding:0}.actions{display:none}}@media(max-width:760px){.sheet{padding:24px}.header,.footer{display:block}.meta{text-align:left;margin-top:12px}.grid,.terms{grid-template-columns:1fr}.totals{width:100%}}'
        . '</style></head><body>'
        . '<div class="actions"><button onclick="window.print()">Sacuvaj kao PDF / stampaj</button></div>'
        . '<main class="sheet">'
        . '<section class="header"><div>' . $logoHtml . '<div class="legal">' . $companyLegal . '</div></div>'
        . '<div class="meta"><strong>Ponuda ' . html_escape((string) $offer['offer_number']) . '</strong><br>'
        . 'Datum: ' . html_escape(substr((string) $offer['created_at'], 0, 10)) . '<br>'
        . 'Vazi do: ' . $validUntil . '<br>'
        . 'Status: ' . html_escape((string) $offer['status']) . '</div></section>'
        . '<div class="grid"><section class="panel"><h2>Kupac</h2>'
        . '<p><strong>' . html_escape((string) ($row['customer_name'] ?? '')) . '</strong></p>'
        . '<p>' . html_escape((string) ($row['customer_email'] ?? '')) . '</p>'
        . '<p>' . html_escape((string) ($row['customer_phone'] ?? '')) . '</p></section>'
        . '<section class="panel"><h2>Osnov ponude</h2>'
        . '<p>' . html_escape((string) ($row['order_subject'] ?? 'Ponuda')) . '</p>'
        . '<p>Usluga: ' . html_escape((string) ($row['order_service'] ?? '')) . '</p>'
        . '<p>Grad: ' . html_escape((string) ($row['order_city'] ?? '')) . '</p></section></div>'
        . '<div class="title">Komercijalna ponuda</div>'
        . '<table><thead><tr><th>#</th><th>Opis</th><th class="num">Kolicina</th><th>JM</th><th class="num">Cena</th><th class="num">Iznos</th></tr></thead><tbody>' . $itemsHtml . '</tbody></table>'
        . '<div class="totals">'
        . '<div><span>Osnovica</span><strong>' . offer_money((float) $offer['subtotal']) . ' ' . html_escape((string) $offer['currency']) . '</strong></div>'
        . '<div><span>PDV ' . offer_number((float) $offer['tax_rate']) . '%</span><strong>' . offer_money((float) $offer['tax_amount']) . ' ' . html_escape((string) $offer['currency']) . '</strong></div>'
        . '<div><span>Ukupno</span><strong>' . offer_money((float) $offer['total']) . ' ' . html_escape((string) $offer['currency']) . '</strong></div>'
        . '</div>'
        . '<div class="terms"><section class="panel"><h2>Placanje</h2><p>' . $paymentTerms . '</p></section>'
        . '<section class="panel"><h2>Isporuka</h2><p>' . $deliveryTerms . '</p></section></div>'
        . $noteHtml
        . '<footer class="footer"><span>' . $companyLegal . '</span><span>prevozkopbb@gmail.com | +381 60 588 7471</span></footer>'
        . '</main></body></html>';

    send_html($html);
}

function download_order_offer_pdf(PDO $pdo, int $offerId): void
{
    $row = fetch_order_offer_with_order($pdo, $offerId);
    $offer = map_order_offer($row);
    $pdf = build_order_offer_pdf($row, $offer);
    $fileName = preg_replace('/[^A-Za-z0-9._-]+/', '-', (string) $offer['offer_number']) ?: 'ponuda';

    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $fileName . '.pdf"');
    header('Content-Length: ' . strlen($pdf));
    header('Cache-Control: private, no-store, max-age=0');
    echo $pdf;
    exit;
}

function delete_order(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM orders WHERE id = :id');
    $stmt->execute([':id' => $id]);
    send_json(['ok' => true]);
}

// --- Utilities ---

function serve_product_upload(array $config, string $path): void
{
    $relative = ltrim(substr($path, strlen('uploads/products/')), '/');
    send_upload_file($config['uploads_products']['dir'] ?? '', $relative);
}

function serve_project_upload(array $config, string $path): void
{
    $relative = ltrim(substr($path, strlen('uploads/projects/')), '/');
    send_upload_file($config['uploads']['dir'] ?? '', $relative);
}

function send_upload_file(string $baseDir, string $relative): void
{
    if ($relative === '' || str_contains($relative, '..')) {
        http_response_code(404);
        exit;
    }

    $base = rtrim($baseDir, '/\\');
    $full = $base . '/' . $relative;
    $realBase = realpath($base);
    $realFile = realpath($full);
    if (!$realBase || !$realFile || !str_starts_with($realFile, $realBase) || !is_file($realFile)) {
        http_response_code(404);
        exit;
    }

    $mtime = filemtime($realFile) ?: time();
    $etag = '"' . sha1($realFile . '|' . $mtime . '|' . filesize($realFile)) . '"';
    $ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
    $ifModifiedSince = $_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '';

    header('ETag: ' . $etag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
    header('Cache-Control: public, max-age=31536000, immutable');

    if ($ifNoneMatch === $etag || ($ifModifiedSince && strtotime($ifModifiedSince) === $mtime)) {
        http_response_code(304);
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($realFile) ?: 'application/octet-stream';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($realFile));
    readfile($realFile);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function ensure_order_exists(PDO $pdo, int $orderId): void
{
    $stmt = $pdo->prepare('SELECT id FROM orders WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $orderId]);
    if (!$stmt->fetch()) {
        error_json(404, 'Order not found');
    }
}

function fetch_order_offer_with_order(PDO $pdo, int $offerId): array
{
    $stmt = $pdo->prepare(
        'SELECT
            offers.*,
            orders.name AS customer_name,
            orders.email AS customer_email,
            orders.phone AS customer_phone,
            orders.subject AS order_subject,
            orders.city_slug AS order_city,
            orders.service_type AS order_service
         FROM order_offers offers
         INNER JOIN orders ON orders.id = offers.order_id
         WHERE offers.id = :id
         LIMIT 1'
    );
    $stmt->execute([':id' => $offerId]);
    $row = $stmt->fetch();
    if (!$row) {
        error_json(404, 'Offer not found');
    }

    return $row;
}

function normalize_offer_items(mixed $items): array
{
    if (!is_array($items)) {
        return [];
    }

    $normalized = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $description = trim((string) ($item['description'] ?? ''));
        if ($description === '') {
            continue;
        }
        $quantity = max(0, (float) ($item['quantity'] ?? 0));
        $unitPrice = max(0, (float) ($item['unit_price'] ?? 0));
        $lineTotal = round($quantity * $unitPrice, 2);
        $normalized[] = [
            'description' => $description,
            'quantity' => $quantity,
            'unit' => trim((string) ($item['unit'] ?? '')) ?: 'kom',
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal,
        ];
    }

    return $normalized;
}

function calculate_offer_subtotal(array $items): float
{
    $subtotal = 0.0;
    foreach ($items as $item) {
        $subtotal += (float) ($item['line_total'] ?? 0);
    }
    return round($subtotal, 2);
}

function normalize_date_or_null(mixed $value): ?string
{
    $date = trim((string) ($value ?? ''));
    if ($date === '') {
        return null;
    }
    $parsed = date_create($date);
    return $parsed ? $parsed->format('Y-m-d') : null;
}

function generate_offer_number(PDO $pdo): string
{
    $prefix = 'PK-' . gmdate('Ymd') . '-';
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM order_offers WHERE offer_number LIKE :prefix');
    $stmt->execute([':prefix' => $prefix . '%']);
    $next = ((int) $stmt->fetchColumn()) + 1;
    return $prefix . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
}

function html_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function offer_number(float $value): string
{
    return number_format($value, abs($value - round($value)) < 0.001 ? 0 : 2, ',', '.');
}

function offer_money(float $value): string
{
    return number_format($value, 2, ',', '.');
}

function offer_logo_path(): string
{
    return __DIR__ . '/assets/prevozkop-logo.jpg';
}

function offer_logo_data_uri(): string
{
    $path = offer_logo_path();
    if (!is_file($path)) {
        return '';
    }
    $data = file_get_contents($path);
    return $data === false ? '' : 'data:image/jpeg;base64,' . base64_encode($data);
}

function build_order_offer_pdf(array $row, array $offer): string
{
    $ops = [];
    $images = [];
    $logoPath = offer_logo_path();
    if (is_file($logoPath)) {
        $images['Im1'] = $logoPath;
    }
    $ops[] = pdf_fill_rect(0, 0, 595, 842, [0.98, 0.99, 1]);
    $ops[] = pdf_fill_rect(36, 714, 523, 92, [1, 1, 1]);
    if (isset($images['Im1'])) {
        $ops[] = pdf_image('Im1', 50, 728, 96, 96);
    } else {
        $ops[] = pdf_text(52, 775, 22, 'Prevoz Kop', [0.07, 0.1, 0.16], true);
    }
    $ops[] = pdf_text(164, 786, 9, 'Dragoslav Marjanovic PR PREVOZ KOP-BETONSKA BAZA', [0.07, 0.1, 0.16], true);
    $ops[] = pdf_text(164, 770, 9, 'Lipa 014/A, 18000, Donja Vrezina, Srbija', [0.16, 0.2, 0.28], false);
    $ops[] = pdf_text(164, 754, 9, 'PIB 112152599 | MB 65910756', [0.16, 0.2, 0.28], false);
    $ops[] = pdf_fill_rect(36, 706, 523, 8, [0.96, 0.63, 0.0]);
    $ops[] = pdf_text(396, 786, 10, 'Ponuda ' . (string) $offer['offer_number'], [0.07, 0.1, 0.16], true);
    $ops[] = pdf_text(396, 770, 9, 'Datum: ' . substr((string) $offer['created_at'], 0, 10), [0.16, 0.2, 0.28], false);
    $ops[] = pdf_text(396, 756, 9, 'Vazi do: ' . ((string) ($offer['valid_until'] ?: 'Po dogovoru')), [0.16, 0.2, 0.28], false);

    $ops[] = pdf_panel(36, 612, 252, 92);
    $ops[] = pdf_panel(307, 612, 252, 92);
    $ops[] = pdf_text(52, 680, 10, 'Kupac', [0.42, 0.45, 0.52], true);
    $ops[] = pdf_text(52, 658, 12, (string) ($row['customer_name'] ?? ''), [0.07, 0.1, 0.16], true);
    $ops[] = pdf_text(52, 642, 9, (string) ($row['customer_email'] ?? ''), [0.16, 0.2, 0.28], false);
    $ops[] = pdf_text(52, 628, 9, (string) ($row['customer_phone'] ?? ''), [0.16, 0.2, 0.28], false);

    $ops[] = pdf_text(323, 680, 10, 'Osnov ponude', [0.42, 0.45, 0.52], true);
    foreach (pdf_wrap((string) ($row['order_subject'] ?? 'Ponuda'), 34, 2) as $lineIndex => $line) {
        $ops[] = pdf_text(323, 658 - ($lineIndex * 13), 10, $line, [0.07, 0.1, 0.16], $lineIndex === 0);
    }
    $ops[] = pdf_text(323, 628, 9, 'Usluga: ' . (string) ($row['order_service'] ?? ''), [0.16, 0.2, 0.28], false);
    $ops[] = pdf_text(323, 614, 9, 'Grad: ' . (string) ($row['order_city'] ?? ''), [0.16, 0.2, 0.28], false);

    $ops[] = pdf_text(36, 578, 18, 'Komercijalna ponuda', [0.07, 0.1, 0.16], true);
    $ops[] = pdf_fill_rect(36, 542, 523, 24, [0.07, 0.1, 0.16]);
    $headers = [
        [50, '#'],
        [78, 'Opis'],
        [338, 'Kol.'],
        [386, 'JM'],
        [430, 'Cena'],
        [498, 'Iznos'],
    ];
    foreach ($headers as [$x, $label]) {
        $ops[] = pdf_text($x, 550, 9, $label, [1, 1, 1], true);
    }

    $rowY = 520;
    $visibleItems = array_slice($offer['items'], 0, 8);
    foreach ($visibleItems as $index => $item) {
        $ops[] = pdf_line(36, $rowY - 10, 559, $rowY - 10, [0.89, 0.91, 0.94]);
        $ops[] = pdf_text(50, $rowY, 9, (string) ($index + 1), [0.16, 0.2, 0.28], false);
        foreach (pdf_wrap((string) ($item['description'] ?? ''), 34, 2) as $lineIndex => $line) {
            $ops[] = pdf_text(78, $rowY - ($lineIndex * 11), 9, $line, [0.07, 0.1, 0.16], $lineIndex === 0);
        }
        $ops[] = pdf_text(338, $rowY, 9, offer_number((float) ($item['quantity'] ?? 0)), [0.16, 0.2, 0.28], false);
        $ops[] = pdf_text(386, $rowY, 9, (string) ($item['unit'] ?? ''), [0.16, 0.2, 0.28], false);
        $ops[] = pdf_text(430, $rowY, 9, offer_money((float) ($item['unit_price'] ?? 0)), [0.16, 0.2, 0.28], false);
        $ops[] = pdf_text(498, $rowY, 9, offer_money((float) ($item['line_total'] ?? 0)), [0.16, 0.2, 0.28], true);
        $rowY -= 34;
    }
    if (count($offer['items']) > count($visibleItems)) {
        $ops[] = pdf_text(78, $rowY + 8, 9, '+ jos stavki u admin ponudi', [0.42, 0.45, 0.52], false);
    }

    $totalsY = max(240, $rowY - 16);
    $ops[] = pdf_panel(330, $totalsY, 229, 96);
    $ops[] = pdf_text(346, $totalsY + 70, 10, 'Osnovica', [0.42, 0.45, 0.52], false);
    $ops[] = pdf_text(474, $totalsY + 70, 10, offer_money((float) $offer['subtotal']) . ' ' . (string) $offer['currency'], [0.07, 0.1, 0.16], true);
    $ops[] = pdf_text(346, $totalsY + 48, 10, 'PDV ' . offer_number((float) $offer['tax_rate']) . '%', [0.42, 0.45, 0.52], false);
    $ops[] = pdf_text(474, $totalsY + 48, 10, offer_money((float) $offer['tax_amount']) . ' ' . (string) $offer['currency'], [0.07, 0.1, 0.16], true);
    $ops[] = pdf_fill_rect(342, $totalsY + 10, 201, 24, [1, 0.97, 0.91]);
    $ops[] = pdf_text(346, $totalsY + 18, 11, 'Ukupno', [0.07, 0.1, 0.16], true);
    $ops[] = pdf_text(474, $totalsY + 18, 11, offer_money((float) $offer['total']) . ' ' . (string) $offer['currency'], [0.07, 0.1, 0.16], true);

    $termsY = max(128, $totalsY - 112);
    $ops[] = pdf_panel(36, $termsY, 252, 84);
    $ops[] = pdf_panel(307, $termsY, 252, 84);
    $ops[] = pdf_text(52, $termsY + 58, 10, 'Placanje', [0.42, 0.45, 0.52], true);
    foreach (pdf_wrap((string) ($offer['payment_terms'] ?? 'Po dogovoru'), 34, 3) as $lineIndex => $line) {
        $ops[] = pdf_text(52, $termsY + 38 - ($lineIndex * 11), 9, $line, [0.07, 0.1, 0.16], $lineIndex === 0);
    }
    $ops[] = pdf_text(323, $termsY + 58, 10, 'Isporuka', [0.42, 0.45, 0.52], true);
    foreach (pdf_wrap((string) ($offer['delivery_terms'] ?? 'Po dogovoru'), 34, 3) as $lineIndex => $line) {
        $ops[] = pdf_text(323, $termsY + 38 - ($lineIndex * 11), 9, $line, [0.07, 0.1, 0.16], $lineIndex === 0);
    }

    $note = trim((string) ($offer['note'] ?? ''));
    if ($note !== '') {
        $ops[] = pdf_fill_rect(36, 74, 523, 36, [1, 0.98, 0.92]);
        $ops[] = pdf_text(52, 94, 9, 'Napomena: ' . implode(' ', pdf_wrap($note, 92, 1)), [0.36, 0.25, 0.07], false);
    }

    $ops[] = pdf_line(36, 54, 559, 54, [0.86, 0.88, 0.91]);
    $ops[] = pdf_text(36, 34, 8, 'Dragoslav Marjanovic PR PREVOZ KOP-BETONSKA BAZA, Lipa 014/A, 18000, Donja Vrezina, Srbija, PIB 112152599, MB 65910756', [0.42, 0.45, 0.52], true);
    $ops[] = pdf_text(396, 34, 9, 'prevozkopbb@gmail.com | +381 60 588 7471', [0.42, 0.45, 0.52], false);

    return pdf_document(implode("\n", $ops), $images);
}

function pdf_document(string $stream, array $images = []): string
{
    $objects = [];
    $objects[] = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';
    $objects[] = '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj';
    $xObjects = [];
    $nextObject = 7;
    foreach ($images as $name => $path) {
        $xObjects[] = '/' . $name . ' ' . $nextObject . ' 0 R';
        $nextObject++;
    }
    $resourceImages = $xObjects ? ' /XObject << ' . implode(' ', $xObjects) . ' >>' : '';
    $objects[] = '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >>' . $resourceImages . ' >> /Contents 4 0 R >> endobj';
    $objects[] = '4 0 obj << /Length ' . strlen($stream) . " >> stream\n" . $stream . "\nendstream endobj";
    $objects[] = '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
    $objects[] = '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj';
    $imageObjectId = 7;
    foreach ($images as $path) {
        $info = @getimagesize($path);
        $bytes = file_get_contents($path);
        if (!$info || $bytes === false) {
            continue;
        }
        $objects[] = $imageObjectId . ' 0 obj << /Type /XObject /Subtype /Image /Width ' . (int) $info[0]
            . ' /Height ' . (int) $info[1]
            . ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' . strlen($bytes)
            . " >> stream\n" . $bytes . "\nendstream endobj";
        $imageObjectId++;
    }

    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $object) {
        $offsets[] = strlen($pdf);
        $pdf .= $object . "\n";
    }
    $xrefOffset = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
    $pdf .= "0000000000 65535 f \n";
    foreach (array_slice($offsets, 1) as $offset) {
        $pdf .= str_pad((string) $offset, 10, '0', STR_PAD_LEFT) . " 00000 n \n";
    }
    $pdf .= 'trailer << /Size ' . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n" . $xrefOffset . "\n%%EOF";
    return $pdf;
}

function pdf_text(float $x, float $y, int $size, string $text, array $rgb, bool $bold): string
{
    $safe = pdf_escape_text(pdf_to_latin($text));
    return 'BT /' . ($bold ? 'F2' : 'F1') . ' ' . $size . ' Tf '
        . implode(' ', array_map('pdf_decimal', $rgb)) . ' rg '
        . pdf_decimal($x) . ' ' . pdf_decimal($y) . ' Td (' . $safe . ') Tj ET';
}

function pdf_panel(float $x, float $y, float $width, float $height): string
{
    return pdf_fill_rect($x, $y, $width, $height, [1, 1, 1])
        . "\n"
        . implode(' ', array_map('pdf_decimal', [0.88, 0.9, 0.93])) . ' RG 1 w '
        . pdf_decimal($x) . ' ' . pdf_decimal($y) . ' ' . pdf_decimal($width) . ' ' . pdf_decimal($height) . ' re S';
}

function pdf_fill_rect(float $x, float $y, float $width, float $height, array $rgb): string
{
    return implode(' ', array_map('pdf_decimal', $rgb)) . ' rg '
        . pdf_decimal($x) . ' ' . pdf_decimal($y) . ' ' . pdf_decimal($width) . ' ' . pdf_decimal($height) . ' re f';
}

function pdf_line(float $x1, float $y1, float $x2, float $y2, array $rgb): string
{
    return implode(' ', array_map('pdf_decimal', $rgb)) . ' RG 1 w '
        . pdf_decimal($x1) . ' ' . pdf_decimal($y1) . ' m '
        . pdf_decimal($x2) . ' ' . pdf_decimal($y2) . ' l S';
}

function pdf_image(string $name, float $x, float $y, float $width, float $height): string
{
    return 'q ' . pdf_decimal($width) . ' 0 0 ' . pdf_decimal($height) . ' '
        . pdf_decimal($x) . ' ' . pdf_decimal($y) . ' cm /' . $name . ' Do Q';
}

function pdf_wrap(string $text, int $limit, int $maxLines): array
{
    $words = preg_split('/\s+/', trim(pdf_to_latin($text))) ?: [];
    $lines = [];
    $line = '';
    foreach ($words as $word) {
        $candidate = trim($line . ' ' . $word);
        if (strlen($candidate) <= $limit) {
            $line = $candidate;
            continue;
        }
        if ($line !== '') {
            $lines[] = $line;
        }
        $line = strlen($word) > $limit ? substr($word, 0, $limit - 3) . '...' : $word;
        if (count($lines) >= $maxLines) {
            break;
        }
    }
    if ($line !== '' && count($lines) < $maxLines) {
        $lines[] = $line;
    }
    return $lines ?: [''];
}

function pdf_to_latin(string $text): string
{
    $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
    if (is_string($ascii) && $ascii !== '') {
        return $ascii;
    }

    return preg_replace('/[^\x20-\x7E]/', '', $text) ?? '';
}

function pdf_escape_text(string $text): string
{
    return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $text);
}

function pdf_decimal(float $value): string
{
    return rtrim(rtrim(number_format($value, 3, '.', ''), '0'), '.');
}

function fetch_project(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM projects WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function fetch_product(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function build_file_url(array $config, ?string $relative): ?string
{
    if (!$relative) {
        return null;
    }
    return build_upload_url($config, 'uploads', $relative);
}

function build_product_file_url(array $config, ?string $relative): ?string
{
    if (!$relative) {
        return null;
    }
    return build_upload_url($config, 'uploads_products', $relative);
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
            'id' => (int) $item['id'],
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

function map_product_brief(array $row, array $config): array
{
    $image = $row['image'] ?? null;
    if ($image && !preg_match('~^https?://~i', $image) && !str_starts_with($image, '/uploads/')) {
        $image = build_product_file_url($config, $image);
    }
    $document = $row['document_path'] ?? null;
    if ($document && !preg_match('~^https?://~i', $document) && !str_starts_with($document, '/uploads/')) {
        $document = build_product_file_url($config, $document);
    }

    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'category' => $row['category'],
        'product_type' => $row['product_type'] ?? null,
        'short_description' => $row['short_description'],
        'image' => $image,
        'document' => $document,
        'status' => $row['status'] ?? null,
        'sort_order' => isset($row['sort_order']) ? (int) $row['sort_order'] : 0,
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function map_product_full(array $row, array $config, array $media = []): array
{
    $specs = null;
    if (!empty($row['specs'])) {
        $decoded = json_decode($row['specs'], true);
        $specs = is_array($decoded) ? $decoded : null;
    }

    $image = $row['image'] ?? null;
    if ($image && !preg_match('~^https?://~i', $image) && !str_starts_with($image, '/uploads/')) {
        $image = build_product_file_url($config, $image);
    }
    $document = $row['document_path'] ?? null;
    if ($document && !preg_match('~^https?://~i', $document) && !str_starts_with($document, '/uploads/')) {
        $document = build_product_file_url($config, $document);
    }

    $gallery = array_map(function ($item) use ($config) {
        return [
            'id' => (int) $item['id'],
            'src' => build_product_file_url($config, $item['file_path']),
            'alt' => $item['alt_text'],
            'sort_order' => (int) $item['sort_order'],
        ];
    }, $media);

    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'category' => $row['category'],
        'product_type' => $row['product_type'] ?? null,
        'short_description' => $row['short_description'],
        'description' => $row['description'],
        'applications' => $row['applications'],
        'specs' => $specs,
        'image' => $image,
        'document' => $document,
        'gallery' => $gallery,
        'status' => $row['status'] ?? null,
        'sort_order' => isset($row['sort_order']) ? (int) $row['sort_order'] : 0,
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function map_order(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'subject' => $row['subject'],
        'concrete_type' => $row['concrete_type'],
        'message' => $row['message'],
        'status' => $row['status'],
        'service_type' => $row['service_type'] ?? null,
        'quantity' => $row['quantity'] ?? null,
        'quantity_unit' => $row['quantity_unit'] ?? null,
        'city_slug' => $row['city_slug'] ?? null,
        'pipeline_stage' => $row['pipeline_stage'] ?? 'new',
        'lead_score' => isset($row['lead_score']) ? (int) $row['lead_score'] : null,
        'next_follow_up_at' => $row['next_follow_up_at'] ?? null,
        'lost_reason' => $row['lost_reason'] ?? null,
        'source_page' => $row['source_page'] ?? null,
        'utm_source' => $row['utm_source'] ?? null,
        'utm_medium' => $row['utm_medium'] ?? null,
        'utm_campaign' => $row['utm_campaign'] ?? null,
        'created_at' => $row['created_at'],
    ];
}

function map_order_offer(array $row): array
{
    $items = [];
    if (!empty($row['items'])) {
        $decoded = json_decode((string) $row['items'], true);
        $items = is_array($decoded) ? $decoded : [];
    }

    return [
        'id' => (int) $row['id'],
        'order_id' => (int) $row['order_id'],
        'offer_number' => $row['offer_number'],
        'status' => $row['status'],
        'items' => $items,
        'subtotal' => (float) $row['subtotal'],
        'tax_rate' => (float) $row['tax_rate'],
        'tax_amount' => (float) $row['tax_amount'],
        'total' => (float) $row['total'],
        'currency' => $row['currency'],
        'valid_until' => $row['valid_until'] ?? null,
        'payment_terms' => $row['payment_terms'] ?? null,
        'delivery_terms' => $row['delivery_terms'] ?? null,
        'note' => $row['note'] ?? null,
        'created_by' => isset($row['created_by']) ? (int) $row['created_by'] : null,
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'] ?? null,
    ];
}
