<?php
// Establecer la cabecera para asegurar que la salida sea JSON
header('Content-Type: application/json; charset=utf-8');

// --- CONFIGURACIÓN ---
// Ruta al archivo JSON que contiene los datos de los modelos.
$json_path = __DIR__ . '/models/models.json';

// --- LÓGICA PRINCIPAL ---

// 1. Leer y decodificar el archivo JSON
if (!file_exists($json_path)) {
    // Si el archivo no existe, devolver un error y terminar la ejecución.
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'La base de datos de modelos (models.json) no se encuentra.']);
    exit;
}

// Leer el contenido del archivo. file_get_contents es más rápido si el archivo no es muy grande.
$json_data = file_get_contents($json_path);
// Decodificar el JSON a un array asociativo de PHP.
$models = json_decode($json_data, true);

// Verificar si hubo un error en la decodificación del JSON.
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al decodificar el archivo JSON: ' . json_last_error_msg()]);
    exit;
}

// 2. Filtrar los datos según los parámetros GET
$filtered_models = [];

if (isset($_GET['genero'])) {
    // Filtrar por género (hombres o mujeres)
    $genero = strtolower($_GET['genero']);
    if ($genero === 'hombres' || $genero === 'mujeres') {
        // Usar array_filter para iterar sobre los modelos y devolver solo los que coincidan.
        // La comparación se hace insensible a mayúsculas/minúsculas.
        $target_genero = ($genero === 'hombres') ? 'hombre' : 'mujer';
        $filtered_models = array_values(array_filter($models, function ($model) use ($target_genero) {
            return strtolower($model['genero']) === $target_genero;
        }));
    } else {
        // Si el parámetro 'genero' no es válido
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Parámetro de género no válido. Use "hombres" o "mujeres".']);
        exit;
    }

} elseif (isset($_GET['id'])) {
    // Filtrar por un ID de modelo específico
    $id = $_GET['id'];
    // Usar array_filter para encontrar el modelo que coincida con el ID.
    $result = array_filter($models, function ($model) use ($id) {
        // Comparar el id del modelo con el id proporcionado.
        return (string)$model['id'] === (string)$id;
    });

    if (!empty($result)) {
        // Si se encuentra un resultado, devolver solo ese objeto.
        // array_values para resetear las claves del array y obtener el primer elemento.
        $filtered_models = array_values($result)[0];
    } else {
        // Si no se encuentra ningún modelo con ese ID, devolver un error.
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Modelo con id ' . htmlspecialchars($id) . ' no encontrado.']);
        exit;
    }

} else {
    // Si no se proporcionan parámetros de filtrado, devolver todos los modelos.
    $filtered_models = $models;
}

// 3. Devolver los datos filtrados como JSON
// json_encode convierte el array de PHP de nuevo a formato JSON.
// JSON_PRETTY_PRINT hace que la salida sea más legible (opcional).
// JSON_UNESCAPED_UNICODE para manejar correctamente caracteres como tildes.
echo json_encode($filtered_models, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>
