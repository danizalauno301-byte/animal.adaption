# Run Animal Care with XAMPP

## 1. Put the project under Apache

The project is currently linked from XAMPP's `htdocs` directory at:

```text
C:\xampp\htdocs\Daniza
```

Open the XAMPP Control Panel and start **Apache** and **MySQL**, then visit `http://localhost/Daniza/`. On this machine Apache is configured to listen on port **8080**, so the URL is `http://localhost:8080/Daniza/`. If you move the project to another machine, copy its folder into XAMPP's `htdocs` directory at the same path. Do not open the HTML files directly or use a static file server; the PHP API and database-backed login require Apache/PHP.

## 2. Create the database

Open `http://localhost/phpmyadmin` (or `http://localhost:8080/phpmyadmin` when Apache uses port 8080), select **Import**, choose `database.sql` from this project, and run the import. This creates the `animal_care_db` database and its tables.

If you already have an older copy of the database, simply opening the system once runs a safe auto-migration that adds the `animals.image` column and the `appointments` table.

The default XAMPP settings are configured in `db-config.php`:

- Host: `127.0.0.1`
- Database: `animal_care_db`
- Username: `root`
- Password: blank

If your MySQL credentials differ, set the `ANIMAL_CARE_DB_HOST`, `ANIMAL_CARE_DB_NAME`, `ANIMAL_CARE_DB_USER`, and `ANIMAL_CARE_DB_PASSWORD` environment variables for Apache/PHP.

## 3. Open and initialize the system

Visit `http://localhost/Daniza/`. Use **Admin Access → Create Admin Account** to create the first staff account. Only the first account can be registered through this page; later staff accounts are managed from the dashboard. Adopter accounts can be registered from the adopter registration page.

Passwords are stored as PHP password hashes. Staff and adopter logins use server-side PHP sessions.

## 4. Configure SMTP email

The staff dashboard sends proposed adoption meeting emails using PHPMailer. Install Composer, then run this from the project folder:

```powershell
cd C:\xampp\htdocs\Daniza
composer install --no-dev
```

`composer.json` and `composer.lock` pin the mailer dependency. If Composer reports that ZIP support is missing, enable `extension=zip` in `C:\xampp\php\php.ini` and restart the command.

To set Gmail's SMTP variables without writing credentials into the project or chat, run this from PowerShell:

```powershell
cd C:\Users\User\Music\Daniza
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\configure-smtp.ps1
```

The execution-policy option applies only to this PowerShell process; it does not change your system's saved policy. Enter the Gmail address and a Google App Password when prompted. The password prompt is hidden. The script saves the settings in your Windows user environment; don't share that App Password or commit it to source control. Alternatively, you can set these variables yourself in **System Properties → Environment Variables**:

- `SMTP_HOST` — Gmail: `smtp.gmail.com`
- `SMTP_PORT` — Gmail STARTTLS: `587`
- `SMTP_ENCRYPTION` — `tls` for STARTTLS, or `ssl` for implicit TLS
- `SMTP_USERNAME` — the full Gmail address used to send email
- `SMTP_PASSWORD` — the Google App Password for that account; do not share or commit it
- `SMTP_FROM_EMAIL` — the same authorized sender address
- `SMTP_FROM_NAME` — optional sender display name

Close and reopen the XAMPP Control Panel, then restart Apache so PHP receives the variables. SMTP settings are read by `smtp-config.php`; the default host, port, and encryption are configured for Gmail, but you must supply your own authorized account and App Password. Only a logged-in staff account can send appointment emails.

## Existing browser data

When the first administrator registers, the app attempts to import existing animal, application, care, medical, staff, and adopter data from that browser profile's `localStorage` into MySQL. Staff and adopter passwords are re-hashed during import. Browser storage is isolated by site origin, so this only works when the old data is available to the same origin and browser profile; data on other computers, profiles, or previous origins must be exported separately.

## Troubleshooting

- If the app shows a database connection error, confirm **MySQL** is running and that the credentials in `db-config.php` match.
- If PHP reports that the MySQL PDO driver is unavailable, enable/install `pdo_mysql` in the PHP used by Apache. XAMPP's bundled PHP normally includes it.
- If appointment emails report that PHPMailer is missing, install Composer dependencies as shown above.
- If SMTP is not configured, check the `SMTP_*` environment variables and restart Apache. Gmail requires two-step verification and an App Password.
- If the browser shows a 404 for `api.php`, confirm the folder is under `htdocs` and access it through `http://localhost/...`.
