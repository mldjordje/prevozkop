<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $ime = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $naslov = isset($_POST['subject']) ? trim($_POST['subject']) : '';
    $telefon = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $poruka = isset($_POST['message']) ? trim($_POST['message']) : '';
    $vrstaBetona = isset($_POST['beton']) ? trim($_POST['beton']) : 'Nije izabrano';

    // Validacija podataka
    if (empty($ime) || empty($email) || empty($naslov) || empty($poruka)) {
        echo "Sva obavezna polja moraju biti popunjena!";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Neispravan format email adrese!";
        exit;
    }

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    // Email primaoc
    $primalac = "prevozkopbb@gmail.com";

    // Naslov emaila
    $naslovEmaila = "Nova poruka sa kontakt forme: " . $naslov;

    // Sadr弔aj emaila
    $sadrzajEmaila = "Primili ste novu poruku sa va分e kontakt forme na sajtu\n";
    $sadrzajEmaila .= "=============================================" . "\n\n";
    $sadrzajEmaila .= "Ime i prezime: $ime\n";
    $sadrzajEmaila .= "Email: $email\n";
    $sadrzajEmaila .= "Telefon: $telefon\n";
    $sadrzajEmaila .= "Naslov: $naslov\n";
    $sadrzajEmaila .= "Vrsta betona: $vrstaBetona\n";
    $sadrzajEmaila .= "Poruka:\n$poruka\n";

    // Zaglavlje emaila
    $zaglavlje = "From: $ime <$email>\r\n";
    $zaglavlje .= "Reply-To: $email\r\n";
    $zaglavlje .= "X-Mailer: PHP/" . phpversion();

    // Slanje emaila
   if (mail($primalac, $naslovEmaila, $sadrzajEmaila, $zaglavlje)) {
        echo "Y"; // Uspešno poslato
    } else {
        echo "N"; // Neuspešno
    }
} else {
    echo "Neispravan zahtev!";
}
?>
