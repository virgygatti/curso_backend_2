const fs = require('fs').promises;
const path = require('path');

/**
 * Lee un archivo JSON y retorna su contenido parseado
 * @param {string} filePath - Ruta del archivo a leer
 * @returns {Promise<Array|Object>} Contenido del archivo parseado
 */
async function readFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    const data = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Escribe datos en un archivo JSON
 * @param {string} filePath - Ruta del archivo a escribir
 * @param {Array|Object} data - Datos a escribir
 * @returns {Promise<void>}
 */
async function writeFile(filePath, data) {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(fullPath, jsonData, 'utf-8');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  readFile,
  writeFile
};
