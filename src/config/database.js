const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backend1';

/**
 * Conecta a MongoDB. Si no está instalado o no está en ejecución, el servidor
 * arranca igual (se usa persistencia en archivos hasta que migres a Mongoose).
 */
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB conectado');
    return true;
  } catch (err) {
    console.warn('⚠️  MongoDB no disponible:', err.message);
    if (err.message && err.message.includes('auth')) {
      console.warn('   Revisa en Atlas: Database Access → usuario y contraseña correctos.');
      console.warn('   Si la contraseña tiene @ # : / etc., codifícala en la URI: @ → %40, # → %23');
    } else {
      console.warn('   El servidor sigue con persistencia en archivos. Para usar MongoDB:');
      console.warn('   - Atlas → https://www.mongodb.com/cloud/atlas');
      console.warn('   - Network Access en Atlas: agrega tu IP o 0.0.0.0/0');
    }
    return false;
  }
}

module.exports = { connect, MONGODB_URI };
