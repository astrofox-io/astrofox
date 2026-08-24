$ErrorActionPreference = "Stop"

function Require-Env {
  param([Parameter(Mandatory = $true)][string]$Name)

  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required environment variable: $Name"
  }
  return $value
}

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][scriptblock]$Script
  )

  Write-Host ""
  Write-Host "==> $Title"
  $global:LASTEXITCODE = 0
  & $Script
  if ($LASTEXITCODE -ne 0) {
    throw "$Title failed with exit code $LASTEXITCODE"
  }
}

function Resolve-CodeSignTool {
  $configuredPath = Require-Env "SSL_COM_CODESIGNTOOL"
  if (-not (Test-Path -LiteralPath $configuredPath)) {
    throw "SSL_COM_CODESIGNTOOL does not exist: $configuredPath"
  }

  $resolvedPath = (Resolve-Path -LiteralPath $configuredPath).Path
  if ((Split-Path -Leaf $resolvedPath) -notin @("CodeSignTool.bat", "CodeSignTool.exe")) {
    throw "SSL_COM_CODESIGNTOOL must point to CodeSignTool.bat or CodeSignTool.exe: $resolvedPath"
  }
  return $resolvedPath
}

function Protect-CodeSignToolOutput {
  param([AllowNull()][object[]]$Output)

  if (-not $Output) { return @() }
  $secrets = @($username, $password, $credentialId, $totpSecret) |
    Where-Object { -not [string]::IsNullOrEmpty($_) }

  foreach ($line in $Output) {
    $redactedLine = [string]$line
    foreach ($secret in $secrets) {
      $redactedLine = $redactedLine.Replace($secret, "***")
    }
    $redactedLine
  }
}

function Invoke-CodeSignTool {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
  )

  Write-Host ""
  Write-Host "==> $Title"
  $logName = ($Title -replace "[^a-zA-Z0-9.-]+", "-").Trim("-").ToLowerInvariant()
  $logPath = Join-Path $buildReleaseDir "$logName.log"
  $toolDirectory = Split-Path -Parent $codeSignTool
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  Push-Location $toolDirectory
  try {
    $output = & $codeSignTool sign `
      "-username=$username" `
      "-password=$password" `
      "-credential_id=$credentialId" `
      "-totp_secret=$totpSecret" `
      "-input_file_path=$InputPath" `
      "-output_dir_path=$OutputDirectory" `
      '-override=true' 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    Pop-Location
    $ErrorActionPreference = $previousPreference
  }

  $redactedOutput = Protect-CodeSignToolOutput -Output $output
  $redactedOutput | Set-Content -LiteralPath $logPath
  $redactedOutput | ForEach-Object { Write-Host $_ }
  if ($exitCode -ne 0) {
    throw "$Title failed with exit code $exitCode. See log: $logPath"
  }

  $exactOutput = Join-Path $OutputDirectory (Split-Path -Leaf $InputPath)
  if (Test-Path -LiteralPath $exactOutput) { return $exactOutput }

  $signedOutput = Get-ChildItem -LiteralPath $OutputDirectory -Recurse -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($signedOutput) { return $signedOutput.FullName }
  throw "SSL.com did not produce a signed output file for $InputPath. See $logPath"
}

function Resolve-SignTool {
  $pathCommand = Get-Command "signtool.exe" -ErrorAction SilentlyContinue
  if ($pathCommand) { return $pathCommand.Source }

  $windowsKitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
  if (-not (Test-Path -LiteralPath $windowsKitsRoot)) { return $null }

  $candidate = Get-ChildItem -LiteralPath $windowsKitsRoot -Recurse -File -Filter "signtool.exe" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like "*\x64\signtool.exe" } |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($candidate) { return $candidate.FullName }
  return $null
}

function Assert-CodeSignature {
  param([Parameter(Mandatory = $true)][string]$Path)

  try {
    Import-Module Microsoft.PowerShell.Security -ErrorAction Stop
    $signature = Get-AuthenticodeSignature -LiteralPath $Path -ErrorAction Stop
    $signature | Format-List
    if ($signature.Status -eq "Valid") { return }
    Write-Warning "Get-AuthenticodeSignature returned $($signature.Status); trying signtool.exe."
  } catch {
    Write-Warning "Get-AuthenticodeSignature is unavailable: $($_.Exception.Message)"
  }

  $signTool = Resolve-SignTool
  if (-not $signTool) { throw "Could not find signtool.exe to verify ${Path}." }
  & $signTool verify /pa /v $Path
  if ($LASTEXITCODE -ne 0) { throw "signtool.exe verification failed for ${Path}." }
}

function Get-FileSha512Base64 {
  param([Parameter(Mandatory = $true)][string]$Path)

  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $sha512 = [System.Security.Cryptography.SHA512]::Create()
    try { return [Convert]::ToBase64String($sha512.ComputeHash($stream)) }
    finally { $sha512.Dispose() }
  } finally {
    $stream.Dispose()
  }
}

function Update-WindowsLatestYml {
  param(
    [Parameter(Mandatory = $true)][string]$LatestYmlPath,
    [Parameter(Mandatory = $true)][string]$InstallerPath
  )

  if (-not (Test-Path -LiteralPath $LatestYmlPath)) { return }
  $installer = Get-Item -LiteralPath $InstallerPath
  $sha512 = Get-FileSha512Base64 -Path $installer.FullName
  $content = Get-Content -LiteralPath $LatestYmlPath -Raw
  $content = [regex]::Replace($content, "(?m)^(\s+sha512:\s+).*$", "`${1}$sha512", 1)
  $content = [regex]::Replace($content, "(?m)^(\s+size:\s+)\d+$", "`${1}$($installer.Length)", 1)
  $content = [regex]::Replace($content, "(?m)^(sha512:\s+).*$", "`${1}$sha512", 1)
  Set-Content -LiteralPath $LatestYmlPath -Value $content -NoNewline
}

