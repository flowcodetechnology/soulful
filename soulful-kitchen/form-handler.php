<?php
declare(strict_types=1);

$TO_EMAIL = 'hello@soulfulkitchen.example';
$DATA_DIR = __DIR__ . '/data';
$CSV_FILE = $DATA_DIR . '/submissions.csv';
$SUCCESS_REDIRECT = 'success.html';

function is_json_request(): bool {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    return stripos($contentType, 'application/json') !== false;
}

function get_request_payload(): array {
    if (is_json_request()) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?? '', true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}

function sanitize(string $value): string {
    $clean = trim($value);
    $clean = strip_tags($clean);
    $clean = preg_replace('/[\r\n]+/', ' ', $clean);
    return $clean ?? '';
}

function respond_json(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function ensure_storage(string $dir, string $file): void {
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    if (!file_exists($file)) {
        $fh = fopen($file, 'a');
        if ($fh) {
            fputcsv($fh, ['submittedAt','name','email','phone','date','guests','location','referral','source','notes']);
            fclose($fh);
        }
    }
}

$data = array_map(fn($value) => is_string($value) ? sanitize($value) : $value, get_request_payload());

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$date = $data['date'] ?? '';
$guests = $data['guests'] ?? '';
$location = $data['location'] ?? '';
$referral = $data['referral'] ?? '';
$source = $data['source'] ?? ($_POST ? 'form' : '');
$notes = $data['notes'] ?? '';

$errors = [];
if ($name === '') {
    $errors['name'] = 'Name is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Valid email is required.';
}
if ($phone === '') {
    $errors['phone'] = 'Phone is required.';
}

$isAjax = is_json_request();

if ($errors) {
    if ($isAjax) {
        respond_json(['ok' => false, 'error' => 'Validation failed', 'fields' => $errors], 422);
    }
    $query = http_build_query(['error' => 'validation']);
    header('Location: ' . $SUCCESS_REDIRECT . '?' . $query);
    exit;
}

ensure_storage($DATA_DIR, $CSV_FILE);

$timestamp = date('c');
$csvRow = [$timestamp, $name, $email, $phone, $date, $guests, $location, $referral, $source, $notes];
$csvSaved = false;
if ($fh = fopen($CSV_FILE, 'a')) {
    $csvSaved = fputcsv($fh, $csvRow) !== false;
    fclose($fh);
}

$emailSubject = 'New Soulful Kitchen Inquiry';
$emailBody = "Soulful Kitchen inquiry received\n\n" .
    "Name: {$name}\n" .
    "Email: {$email}\n" .
    "Phone: {$phone}\n" .
    "Event date: {$date}\n" .
    "Guests: {$guests}\n" .
    "Location: {$location}\n" .
    "Referral: {$referral}\n" .
    "Source: {$source}\n" .
    "Notes: {$notes}\n" .
    "Submitted at: {$timestamp}\n";

$emailHeaders = 'From: Soulful Kitchen <no-reply@soulfulkitchen.example>' . "\r\n" .
    'Reply-To: ' . $email;

$emailSent = @mail($TO_EMAIL, $emailSubject, $emailBody, $emailHeaders);

if ($isAjax) {
    respond_json(['ok' => true, 'email_sent' => $emailSent, 'csv_saved' => $csvSaved]);
}

header('Location: ' . $SUCCESS_REDIRECT . '?submitted=1');
exit;
