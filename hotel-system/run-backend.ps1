param(
  [string]$Port = "8080"
)

$ErrorActionPreference = "Stop"

function Resolve-Maven {
  if (Get-Command mvn -ErrorAction SilentlyContinue) {
    return "mvn"
  }

  $candidates = @(
    "$env:ProgramFiles\JetBrains\IntelliJ IDEA Community Edition*\plugins\maven\lib\maven3\bin\mvn.cmd",
    "$env:ProgramFiles\JetBrains\IntelliJ IDEA*\plugins\maven\lib\maven3\bin\mvn.cmd",
    "$env:ProgramFiles(x86)\JetBrains\IntelliJ IDEA*\plugins\maven\lib\maven3\bin\mvn.cmd"
  )

  foreach ($pattern in $candidates) {
    $hit = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) {
      return $hit.FullName
    }
  }
  return $null
}

$maven = Resolve-Maven
if (-not $maven) {
  Write-Host ""
  Write-Host "Maven not found in PATH or IntelliJ installation."
  Write-Host "Install Maven or set PATH, then run this script again."
  exit 1
}

Write-Host "Starting backend on http://localhost:$Port/hotel-system"
Write-Host "Using Maven: $maven"
& $maven "-DskipTests" "tomcat9:run" "-Dtomcat9.port=$Port"
