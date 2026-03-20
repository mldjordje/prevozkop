$ErrorActionPreference = "Stop"

$xlsx = "docs\\behaton proizvodi (1).xlsx"
$zip = "docs\\behaton-proizvodi.zip"
$out = "docs\\behaton-xlsx-extract"

Copy-Item -Path $xlsx -Destination $zip -Force
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
Expand-Archive -Path $zip -DestinationPath $out -Force

$mediaBase = Join-Path $out "xl\\media"
$drawDir = Join-Path $out "xl\\drawings"

$imgPos = @()
Get-ChildItem -Path $drawDir -Filter "drawing*.xml" | ForEach-Object {
  $relsPath = Join-Path $drawDir ("_rels\\{0}.rels" -f $_.Name)
  [xml]$rels = Get-Content -Raw -Path $relsPath
  $relMap = @{}
  foreach ($rel in $rels.Relationships.Relationship) { $relMap[$rel.Id] = $rel.Target }

  $xml = Get-Content -Raw -Path $_.FullName
  $ns = New-Object System.Xml.XmlNamespaceManager (New-Object System.Xml.NameTable)
  $ns.AddNamespace("xdr", "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing")
  $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
  $ns.AddNamespace("r", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
  $doc = New-Object System.Xml.XmlDocument
  $doc.LoadXml($xml)

  $anchors = $doc.SelectNodes("//xdr:oneCellAnchor", $ns)
  foreach ($anchor in $anchors) {
    $from = $anchor.SelectSingleNode("xdr:from", $ns)
    $row = [int]$from.SelectSingleNode("xdr:row", $ns).InnerText + 1
    $col = [int]$from.SelectSingleNode("xdr:col", $ns).InnerText + 1
    $blips = $anchor.SelectNodes(".//a:blip", $ns)
    foreach ($blip in $blips) {
      $rid = $blip.GetAttribute("embed", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
      if ($rid) {
        $target = $relMap[$rid]
        $imgPos += [PSCustomObject]@{ Row = $row; Col = $col; Target = $target }
      }
    }
  }
}

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$workbook = $excel.Workbooks.Open((Resolve-Path $xlsx).Path)
$sheet = $workbook.Worksheets.Item(1)
$used = $sheet.UsedRange
$rows = $used.Rows.Count
$rowsData = @()
for ($r = 1; $r -le $rows; $r++) {
  $c1 = $used.Cells.Item($r, 1).Text
  $c2 = $used.Cells.Item($r, 2).Text
  $c3 = $used.Cells.Item($r, 3).Text
  $c4 = $used.Cells.Item($r, 4).Text
  $rowsData += [PSCustomObject]@{ Row = $r; C1 = $c1; C2 = $c2; C3 = $c3; C4 = $c4 }
}
$workbook.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($sheet) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

$headers = $rowsData | Where-Object { $_.C1 -match "PLO" -and $_.C1 -notmatch "^BEHATON" } | Select-Object -ExpandProperty Row
$products = @()
for ($i = 0; $i -lt $headers.Count; $i++) {
  $start = $headers[$i]
  $end = if ($i -lt $headers.Count - 1) { $headers[$i + 1] - 1 } else { $rows }
  $headRow = $rowsData | Where-Object { $_.Row -eq $start } | Select-Object -First 1
  if (-not $headRow) { continue }
  $headText = ($headRow.C1 -split "`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
  $name = $headText[0]
  $dim = if ($headText.Count -gt 1) { ($headText[1..($headText.Count - 1)] -join " ") } else { "" }
  $lines = @()
  for ($r = $start; $r -le $end; $r++) {
    $row = $rowsData | Where-Object { $_.Row -eq $r } | Select-Object -First 1
    if ($row -and $row.C2 -and $row.C3) {
      $lines += ("{0} - {1} {2}" -f $row.C2, $row.C3, $row.C4).Trim()
    }
  }
  $desc = if ($lines.Count -gt 0) { "Cene po boji:`n" + ($lines -join "`n") } else { "" }

  $imgs = $imgPos | Where-Object { $_.Row -eq $start } | Select-Object -ExpandProperty Target
  $imgFiles = @()
  foreach ($img in $imgs) {
    $imgPath = Join-Path $mediaBase (Split-Path $img -Leaf)
    if (Test-Path $imgPath) { $imgFiles += $imgPath }
  }

  $products += [PSCustomObject]@{
    name = $name
    short_description = $dim
    description = $desc
    image_files = $imgFiles
    row = $start
  }
}

$outJson = "docs\\behaton-products-import.json"
$products | ConvertTo-Json -Depth 5 | Set-Content -Path $outJson

$bulkPath = "docs\\behaton-products-bulk.txt"
$products | ForEach-Object {
  "{0} | behaton |  | {1}" -f $_.name, $_.short_description
} | Set-Content -Path $bulkPath

$imgOut = "docs\\behaton-images"
New-Item -ItemType Directory -Force -Path $imgOut | Out-Null
foreach ($p in $products) {
  foreach ($f in $p.image_files) {
    $dest = Join-Path $imgOut ((("R{0}_" -f $p.row) + (Split-Path $f -Leaf)))
    Copy-Item -Path $f -Destination $dest -Force
  }
}

Write-Host ("Products: {0}" -f $products.Count)
Write-Host ("JSON: {0}" -f $outJson)
Write-Host ("Bulk: {0}" -f $bulkPath)
Write-Host ("Images: {0}" -f $imgOut)
