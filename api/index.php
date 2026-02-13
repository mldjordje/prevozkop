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
