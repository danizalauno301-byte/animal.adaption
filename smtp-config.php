<?php
declare(strict_types=1);

return [
    'host' => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
    'port' => (int)(getenv('SMTP_PORT') ?: 587),
    'encryption' => strtolower(getenv('SMTP_ENCRYPTION') ?: 'tls'),
    'username' => getenv('SMTP_USERNAME') ?: '',
    'password' => getenv('SMTP_PASSWORD') ?: '',
    'from_email' => getenv('SMTP_FROM_EMAIL') ?: (getenv('SMTP_USERNAME') ?: ''),
    'from_name' => getenv('SMTP_FROM_NAME') ?: 'Animal Adoption and Care System',
];
