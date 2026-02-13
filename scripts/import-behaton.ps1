$ErrorActionPreference = "Stop"

$apiBase = "https://api.prevozkop.rs/api"
$email = $env:PREVOZKOP_ADMIN_EMAIL
$password = $env:PREVOZKOP_ADMIN_PASSWORD
$dataPath = "docs\\behaton-products-import.json"

if (-not (Test-Path $dataPath)) {
  throw "Missing data file: $dataPath"
}
if (-not $email -or -not $password) {
  throw "Set PREVOZKOP_ADMIN_EMAIL and PREVOZKOP_ADMIN_PASSWORD env vars."
}

function Slugify([string]$text) {
  $t = $text.ToLowerInvariant()
  $t = $t -replace "č", "c"
  $t = $t -replace "ć", "c"
  $t = $t -replace "ž", "z"
  $t = $t -replace "š", "s"
  $t = $t -replace "đ", "dj"
  $t = $t -replace "[^a-z0-9]+", "-"
  $t = $t.Trim("-")
  if ($t -eq "") { $t = "item-" + [Guid]::NewGuid().ToString("N").Substring(0, 8) }
  return $t
}

function WriteUtf8NoBom([string]$path, [string]$text) {
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $utf8)
}

$cookieFile = Join-Path $env:TEMP "prevozkop-admin-cookie.txt"
if (Test-Path $cookieFile) { Remove-Item -Force $cookieFile }

$loginPayload = @{ email = $email; password = $password } | ConvertTo-Json -Compress
$loginTmp = Join-Path $env:TEMP "prevozkop-login.json"
WriteUtf8NoBom $loginTmp $loginPayload
$loginResp = & curl.exe -s -c $cookieFile -H "Content-Type: application/json" -d "@$loginTmp" "$apiBase/admin/login"
Remove-Item -Force $loginTmp
if ($loginResp -match '"error"') {
  throw "Login failed: $loginResp"
}
if (-not $loginResp) { throw "Login failed (empty response)" }

$products = Get-Content -Raw -Encoding UTF8 -Path $dataPath | ConvertFrom-Json
$created = 0
$failed = 0

foreach ($p in $products) {
  $name = ($p.name -replace "''", "" -replace "\s+", " ").Trim()
  $short = ($p.short_description -replace "\s+", " ").Trim()
  $desc = ($p.description -replace "\s+$", "").Trim()
  if (-not $name) { continue }

  $slugBase = "$name $short".Trim()
  $slug = Slugify $slugBase

  $payload = @{
    name = $name
    slug = $slug
    category = "behaton"
    product_type = ""
    short_description = $short
    description = $desc
    applications = ""
    status = "published"
    sort_order = 0
  } | ConvertTo-Json -Compress

  $tmp = Join-Path $env:TEMP ("prevozkop-product-{0}.json" -f $slug)
  WriteUtf8NoBom $tmp $payload

  $resp = & curl.exe -s -b $cookieFile -H "Content-Type: application/json" -d "@$tmp" "$apiBase/admin/products"
  Remove-Item -Force $tmp

  if (-not $resp) {
    Write-Host ("FAILED create: {0} (empty response)" -f $name)
    $failed++
    continue
  }

  try {
    $obj = $resp | ConvertFrom-Json
  } catch {
    Write-Host ("FAILED parse response for: {0}" -f $name)
    $failed++
    continue
  }

  $id = $obj.id
  if (-not $id) {
    Write-Host ("FAILED missing id for: {0}" -f $name)
    Write-Host ("RESPONSE: {0}" -f $resp)
    $failed++
    continue
  }

  $images = @()
  if ($p.image_files) { $images = @($p.image_files) }

  if ($images.Count -gt 0) {
    $main = $images[0]
    if (Test-Path $main) {
      & curl.exe -s -b $cookieFile -F ("file=@{0}" -f $main) "$apiBase/admin/products/$id/image" | Out-Null
    }
    if ($images.Count -gt 1) {
      for ($i = 1; $i -lt $images.Count; $i++) {
        $img = $images[$i]
        if (Test-Path $img) {
          & curl.exe -s -b $cookieFile -F ("file=@{0}" -f $img) "$apiBase/admin/products/$id/media" | Out-Null
        }
      }
    }
  }

  Write-Host ("CREATED: {0} (id {1})" -f $name, $id)
  $created++
}

Write-Host ("Done. Created: {0}, Failed: {1}" -f $created, $failed)
