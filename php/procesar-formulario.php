<?php
// --- CONFIGURACIÓN ---
$destinatario = "booker1@contactobasico.com";
// Para el correcto funcionamiento del CAPTCHA, añade tu clave secreta de reCAPTCHA de Google aquí
$recaptcha_secret_key = 'TU_CLAVE_SECRETA_DE_RECAPTCHA';

// --- VALIDACIÓN INICIAL DE DATOS ---
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(403); // Forbidden
    echo "Acceso no permitido.";
    exit;
}

// --- VALIDACIÓN DE RECAPTCHA ---
if (isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response'])) {
    $recaptcha_response = $_POST['g-recaptcha-response'];

    $verification_url = 'https://www.google.com/recaptcha/api/siteverify';
    $verification_data = [
        'secret'   => $recaptcha_secret_key,
        'response' => $recaptcha_response,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($verification_data)
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($verification_url, false, $context);
    $result_json = json_decode($result, true);

    if ($result_json['success'] !== true) {
        http_response_code(400); // Bad Request
        echo "Verificación de reCAPTCHA fallida. Por favor, inténtalo de nuevo.";
        exit;
    }
} else {
    http_response_code(400); // Bad Request
    echo "Por favor, completa el reCAPTCHA.";
    exit;
}

// --- VALIDACIÓN DE CONSENTIMIENTOS ---
if (!isset($_POST['data-consent'])) {
    http_response_code(400); // Bad Request
    echo "Debes aceptar las políticas de tratamiento de datos para continuar.";
    exit;
}

if (!isset($_POST['communication-consent'])) {
    http_response_code(400); // Bad Request
    echo "Debes autorizar la comunicación para continuar.";
    exit;
}


// Limpiar y validar los datos recibidos del formulario
$nombre = trim(filter_var($_POST['name'], FILTER_SANITIZE_STRING));
$email = trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
$telefono = trim(filter_var($_POST['phone'], FILTER_SANITIZE_STRING));
$edad = trim(filter_var($_POST['age'], FILTER_SANITIZE_NUMBER_INT));
$altura = trim(filter_var($_POST['height'], FILTER_SANITIZE_NUMBER_INT));
$peso = trim(filter_var($_POST['weight'], FILTER_SANITIZE_NUMBER_INT));
$busto = trim(filter_var($_POST['bust'], FILTER_SANITIZE_NUMBER_INT));
$cintura = trim(filter_var($_POST['waist'], FILTER_SANITIZE_NUMBER_INT));
$caderas = trim(filter_var($_POST['hips'], FILTER_SANITIZE_NUMBER_INT));
$talla_zapato = trim(filter_var($_POST['shoe-size'], FILTER_SANITIZE_STRING));
$portafolio = trim(filter_var($_POST['portfolio'], FILTER_SANITIZE_URL));
$instagram = trim(filter_var($_POST['instagram'], FILTER_SANITIZE_STRING));
$experiencia = trim(filter_var($_POST['experience'], FILTER_SANITIZE_STRING));
$habilidades = trim(filter_var($_POST['skills'], FILTER_SANITIZE_STRING));
$sobre_ti = trim(filter_var($_POST['about'], FILTER_SANITIZE_STRING));

// Validar que los campos requeridos no estén vacíos y el email sea válido
if (empty($nombre) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($telefono) || empty($edad) || empty($altura) || empty($peso) || empty($sobre_ti)) {
    http_response_code(400); // Bad Request
    echo "Por favor, completa todos los campos obligatorios con información válida.";
    exit;
}

// --- MANEJO DE ARCHIVOS ---
$adjuntos = [];
$upload_dir = '../uploads/'; // Asegúrate de que esta carpeta exista y tenga permisos de escritura
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$allowed_types = ['image/jpeg', 'image/png', 'image/webp'];

function process_upload($file_key, $upload_dir, $allowed_types, &$adjuntos) {
    if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] == UPLOAD_ERR_OK) {
        $file_tmp_path = $_FILES[$file_key]['tmp_name'];
        $file_name = $_FILES[$file_key]['name'];
        $file_type = $_FILES[$file_key]['type'];

        if (in_array($file_type, $allowed_types)) {
            $new_file_name = uniqid() . '-' . $file_name;
            $dest_path = $upload_dir . $new_file_name;

            if (move_uploaded_file($file_tmp_path, $dest_path)) {
                $adjuntos[$file_key] = $dest_path;
                return $new_file_name;
            }
        }
    }
    return null;
}

