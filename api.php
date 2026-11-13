<?php
declare(strict_types=1);

session_set_cookie_params(
    0,
    '/',
    '',
    !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    true
);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require __DIR__ . '/db-config.php';

function sendApplicationStatusNotification(string $recipientEmail, string $applicantName, string $animalName, string $status): void
{
    $autoloadPath = __DIR__ . '/vendor/autoload.php';
    if (!is_file($autoloadPath)) {
        throw new RuntimeException('PHPMailer is not installed.');
    }
    require_once $autoloadPath;

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
        throw new RuntimeException('SMTP is not configured.');
    }

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];
        $mail->SMTPSecure = $config['encryption'] === 'ssl'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $config['port'];
        $mail->CharSet = PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
        $mail->setFrom($config['from_email'], $config['from_name']);
        $mail->addAddress($recipientEmail, $applicantName);
        $mail->addReplyTo($config['from_email'], $config['from_name']);
        $mail->isHTML(true);
        $mail->Subject = 'Adoption Application Update - ' . $status;

        $safeName = htmlspecialchars($applicantName, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
        $safeAnimal = htmlspecialchars($animalName, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
        $statusText = $status === 'Approved' ? 'approved' : 'not approved';
        $messageBody = $status === 'Approved'
            ? 'We are pleased to inform you that your adoption application for <strong>' . $safeAnimal . '</strong> has been approved.'
            : 'We regret to inform you that your adoption application for <strong>' . $safeAnimal . '</strong> has been rejected.';

        $mail->Body = "
            <h2>Adoption Application Update</h2>
            <p>Hello {$safeName},</p>
            <p>{$messageBody}</p>
            <p>Thank you for your interest in adopting with us.</p>
            <p>If you have any questions, please reply to this email.</p>
            <p>Animal Adoption and Care System</p>
        ";
        $mail->AltBody = "Hello {$applicantName},\n\n"
            . "Your adoption application for {$animalName} has been {$statusText}.\n\n"
            . "Thank you for your interest in adopting with us.\n"
            . "Animal Adoption and Care System";

        $mail->send();
    } catch (Throwable $exception) {
        throw $exception;
    }
}

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function requestData(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        respond(['success' => false, 'message' => 'Invalid JSON request.'], 400);
    }
    return $body;
}

function requireStaff(): void
{
    if (($_SESSION['role'] ?? '') !== 'staff') {
        respond(['success' => false, 'message' => 'Staff login is required.'], 401);
    }
}

function requireAdopter(): void
{
    if (($_SESSION['role'] ?? '') !== 'adopter') {
        respond(['success' => false, 'message' => 'Adopter login is required.'], 401);
    }
}

function textValue(array $row, string $key, int $maxLength = 10000): string
{
    $value = trim((string)($row[$key] ?? ''));
    if ($value === '' || mb_strlen($value) > $maxLength) {
        respond(['success' => false, 'message' => 'A required field is missing or too long.'], 422);
    }
    return $value;
}

function recordId(array $row, int $fallback = 0): int
{
    $id = filter_var($row['id'] ?? null, FILTER_VALIDATE_INT);
    if ($id !== false && $id > 0) {
        return $id;
    }
    if ($fallback > 0) {
        return $fallback;
    }
    $generated = (int)round(microtime(true) * 1000);
    if ($generated < 1) {
        $generated = 1;
    }
    return $generated;
}

