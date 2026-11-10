import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas using Mongoose
 * Uses process.env.MONGO_URI and specifies the 'spendwise' database.
 */
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables (server/.env).');
    }

    // Auto-strip accidental angle brackets around password if copied literally from Atlas instructions
    if (mongoUri.includes(':<') && mongoUri.includes('>@')) {
      mongoUri = mongoUri.replace(/:<([^>]+)>@/, ':$1@');
    }

    // Detect unreplaced placeholder values
    if (
      mongoUri.includes('USERNAME') ||
      mongoUri.includes('PASSWORD') ||
      mongoUri.includes('CLUSTER_URL') ||
      mongoUri.includes('<username>') ||
      mongoUri.includes('<password>')
    ) {
      throw new Error(
        'Placeholder values detected in MONGO_URI (USERNAME, PASSWORD, or CLUSTER_URL). ' +
        'Please replace them in server/.env with your actual MongoDB Atlas cluster credentials.'
      );
    }

    // Connect to MongoDB Atlas with the target database explicitly set to 'spendwise'
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'spendwise',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB Atlas Connected]: Successfully connected to database "${conn.connection.name}" on host "${conn.connection.host}"`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas Connection Error]: ${error.message}`);

    // Provide specific diagnostic instructions for the common Atlas SSL Alert 80 (IP Whitelist)
    if (
      error.message.includes('SSL alert number 80') ||
      error.message.includes('tlsv1 alert internal error')
    ) {
      console.error('\n' + '='.repeat(65));
      console.error('⚠️  MONGODB ATLAS IP WHITELIST REQUIRED:');
      console.error('Atlas closed the TLS connection with "SSL alert number 80".');
      console.error('This means your IP address is not whitelisted in MongoDB Atlas.');
      console.error('To fix this in 1 minute:');
      console.error('  1. Go to https://cloud.mongodb.com and log in.');
      console.error('  2. In the left sidebar, click "Network Access" under Security.');
      console.error('  3. Click "Add IP Address".');
      console.error('  4. Click "Allow Access From Anywhere" (0.0.0.0/0) or "Add Current IP Address".');
      console.error('  5. Click "Confirm". Wait ~1 minute and restart the server.');
      console.error('='.repeat(65) + '\n');
    }

    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas Disconnected]: Connection to MongoDB Atlas lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Atlas Error Event]: ${err.message}`);
});

export default connectDB;
