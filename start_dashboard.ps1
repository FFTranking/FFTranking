$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8080
$Prefix = "http://localhost:$Port/"

Write-Host ""
Write-Host "FFT Ranking Dashboard Server" -ForegroundColor Yellow
Write-Host "Folder: $Root"
Write-Host "Open on this PC: $Prefix" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window open while using the dashboard."
Write-Host "Press Ctrl + C to stop."
Write-Host ""

Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($Prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Cannot start server on port $Port." -ForegroundColor Red
  Write-Host "Try closing other dashboard windows or restart PC."
  pause
  exit
}

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    ".csv" { "text/csv; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".png" { "image/png" }
    ".webp" { "image/webp" }
    default { "application/octet-stream" }
  }
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $reqPath = [System.Web.HttpUtility]::UrlDecode($context.Request.Url.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($reqPath)) { $reqPath = "index.html" }
  $safePath = $reqPath -replace "\.\.",""
  $filePath = Join-Path $Root $safePath

  if (Test-Path $filePath -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $context.Response.ContentType = Get-ContentType $filePath
    $context.Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $reqPath")
    $context.Response.StatusCode = 404
    $context.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $context.Response.OutputStream.Close()
}