function loadRecords(PDO $pdo, string $key, bool $isStaff = false): array
{
    $queries = [
        'animalRecords' => [
            'SELECT id, name, type, age, gender, health, vaccination, care, status, description, image FROM animals',
            function (array $row): array {
                return $row;
            },
        ],
        'adoptionApplications' => [
            'SELECT id, applicant_name AS applicantName, first_name AS firstName, last_name AS lastName,
                    email, phone, address, animal, housing, reason, experience, status, application_date AS date
             FROM adoption_applications ORDER BY id DESC',
            function (array $row): array {
                return $row;
            },
        ],
        'medicalRecords' => [
            'SELECT id, animal, health, vaccination, record_date AS date, treatment, notes
             FROM medical_records ORDER BY id DESC',
            function (array $row): array {
                return $row;
            },
        ],
        'careRecords' => [
            'SELECT id, animal, activity_type AS type, record_date AS date, status, notes
             FROM care_records ORDER BY id DESC',
            function (array $row): array {
                return $row;
            },
        ],
    ];

    $query = $queries[$key][0];
    if ($key === 'animalRecords' && !$isStaff) {
        $query .= " WHERE LOWER(status) = 'available'";
    }
    if ($key === 'animalRecords') {
        $query .= ' ORDER BY id';
    }
    $statement = $pdo->query($query);
    return array_map($queries[$key][1], $statement->fetchAll());
}

function isSequentialList(array $value): bool
{
    if ($value === []) {
        return true;
    }
    $expected = [];
    foreach ($value as $index => $entry) {
        if (!is_int($index)) {
            return false;
        }
        $expected[] = $index;
    }
    return $expected === range(0, count($value) - 1);
}

function saveRows(PDO $pdo, string $key, array $rows): void
{
    $maxIdQuery = [
        'animalRecords' => 'SELECT COALESCE(MAX(id), 0) FROM animals',
        'adoptionApplications' => 'SELECT COALESCE(MAX(id), 0) FROM adoption_applications',
        'medicalRecords' => 'SELECT COALESCE(MAX(id), 0) FROM medical_records',
        'careRecords' => 'SELECT COALESCE(MAX(id), 0) FROM care_records',
    ];
    $baseId = (int)($maxIdQuery[$key] ? $pdo->query($maxIdQuery[$key])->fetchColumn() : 0);

    $specifications = [
        'animalRecords' => [
            'DELETE FROM animals',
            'INSERT INTO animals (id, name, type, age, gender, health, vaccination, care, status, description, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['name', 'type', 'age', 'gender', 'health', 'vaccination', 'care', 'status', 'description', 'image'],
        ],
        'adoptionApplications' => [
            'DELETE FROM adoption_applications',
            'INSERT INTO adoption_applications
             (id, applicant_name, first_name, last_name, email, phone, address, animal, housing, reason, experience, status, application_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['applicantName', 'firstName', 'lastName', 'email', 'phone', 'address', 'animal', 'housing', 'reason', 'experience', 'status', 'date'],
        ],
        'medicalRecords' => [
            'DELETE FROM medical_records',
            'INSERT INTO medical_records (id, animal, health, vaccination, record_date, treatment, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['animal', 'health', 'vaccination', 'date', 'treatment', 'notes'],
        ],
        'careRecords' => [
            'DELETE FROM care_records',
            'INSERT INTO care_records (id, animal, activity_type, record_date, status, notes)
             VALUES (?, ?, ?, ?, ?, ?)',
            ['animal', 'type', 'date', 'status', 'notes'],
        ],
    ];

    if (!isset($specifications[$key])) {
        respond(['success' => false, 'message' => 'Unknown data collection.'], 400);
    }

    [$deleteSql, $insertSql, $fields] = $specifications[$key];
    $pdo->exec($deleteSql);
    $insert = $pdo->prepare($insertSql);

    foreach ($rows as $index => $row) {
        if (!is_array($row)) {
            respond(['success' => false, 'message' => 'A record is invalid.'], 422);
        }
        $values = [recordId($row, $baseId + (int)$index + 1)];
        foreach ($fields as $field) {
            if ($field === 'image') {
                $image = trim((string)($row[$field] ?? ''));
                if ($image !== '' && !preg_match('/^uploads\/[A-Za-z0-9._-]+$/', $image)) {
                    respond(['success' => false, 'message' => 'An animal photo path is invalid.'], 422);
                }
                $values[] = $image;
                continue;
            }
            $values[] = textValue($row, $field);
        }
        if (isset($row['email']) && !filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
            respond(['success' => false, 'message' => 'An application email address is invalid.'], 422);
        }
        $insert->execute($values);
    }
}

function insertPublicApplications(PDO $pdo, array $rows): void
{
    $insert = $pdo->prepare(
        'INSERT INTO adoption_applications
         (id, applicant_name, first_name, last_name, email, phone, address, animal, housing, reason, experience, status, application_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "Pending", ?)
         ON DUPLICATE KEY UPDATE id = id'
    );

    $baseId = (int)$pdo->query('SELECT COALESCE(MAX(id), 0) FROM adoption_applications')->fetchColumn();

    foreach ($rows as $index => $row) {
        if (!is_array($row)) {
            respond(['success' => false, 'message' => 'An application is invalid.'], 422);
        }
        $email = textValue($row, 'email', 254);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['success' => false, 'message' => 'Please provide a valid email address.'], 422);
        }
        $insert->execute([
            recordId($row, $baseId + (int)$index + 1),
            textValue($row, 'applicantName', 200),
            textValue($row, 'firstName', 100),
            textValue($row, 'lastName', 100),
            $email,
            textValue($row, 'phone', 50),
            textValue($row, 'address'),
            textValue($row, 'animal', 150),
            textValue($row, 'housing', 120),
            textValue($row, 'reason'),
            textValue($row, 'experience'),
            textValue($row, 'date', 80),
        ]);
    }
}