if ($env:OS -ne "Windows_NT") {
  throw "package:win:signed must be run on Windows."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$releaseDir = Join-Path $repoRoot "release"
$buildId = Get-Date -Format "yyyyMMdd-HHmmss"
$buildReleaseDir = Join-Path $releaseDir "win-signed-build-$buildId"
$unpackedDir = Join-Path $buildReleaseDir "win-unpacked"
$signedAppDir = Join-Path $buildReleaseDir "signed-app"
$signedInstallerDir = Join-Path $buildReleaseDir "signed-installer"

$codeSignTool = Resolve-CodeSignTool
$username = Require-Env "SSL_COM_USERNAME"
$password = Require-Env "SSL_COM_PASSWORD"
$credentialId = Require-Env "SSL_COM_CREDENTIAL_ID"
$totpSecret = Require-Env "SSL_COM_TOTP_SECRET"
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

Set-Location $repoRoot

Invoke-Step "Install ffmpeg" { pnpm install-ffmpeg }
Invoke-Step "Build renderer" { pnpm build:renderer }
New-Item -ItemType Directory -Path $buildReleaseDir -Force | Out-Null

Invoke-Step "Package unpacked Windows app" {
  pnpm exec electron-builder --win dir --x64 "--config.directories.output=$buildReleaseDir" --config.win.signExecutable=false --publish never
}

$appExe = Join-Path $unpackedDir "Astrofox.exe"
if (-not (Test-Path -LiteralPath $appExe)) {
  throw "Could not find unpacked app executable: $appExe"
}

New-Item -ItemType Directory -Path $signedAppDir -Force | Out-Null
$signedAppExe = Invoke-CodeSignTool -Title "Sign unpacked app executable with SSL.com" -InputPath $appExe -OutputDirectory $signedAppDir
Copy-Item -LiteralPath $signedAppExe -Destination $appExe -Force
Assert-CodeSignature -Path $appExe

Invoke-Step "Package NSIS installer from signed app" {
  pnpm exec electron-builder --win nsis --x64 --prepackaged "$unpackedDir" "--config.directories.output=$buildReleaseDir" --config.win.signExecutable=false --publish never
}

$installer = Get-ChildItem -LiteralPath $buildReleaseDir -Filter "*.exe" -File |
  Where-Object { $_.FullName -ne $appExe } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $installer) {
  throw "Could not find generated Windows installer in $buildReleaseDir"
}

New-Item -ItemType Directory -Path $signedInstallerDir -Force | Out-Null
$signedInstaller = Invoke-CodeSignTool -Title "Sign NSIS installer with SSL.com" -InputPath $installer.FullName -OutputDirectory $signedInstallerDir
Copy-Item -LiteralPath $signedInstaller -Destination $installer.FullName -Force
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
$finalInstaller = Join-Path $releaseDir $installer.Name
Copy-Item -LiteralPath $installer.FullName -Destination $finalInstaller -Force
Get-ChildItem -LiteralPath $buildReleaseDir -Filter "*.blockmap" -File |
  Copy-Item -Destination $releaseDir -Force

$latestYml = Join-Path $buildReleaseDir "latest.yml"
if (Test-Path -LiteralPath $latestYml) {
  Update-WindowsLatestYml -LatestYmlPath $latestYml -InstallerPath $finalInstaller
  Copy-Item -LiteralPath $latestYml -Destination $releaseDir -Force
}

Assert-CodeSignature -Path $finalInstaller
Write-Host "Signed app: $appExe"
Write-Host "Signed installer: $finalInstaller"