$headshot_filename = process_upload('headshot', $upload_dir, $allowed_types, $adjuntos);
$sideprofile_filename = process_upload('sideprofile', $upload_dir, $allowed_types, $adjuntos);
$fulllength_filename = process_upload('fulllength', $upload_dir, $allowed_types, $adjuntos);


// --- PREPARACIÓN Y ENVÍO DEL CORREO ---
$asunto = "Nueva aplicación de modelo: " . $nombre;

// Cabeceras para email con adjuntos
$boundary = md5(time());
$headers = "From: Formulario Web <no-reply@contactobasico.com>\r\n";
$headers .= "Reply-to: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";

// Cuerpo del mensaje en formato HTML
$cuerpo_mensaje = "--" . $boundary . "\r\n";
$cuerpo_mensaje .= "Content-Type: text/html; charset=UTF-8\r\n";
$cuerpo_mensaje .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$cuerpo_mensaje .= "<html><body>";
$cuerpo_mensaje .= "<h2>Nueva aplicación de modelo</h2>";
$cuerpo_mensaje .= "<p><strong>Nombre:</strong> " . $nombre . "</p>";
$cuerpo_mensaje .= "<p><strong>Email:</strong> " . $email . "</p>";
$cuerpo_mensaje .= "<p><strong>Teléfono:</strong> " . $telefono . "</p>";
$cuerpo_mensaje .= "<hr>";
$cuerpo_mensaje .= "<h3>Medidas y Datos</h3>";
$cuerpo_mensaje .= "<ul>";
$cuerpo_mensaje .= "<li><strong>Edad:</strong> " . ($edad ? $edad : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Altura (cm):</strong> " . ($altura ? $altura : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Peso (kg):</strong> " . ($peso ? $peso : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Busto (cm):</strong> " . ($busto ? $busto : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Cintura (cm):</strong> " . ($cintura ? $cintura : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Caderas (cm):</strong> " . ($caderas ? $caderas : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "<li><strong>Talla de zapato:</strong> " . ($talla_zapato ? $talla_zapato : "No proporcionado") . "</li>";
$cuerpo_mensaje .= "</ul>";
$cuerpo_mensaje .= "<hr>";
$cuerpo_mensaje .= "<h3>Experiencia y Redes</h3>";
$cuerpo_mensaje .= "<p><strong>Portafolio:</strong> " . ($portafolio ? '<a href="' . $portafolio . '">' . $portafolio . '</a>' : "No proporcionado") . "</p>";
$cuerpo_mensaje .= "<p><strong>Instagram:</strong> " . ($instagram ? '<a href="https://instagram.com/' . $instagram . '">@' . $instagram . '</a>' : "No proporcionado") . "</p>";
$cuerpo_mensaje .= "<p><strong>Experiencia:</strong><br>" . ($experiencia ? nl2br($experiencia) : "No proporcionado") . "</p>";
$cuerpo_mensaje .= "<p><strong>Habilidades especiales:</strong><br>" . ($habilidades ? nl2br($habilidades) : "No proporcionado") . "</p>";
$cuerpo_mensaje .= "<p><strong>Sobre el/la modelo:</strong><br>" . ($sobre_ti ? nl2br($sobre_ti) : "No proporcionado") . "</p>";
$cuerpo_mensaje .= "</body></html>\r\n";

// Adjuntar archivos al correo
foreach ($adjuntos as $key => $path) {
    if (file_exists($path)) {
        $file_content = file_get_contents($path);
        $file_name = basename($path);
        $cuerpo_mensaje .= "--" . $boundary . "\r\n";
        $cuerpo_mensaje .= "Content-Type: " . mime_content_type($path) . "; name=\"" . $file_name . "\"\r\n";
        $cuerpo_mensaje .= "Content-Disposition: attachment; filename=\"" . $file_name . "\"\r\n";
        $cuerpo_mensaje .= "Content-Transfer-Encoding: base64\r\n";
        $cuerpo_mensaje .= "X-Attachment-Id: " . rand(1000, 99999) . "\r\n\r\n";
        $cuerpo_mensaje .= chunk_split(base64_encode($file_content));
    }
}

$cuerpo_mensaje .= "--" . $boundary . "--";


if (mail($destinatario, $asunto, $cuerpo_mensaje, $headers)) {
    http_response_code(200);
    echo "¡Gracias! Tu aplicación ha sido recibida correctamente.";
} else {
    http_response_code(500);
    echo "Hubo un problema al enviar tu aplicación. Por favor, inténtalo de nuevo más tarde.";
}

// Opcional: Limpiar los archivos subidos después de enviarlos
foreach ($adjuntos as $path) {
    if (file_exists($path)) {
        unlink($path);
    }
}

?>
