<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

session_set_cookie_params(
    0,
    '/',
    '',
    !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    true
);
session_start();

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

if (($_SESSION['role'] ?? '') !== 'staff') {
    respond(['success' => false, 'message' => 'Staff login is required.'], 401);
}

$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoloadPath)) {
    error_log('Appointment email unavailable: PHPMailer is not installed. Run composer install.');
    respond([
        'success' => false,
        'message' => 'Email support is not installed yet. Run composer install in the project folder.',
    ], 503);
}
require_once $autoloadPath;

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    respond(['success' => false, 'message' => 'Invalid request data.'], 400);
}

$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$date = trim((string)($data['date'] ?? ''));
$time = trim((string)($data['time'] ?? ''));
$parsedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
$parsedTime = DateTimeImmutable::createFromFormat('!H:i', $time);

if (
    $name === '' || mb_strlen($name) > 150 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !$parsedDate || $parsedDate->format('Y-m-d') !== $date ||
    !$parsedTime || $parsedTime->format('H:i') !== $time
) {
    respond(['success' => false, 'message' => 'Please provide a valid name, email, date, and time.'], 422);
}

$config = require __DIR__ . '/smtp-config.php';
$allowedEncryption = ['tls', 'ssl'];
if (
    $config['host'] === '' ||
    $config['username'] === '' ||
    $config['password'] === '' ||
    $config['from_email'] === '' ||
    !filter_var($config['from_email'], FILTER_VALIDATE_EMAIL) ||
    !in_array($config['encryption'], $allowedEncryption, true) ||
    $config['port'] < 1 || $config['port'] > 65535
) {
    error_log('Appointment email unavailable: SMTP settings are incomplete or invalid.');
    respond([
        'success' => false,
        'message' => 'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM_EMAIL, then restart Apache.',
    ], 503);
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = $config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['username'];
    $mail->Password = $config['password'];
    $mail->SMTPSecure = $config['encryption'] === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['port'];
    $mail->CharSet = PHPMailer::CHARSET_UTF8;

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($email, $name);
    $mail->addReplyTo($config['from_email'], $config['from_name']);
    $mail->isHTML(true);
    $mail->Subject = 'Proposed Adoption Meeting Appointment';
    $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
    $formattedDate = $parsedDate->format('F j, Y');
    $formattedTime = $parsedTime->format('g:i A');
    $mail->Body = "
        <h2>Appointment Notification</h2>
        <p>Hello {$safeName},</p>
        <p>We would like to schedule a meeting with you regarding your adoption application.</p>
        <p><strong>Date:</strong> {$formattedDate}</p>
        <p><strong>Time:</strong> {$formattedTime}</p>
        <p>Please reply to this email to confirm whether the proposed schedule works for you.</p>
        <p>Thank you!</p>
        <p>Animal Adoption and Care System</p>
    ";
    $mail->AltBody = "Hello {$name},\n\n"
        . "We would like to schedule a meeting with you regarding your adoption application.\n"
        . "Date: {$formattedDate}\nTime: {$formattedTime}\n\n"
        . "Please reply to this email to confirm whether the proposed schedule works for you.\n"
        . "Animal Adoption and Care System";
    $mail->send();
    respond(['success' => true, 'message' => 'Appointment email sent successfully.']);
} catch (Throwable $exception) {
    error_log('Appointment SMTP error: ' . $mail->ErrorInfo);
    respond([
        'success' => false,
        'message' => 'Email could not be sent. Check the SMTP settings and Apache PHP error log.',
    ], 502);
}
