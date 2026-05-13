Get-ChildItem -Path app -Recurse -Filter *.py | ForEach-Object {
    (Get-Content $_.FullName) -replace "from Backend\.app", "from app" | Set-Content $_.FullName
}