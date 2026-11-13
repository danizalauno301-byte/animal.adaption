$ErrorActionPreference = 'Stop'

$smtpUsername = (Read-Host 'Gmail address used to send appointment emails').Trim()
if ($smtpUsername -notmatch '^[^@\s]+@(?:gmail\.com|googlemail\.com)$') {
    throw 'Enter the full Gmail address, for example name@gmail.com. Do not enter only the username.'
}

$securePassword = Read-Host 'Gmail App Password (input is hidden)' -AsSecureString
$passwordPointer = [IntPtr]::Zero

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $smtpPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer).Replace(' ', '')
    if ([string]::IsNullOrWhiteSpace($smtpPassword)) {
        throw 'The App Password cannot be empty.'
    }

    [Environment]::SetEnvironmentVariable('SMTP_HOST', 'smtp.gmail.com', 'User')
    [Environment]::SetEnvironmentVariable('SMTP_PORT', '587', 'User')
    [Environment]::SetEnvironmentVariable('SMTP_ENCRYPTION', 'tls', 'User')
    [Environment]::SetEnvironmentVariable('SMTP_USERNAME', $smtpUsername, 'User')
    [Environment]::SetEnvironmentVariable('SMTP_PASSWORD', $smtpPassword, 'User')
    [Environment]::SetEnvironmentVariable('SMTP_FROM_EMAIL', $smtpUsername, 'User')
    [Environment]::SetEnvironmentVariable('SMTP_FROM_NAME', 'Animal Adoption and Care System', 'User')

    Write-Host 'SMTP settings saved for your Windows user.'
    Write-Host 'Close and reopen the XAMPP Control Panel, then restart Apache.'
    Write-Host 'After Apache restarts, send a test appointment email from the staff dashboard.'
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($null -ne $smtpPassword) {
        Remove-Variable smtpPassword -ErrorAction SilentlyContinue
    }
    Remove-Variable securePassword -ErrorAction SilentlyContinue
}
