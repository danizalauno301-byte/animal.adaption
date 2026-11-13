<?php
declare(strict_types=1);

$databaseHost = getenv('ANIMAL_CARE_DB_HOST') ?: '127.0.0.1';
$databaseName = getenv('ANIMAL_CARE_DB_NAME') ?: 'animal_care_db';
$databaseUser = getenv('ANIMAL_CARE_DB_USER') ?: 'root';
$databasePassword = getenv('ANIMAL_CARE_DB_PASSWORD') ?: '';

try {
    $pdo = new PDO(
        "mysql:host={$databaseHost};dbname={$databaseName};charset=utf8mb4",
        $databaseUser,
        $databasePassword,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $exception) {
    error_log('Animal Care database connection failed: ' . $exception->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Check XAMPP MySQL and db-config.php.',
    ]);
    exit;
}

/*
 * Keep existing installations up to date without requiring a manual
 * database migration. New installs already include these objects in
 * database.sql.
 */
try {
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS appointments (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            adopter_id BIGINT UNSIGNED NULL,
            full_name VARCHAR(150) NOT NULL,
            email VARCHAR(191) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            animal VARCHAR(150) NOT NULL,
            appointment_date VARCHAR(20) NOT NULL,
            appointment_time VARCHAR(20) NOT NULL,
            notes TEXT NOT NULL,
            status VARCHAR(40) NOT NULL DEFAULT "Pending",
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB'
    );

    $hasImageColumn = $pdo->query("SHOW COLUMNS FROM animals LIKE 'image'")->fetch();
    if (!$hasImageColumn) {
        $pdo->exec('ALTER TABLE animals ADD COLUMN image VARCHAR(255) NOT NULL DEFAULT ""');
    }
} catch (Throwable $exception) {
    error_log('Animal Care schema check failed: ' . $exception->getMessage());
}
