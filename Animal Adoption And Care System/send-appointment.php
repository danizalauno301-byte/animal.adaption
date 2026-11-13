
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json");

require __DIR__ . "/PHPMailer/src/Exception.php";
require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";
require __DIR__ . "/PHPMailer/mail-config.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$date = trim($data["date"] ?? "");
$time = trim($data["time"] ?? "");

if (!filter_var($email, FILTER_VALIDATE_EMAIL) ||
    $name === "" || $date === "" || $time === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please complete all appointment details."]);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = $gmailEmail;
    $mail->Password = $gmailPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom($gmailEmail, "Animal Adoption and Care System");
    $mail->addAddress($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "Proposed Adoption Meeting Appointment";
    $mail->Body = "
        <h2>Appointment Notification</h2>
        <p>Hello " . htmlspecialchars($name) . ",</p>
        <p>We would like to schedule a meeting with you regarding your adoption application.</p>
        <p><strong>Date:</strong> " . htmlspecialchars($date) . "</p>
        <p><strong>Time:</strong> " . htmlspecialchars($time) . "</p>
        <p>Please reply to this email to confirm whether the proposed schedule works for you.</p>
        <p>Thank you!</p>
        <p>Animal Adoption and Care System</p>
    ";

    $mail->send();

    echo json_encode(["success" => true, "message" => "Appointment email sent successfully."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Email could not be sent. Please check your SMTP settings."]);
}
