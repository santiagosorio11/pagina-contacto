<?php
// --- CONFIGURACIÓN ---
$destinatario = "booker1@contactobasico.com";

// --- VALIDACIÓN INICIAL DE DATOS ---
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(403); // Forbidden
    echo "Acceso no permitido.";
    exit;
}

// Limpiar y validar los datos recibidos del formulario para evitar inyecciones de código
$nombre = trim(filter_var($_POST['name'], FILTER_SANITIZE_STRING));
$email = trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
$telefono = trim(filter_var($_POST['phone'], FILTER_SANITIZE_STRING));
$portafolio = trim(filter_var($_POST['portfolio'], FILTER_SANITIZE_URL));
$mensaje = trim(filter_var($_POST['message'], FILTER_SANITIZE_STRING));

// Validar que los campos requeridos no estén vacíos y el email sea válido
if (empty($nombre) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($telefono)) {
    http_response_code(400); // Bad Request
    echo "Por favor, completa todos los campos obligatorios con información válida.";
    exit;
}

// --- PREPARACIÓN Y ENVÍO DEL CORREO ---
$asunto = "Nueva aplicación de modelo: " . $nombre;
$cuerpo_mensaje = "Has recibido una nueva aplicación de un/a posible modelo:\n\n";
$cuerpo_mensaje .= "Nombre: " . $nombre . "\n";
$cuerpo_mensaje .= "Email: " . $email . "\n";
$cuerpo_mensaje .= "Teléfono: " . $telefono . "\n";
$cuerpo_mensaje .= "Enlace de Portafolio: " . ($portafolio ? $portafolio : "No proporcionado") . "\n\n";
$cuerpo_mensaje .= "Mensaje:\n" . $mensaje . "\n";

$headers = "From: Formulario Web <no-reply@contactobasico.com>\r\n";
$headers .= "Reply-to: " . $email . "\r\n";
$headers .= "Content-type: text/plain; charset=utf-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

if (mail($destinatario, $asunto, $cuerpo_mensaje, $headers)) {
    // La base de datos se ha comentado, si desea implementarla en un futuro, descomente las siguientes lineas y rellene los datos
    /*
    try {
        $servername = "localhost";
        $username = "tu_usuario_de_bd";
        $password = "tu_contraseña_de_bd";
        $dbname = "tu_nombre_de_bd";

        $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("INSERT INTO aplicaciones (nombre_completo, email, telefono, enlace_portafolio, mensaje) VALUES (:nombre, :email, :telefono, :portafolio, :mensaje)");
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':portafolio', $portafolio);
        $stmt->bindParam(':mensaje', $mensaje);
        $stmt->execute();

    } catch(PDOException $e) {
        // Opcional: Registrar el error en un log del servidor.
        error_log("Error al guardar en BD: " . $e->getMessage());
    } finally {
        $conn = null;
    }
    */

    http_response_code(200);
    echo "¡Gracias! Tu aplicación ha sido recibida correctamente.";

} else {
    // Si falla el envío del correo, informamos del error.
    http_response_code(500);
    echo "Hubo un problema al enviar tu aplicación. Por favor, inténtalo de nuevo más tarde.";
}
?>