function saveStaffUsers(PDO $pdo, array $users): void
{
    $pdo->beginTransaction();
    try {
        $existing = $pdo->query('SELECT id FROM staff_users')->fetchAll(PDO::FETCH_COLUMN);
        $keepIds = [];
        $upsert = $pdo->prepare(
            'INSERT INTO staff_users (full_name, username, password_hash, role)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role)'
        );
        $updatePassword = $pdo->prepare(
            'UPDATE staff_users SET password_hash = ? WHERE username = ?'
        );

        foreach ($users as $user) {
            if (!is_array($user)) {
                respond(['success' => false, 'message' => 'A staff account is invalid.'], 422);
            }
            $username = textValue($user, 'username', 80);
            $fullName = trim((string)($user['fullName'] ?? $username));
            $role = textValue($user, 'role', 40);
            $password = (string)($user['password'] ?? '');
            $lookup = $pdo->prepare('SELECT id FROM staff_users WHERE username = ?');
            $lookup->execute([$username]);
            $currentId = $lookup->fetchColumn();

            if ($currentId === false) {
                if (strlen($password) < 6) {
                    respond(['success' => false, 'message' => 'New staff passwords must have at least 6 characters.'], 422);
                }
                $upsert->execute([$fullName, $username, password_hash($password, PASSWORD_DEFAULT), $role]);
                $lookup->execute([$username]);
                $currentId = $lookup->fetchColumn();
            } else {
                $upsert->execute([$fullName, $username, '', $role]);
                if ($password !== '') {
                    $updatePassword->execute([password_hash($password, PASSWORD_DEFAULT), $username]);
                }
            }
            $keepIds[] = (int)$currentId;
        }

        $sessionUserId = (int)($_SESSION['user_id'] ?? 0);
        $keepIds[] = $sessionUserId;
        $keepIds = array_values(array_unique(array_filter($keepIds)));
        if ($keepIds) {
            $placeholders = implode(',', array_fill(0, count($keepIds), '?'));
            $delete = $pdo->prepare("DELETE FROM staff_users WHERE id NOT IN ({$placeholders})");
            $delete->execute($keepIds);
        }
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET' && $action === 'auth-status') {
        respond([
            'success' => true,
            'role' => $_SESSION['role'] ?? null,
            'user' => $_SESSION['user'] ?? null,
        ]);
    }

    if ($method === 'GET' && $action === 'state-load') {
        $isStaff = ($_SESSION['role'] ?? '') === 'staff';
        $state = [
            'animalRecords' => loadRecords($pdo, 'animalRecords', $isStaff),
            'adoptionApplications' => [],
            'medicalRecords' => loadRecords($pdo, 'medicalRecords'),
            'careRecords' => loadRecords($pdo, 'careRecords'),
            'animalCareUsers' => [],
        ];
        if ($isStaff) {
            $state['adoptionApplications'] = loadRecords($pdo, 'adoptionApplications');
            $state['animalCareUsers'] = $pdo->query(
                'SELECT id, full_name AS fullName, username, role FROM staff_users ORDER BY id'
            )->fetchAll();
        }
        respond([
            'success' => true,
            'role' => $_SESSION['role'] ?? null,
            'state' => $state,
            'hasAnimalRecords' => (int)$pdo->query('SELECT COUNT(*) FROM animals')->fetchColumn() > 0,
            'animalCatalog' => $pdo->query('SELECT id, name, status FROM animals')->fetchAll(PDO::FETCH_ASSOC),
        ]);
    }

    if ($method !== 'POST') {
        respond(['success' => false, 'message' => 'Method not allowed.'], 405);
    }

    if ($action === 'upload-image') {
        requireStaff();
        if (!isset($_FILES['photo']) || !is_array($_FILES['photo'])) {
            respond(['success' => false, 'message' => 'No photo was uploaded.'], 422);
        }
        $file = $_FILES['photo'];
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            respond(['success' => false, 'message' => 'The photo upload failed. Please try again.'], 422);
        }
        if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
            respond(['success' => false, 'message' => 'The selected photo is larger than 2 MB.'], 422);
        }

        $info = @getimagesize($file['tmp_name']);
        $allowed = [
            IMAGETYPE_JPEG => 'jpg',
            IMAGETYPE_PNG => 'png',
            IMAGETYPE_GIF => 'gif',
            IMAGETYPE_WEBP => 'webp',
        ];
        if (!$info || !isset($allowed[$info[2]])) {
            respond(['success' => false, 'message' => 'Please upload a JPG, PNG, GIF, or WEBP image.'], 422);
        }

        $uploadDirectory = __DIR__ . '/uploads';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0775, true)) {
            respond(['success' => false, 'message' => 'The uploads folder could not be created.'], 500);
        }

        $fileName = 'animal-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$info[2]];
        $target = $uploadDirectory . DIRECTORY_SEPARATOR . $fileName;
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            respond(['success' => false, 'message' => 'The photo could not be saved on the server.'], 500);
        }

        respond(['success' => true, 'path' => 'uploads/' . $fileName]);
    }

    $data = requestData();
    $action = (string)($data['action'] ?? '');

    if ($action === 'staff-status') {
        $exists = (int)$pdo->query('SELECT COUNT(*) FROM staff_users')->fetchColumn() > 0;
        respond([
            'success' => true,
            'exists' => $exists,
            'message' => $exists
                ? 'A staff account already exists. Please use Staff Login.'
                : 'No staff account exists yet.'
        ]);
    }

    if ($action === 'staff-register') {
        $fullName = textValue($data, 'fullName', 150);
        $username = textValue($data, 'username', 80);
        $password = (string)($data['password'] ?? '');
        if (strlen($password) < 6) {
            respond(['success' => false, 'message' => 'Password must contain at least 6 characters.'], 422);
        }
        if ((int)$pdo->query('SELECT COUNT(*) FROM staff_users')->fetchColumn() > 0) {
            respond(['success' => false, 'message' => 'A staff account already exists. Please use Staff Login.'], 409);
        }
        $statement = $pdo->prepare(
            'INSERT INTO staff_users (full_name, username, password_hash, role) VALUES (?, ?, ?, "Administrator")'
        );
        $statement->execute([$fullName, $username, password_hash($password, PASSWORD_DEFAULT)]);
        session_regenerate_id(true);
        $_SESSION['role'] = 'staff';
        $_SESSION['user_id'] = (int)$pdo->lastInsertId();
        $_SESSION['user'] = [
            'id' => (int)$pdo->lastInsertId(),
            'fullName' => $fullName,
            'username' => $username,
            'role' => 'Administrator',
        ];
        respond(['success' => true, 'message' => 'Administrator account created.']);
    }

    if ($action === 'staff-login') {
        $username = textValue($data, 'username', 80);
        $password = (string)($data['password'] ?? '');
        $statement = $pdo->prepare(
            'SELECT id, full_name AS fullName, username, password_hash, role FROM staff_users WHERE username = ?'
        );
        $statement->execute([$username]);
        $user = $statement->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            respond(['success' => false, 'message' => 'Invalid username or password.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['role'] = 'staff';
        $_SESSION['user_id'] = (int)$user['id'];
        unset($user['password_hash']);
        $_SESSION['user'] = $user;
        respond(['success' => true, 'user' => $user]);
    }

    if ($action === 'adopter-register') {
        $fullName = textValue($data, 'fullName', 150);
        $email = strtolower(textValue($data, 'email', 254));
        $phone = textValue($data, 'phone', 50);
        $username = textValue($data, 'username', 80);
        $password = (string)($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6 || mb_strlen($username) < 4) {
            respond(['success' => false, 'message' => 'Please check the registration details and password requirements.'], 422);
        }
        $statement = $pdo->prepare(
            'INSERT INTO adopters (full_name, email, phone, username, password_hash) VALUES (?, ?, ?, ?, ?)'
        );
        $statement->execute([$fullName, $email, $phone, $username, password_hash($password, PASSWORD_DEFAULT)]);
        respond(['success' => true, 'message' => 'Registration successful! You can now log in.']);
    }

    if ($action === 'adopter-login') {
        $username = textValue($data, 'username', 80);
        $password = (string)($data['password'] ?? '');
        $statement = $pdo->prepare(
            'SELECT id, full_name AS fullName, email, phone, username, password_hash
             FROM adopters WHERE username = ?'
        );
        $statement->execute([$username]);
        $adopter = $statement->fetch();
        if (!$adopter || !password_verify($password, $adopter['password_hash'])) {
            respond(['success' => false, 'message' => 'Invalid username or password.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['role'] = 'adopter';
        $_SESSION['user_id'] = (int)$adopter['id'];
        unset($adopter['password_hash']);
        $_SESSION['user'] = $adopter;
        respond(['success' => true, 'user' => $adopter]);
    }

    if ($action === 'adopter-profile-update') {
        requireAdopter();
        $fullName = textValue($data, 'fullName', 150);
        $email = strtolower(textValue($data, 'email', 254));
        $phone = textValue($data, 'phone', 50);
        $username = textValue($data, 'username', 80);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($username) < 4) {
            respond(['success' => false, 'message' => 'Please check the profile details.'], 422);
        }
        $statement = $pdo->prepare(
            'UPDATE adopters SET full_name = ?, email = ?, phone = ?, username = ? WHERE id = ?'
        );
        $statement->execute([$fullName, $email, $phone, $username, (int)$_SESSION['user_id']]);
        $_SESSION['user'] = [
            'id' => (int)$_SESSION['user_id'],
            'fullName' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'username' => $username,
        ];
        respond(['success' => true, 'user' => $_SESSION['user']]);
    }

    if ($action === 'adopter-password-update') {
        requireAdopter();
        $currentPassword = (string)($data['currentPassword'] ?? '');
        $newPassword = (string)($data['newPassword'] ?? '');
        $statement = $pdo->prepare('SELECT password_hash FROM adopters WHERE id = ?');
        $statement->execute([(int)$_SESSION['user_id']]);
        $hash = $statement->fetchColumn();
        if (!$hash || !password_verify($currentPassword, $hash)) {
            respond(['success' => false, 'message' => 'Current password is incorrect.'], 401);
        }
        if (strlen($newPassword) < 6) {
            respond(['success' => false, 'message' => 'Password must contain at least 6 characters.'], 422);
        }
        $update = $pdo->prepare('UPDATE adopters SET password_hash = ? WHERE id = ?');
        $update->execute([password_hash($newPassword, PASSWORD_DEFAULT), (int)$_SESSION['user_id']]);
        respond(['success' => true, 'message' => 'Password updated successfully.']);
    }

    if ($action === 'adopter-applications') {
        requireAdopter();
        $email = strtolower((string)($_SESSION['user']['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['success' => true, 'applications' => []]);
        }
        $statement = $pdo->prepare(
            'SELECT id, applicant_name AS applicantName, first_name AS firstName, last_name AS lastName,
                    email, phone, address, animal, housing, reason, experience, status, application_date AS date
             FROM adoption_applications WHERE LOWER(email) = ? ORDER BY id DESC'
        );
        $statement->execute([$email]);
        respond(['success' => true, 'applications' => $statement->fetchAll()]);
    }

    if ($action === 'appointment-request') {
        requireAdopter();
        $fullName = trim((string)($_SESSION['user']['fullName'] ?? ''));
        $email = strtolower(trim((string)($_SESSION['user']['email'] ?? '')));
        $phone = trim((string)($_SESSION['user']['phone'] ?? ''));
        $animal = textValue($data, 'animal', 150);
        $date = trim((string)($data['date'] ?? ''));
        $time = trim((string)($data['time'] ?? ''));
        $notes = trim((string)($data['notes'] ?? ''));
        $parsedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        $parsedTime = DateTimeImmutable::createFromFormat('!H:i', $time);

        if (
            !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            !$parsedDate || $parsedDate->format('Y-m-d') !== $date ||
            !$parsedTime || $parsedTime->format('H:i') !== $time
        ) {
            respond(['success' => false, 'message' => 'Please provide a valid date and time.'], 422);
        }

        $statement = $pdo->prepare(
            'INSERT INTO appointments (adopter_id, full_name, email, phone, animal, appointment_date, appointment_time, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Pending")'
        );
        $statement->execute([
            (int)$_SESSION['user_id'],
            $fullName === '' ? 'Adopter' : $fullName,
            $email,
            $phone,
            $animal,
            $date,
            $time,
            $notes,
        ]);

        respond(['success' => true, 'message' => 'Appointment request submitted. Please wait for staff confirmation.']);
    }

    if ($action === 'my-appointments') {
        requireAdopter();
        $statement = $pdo->prepare(
            'SELECT id, animal, appointment_date AS date, appointment_time AS time, notes, status, created_at AS createdAt
             FROM appointments WHERE adopter_id = ? OR LOWER(email) = ?
             ORDER BY id DESC'
        );
        $statement->execute([
            (int)$_SESSION['user_id'],
            strtolower((string)($_SESSION['user']['email'] ?? '')),
        ]);
        respond(['success' => true, 'appointments' => $statement->fetchAll()]);
    }

    if ($action === 'appointments-list') {
        requireStaff();
        $appointments = $pdo->query(
            'SELECT id, adopter_id AS adopterId, full_name AS fullName, email, phone, animal,
                    appointment_date AS date, appointment_time AS time, notes, status, created_at AS createdAt
             FROM appointments ORDER BY id DESC'
        )->fetchAll();
        respond(['success' => true, 'appointments' => $appointments]);
    }

    if ($action === 'appointment-status-update') {
        requireStaff();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $status = trim((string)($data['status'] ?? ''));
        if ($id === false || $id <= 0) {
            respond(['success' => false, 'message' => 'Appointment ID is invalid.'], 422);
        }
        if (!in_array($status, ['Pending', 'Approved', 'Rejected', 'Completed'], true)) {
            respond(['success' => false, 'message' => 'Appointment status is invalid.'], 422);
        }
        $statement = $pdo->prepare('UPDATE appointments SET status = ? WHERE id = ?');
        $statement->execute([$status, $id]);
        respond(['success' => true, 'message' => 'Appointment status updated.']);
    }

    if ($action === 'adopter-delete') {
        requireStaff();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            respond(['success' => false, 'message' => 'Adopter ID is invalid.'], 422);
        }
        $lookup = $pdo->prepare('SELECT email FROM adopters WHERE id = ?');
        $lookup->execute([$id]);
        $adopterEmail = $lookup->fetchColumn();
        if ($adopterEmail === false) {
            respond(['success' => false, 'message' => 'Adopter account was not found.'], 404);
        }
        $removeAppointments = $pdo->prepare(
            'DELETE FROM appointments WHERE adopter_id = ? OR LOWER(email) = LOWER(?)'
        );
        $removeAppointments->execute([$id, (string)$adopterEmail]);
        $statement = $pdo->prepare('DELETE FROM adopters WHERE id = ?');
        $statement->execute([$id]);
        respond(['success' => true, 'message' => 'Adopter account deleted.']);
    }

    if ($action === 'adopters-list') {
        requireStaff();
        $adopters = $pdo->query(
            'SELECT a.id, a.full_name AS fullName, a.email, a.phone, a.username, a.created_at AS createdAt,
                    (SELECT COUNT(*) FROM adoption_applications p WHERE LOWER(p.email) = LOWER(a.email)) AS applicationCount
             FROM adopters a ORDER BY a.id DESC'
        )->fetchAll();
        respond(['success' => true, 'adopters' => $adopters]);
    }

    if ($action === 'application-submit') {
        $application = $data['application'] ?? null;
        if (!is_array($application)) {
            respond(['success' => false, 'message' => 'Application details are missing.'], 422);
        }
        $animalName = textValue($application, 'animal', 150);
        $animalCount = (int)$pdo->query('SELECT COUNT(*) FROM animals')->fetchColumn();
        if ($animalCount > 0) {
            $availableAnimal = $pdo->prepare(
                "SELECT COUNT(*) FROM animals WHERE LOWER(name) = LOWER(?) AND LOWER(TRIM(status)) = 'available'"
            );
            $availableAnimal->execute([$animalName]);
            if ((int)$availableAnimal->fetchColumn() === 0) {
                respond(['success' => false, 'message' => 'That animal is no longer available for adoption.'], 409);
            }
        }
        insertPublicApplications($pdo, [$application]);
        respond(['success' => true, 'message' => 'Application submitted successfully.']);
    }

    if ($action === 'application-status-update') {
        requireStaff();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $status = trim((string)($data['status'] ?? ''));
        if ($id === false || $id <= 0) {
            respond(['success' => false, 'message' => 'Application ID is invalid.'], 422);
        }
        if (!in_array($status, ['Approved', 'Rejected'], true)) {
            respond(['success' => false, 'message' => 'Application status is invalid.'], 422);
        }

        $applicationStatement = $pdo->prepare('SELECT applicant_name AS applicantName, email, animal FROM adoption_applications WHERE id = ?');
        $applicationStatement->execute([$id]);
        $application = $applicationStatement->fetch(PDO::FETCH_ASSOC);
        if (!$application) {
            respond(['success' => false, 'message' => 'Application was not found.'], 404);
        }

        $statement = $pdo->prepare('UPDATE adoption_applications SET status = ? WHERE id = ?');
        $statement->execute([$status, $id]);

        if ($status === 'Approved') {
            $markAdopted = $pdo->prepare(
                'UPDATE animals SET status = "Adopted" WHERE LOWER(name) = LOWER(?)'
            );
            $markAdopted->execute([(string)($application['animal'] ?? '')]);
        }

        $email = trim((string)($application['email'] ?? ''));
        $applicantName = trim((string)($application['applicantName'] ?? 'Applicant'));
        $animalName = trim((string)($application['animal'] ?? 'this animal'));

        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            try {
                sendApplicationStatusNotification($email, $applicantName, $animalName, $status);
            } catch (Throwable $exception) {
                error_log('Application status email failure: ' . $exception->getMessage());
            }
        }

        respond(['success' => true, 'message' => 'Application status updated.']);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        respond(['success' => true]);
    }

    if ($action === 'state-save') {
        $key = (string)($data['key'] ?? '');
        $rows = $data['value'] ?? null;
        if (!is_array($rows) || !isSequentialList($rows)) {
            respond(['success' => false, 'message' => 'Data collection must be an array.'], 422);
        }
        if ($key === 'adoptionApplications' && ($_SESSION['role'] ?? '') !== 'staff') {
            insertPublicApplications($pdo, $rows);
            respond(['success' => true]);
        }
        requireStaff();
        if ($key === 'animalCareUsers') {
            saveStaffUsers($pdo, $rows);
            respond(['success' => true]);
        }
        if (!in_array($key, ['animalRecords', 'adoptionApplications', 'medicalRecords', 'careRecords'], true)) {
            respond(['success' => false, 'message' => 'Unknown data collection.'], 400);
        }
        $pdo->beginTransaction();
        try {
            saveRows($pdo, $key, $rows);
            $pdo->commit();
        } catch (Throwable $exception) {
            $pdo->rollBack();
            throw $exception;
        }
        respond(['success' => true]);
    }

    if ($action === 'legacy-import') {
        requireStaff();
        $state = is_array($data['state'] ?? null) ? $data['state'] : [];
        $pdo->beginTransaction();
        try {
            foreach (['animalRecords', 'adoptionApplications', 'medicalRecords', 'careRecords'] as $key) {
                $rows = $state[$key] ?? [];
                if (!is_array($rows) || $rows === []) {
                    continue;
                }
                $count = (int)$pdo->query([
                    'animalRecords' => 'SELECT COUNT(*) FROM animals',
                    'adoptionApplications' => 'SELECT COUNT(*) FROM adoption_applications',
                    'medicalRecords' => 'SELECT COUNT(*) FROM medical_records',
                    'careRecords' => 'SELECT COUNT(*) FROM care_records',
                ][$key])->fetchColumn();
                if ($count === 0) {
                    saveRows($pdo, $key, $rows);
                }
            }

            foreach (($state['animalCareAdopters'] ?? []) as $adopter) {
                if (!is_array($adopter) || empty($adopter['password'])) {
                    continue;
                }
                $email = strtolower((string)($adopter['email'] ?? ''));
                $username = (string)($adopter['username'] ?? '');
                if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $username === '') {
                    continue;
                }
                $insertAdopter = $pdo->prepare(
                    'INSERT IGNORE INTO adopters (full_name, email, phone, username, password_hash)
                     VALUES (?, ?, ?, ?, ?)'
                );
                $insertAdopter->execute([
                    (string)($adopter['fullName'] ?? $username),
                    $email,
                    (string)($adopter['phone'] ?? ''),
                    $username,
                    password_hash((string)$adopter['password'], PASSWORD_DEFAULT),
                ]);
            }
            foreach (($state['animalCareUsers'] ?? []) as $user) {
                if (!is_array($user) || empty($user['password'])) {
                    continue;
                }
                $username = (string)($user['username'] ?? '');
                $password = (string)$user['password'];
                if (
                    $username === '' ||
                    $username === (string)($_SESSION['user']['username'] ?? '') ||
                    ($username === 'admin' && $password === 'admin123')
                ) {
                    continue;
                }
                $insertStaff = $pdo->prepare(
                    'INSERT IGNORE INTO staff_users (full_name, username, password_hash, role)
                     VALUES (?, ?, ?, ?)'
                );
                $insertStaff->execute([
                    (string)($user['fullName'] ?? $username),
                    $username,
                    password_hash($password, PASSWORD_DEFAULT),
                    (string)($user['role'] ?? 'Staff'),
                ]);
            }
            $pdo->commit();
        } catch (Throwable $exception) {
            $pdo->rollBack();
            throw $exception;
        }
        respond(['success' => true]);
    }

    respond(['success' => false, 'message' => 'Unknown API action.'], 404);
} catch (PDOException $exception) {
    error_log('Animal Care API database error: ' . $exception->getMessage());
    $duplicate = $exception->getCode() === '23000';
    respond([
        'success' => false,
        'message' => $duplicate
            ? 'That username or email is already in use.'
            : 'The database could not complete the request. Check the XAMPP database setup.',
    ], $duplicate ? 409 : 500);
} catch (Throwable $exception) {
    error_log('Animal Care API error: ' . $exception->getMessage());
    respond(['success' => false, 'message' => 'The request could not be completed. Check the PHP error log.'], 500);
}
