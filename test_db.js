const db = require('./db');
console.log('Available functions:');
console.log(Object.keys(db));
console.log('\nTesting addRecord:');
try {
  db.addRecord({ name: 'Test', value: 'Test Value' });
  console.log('✓ addRecord works');
} catch(e) { console.log('✗ addRecord error:', e.message); }
