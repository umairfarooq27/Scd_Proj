const readline = require('readline');
const db = require('./db');
const fs = require('fs');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════╗
║               NODEVAULT ENHANCED v2.0                ║
╚══════════════════════════════════════════════════════╝

🔹 CORE OPERATIONS:
  1. Add Record
  2. List Records
  3. Update Record
  4. Delete Record

🔹 NEW ENHANCED FEATURES:
  5. 🔍 Search Records
  6. 📊 Sort Records
  7. 💾 Export Data
  8. 🛡️ Create Backup
  9. 📈 View Statistics
  0. Exit
  `);

  rl.question('\nChoose option: ', handleMenuChoice);
}

async function handleMenuChoice(choice) {
  switch(choice.trim()) {
    case '1':
      await addRecord();
      break;
    case '2':
      listRecords();
      break;
    case '3':
      await updateRecord();
      break;
    case '4':
      await deleteRecord();
      break;
    case '5':
      await searchRecords();
      break;
    case '6':
      await sortRecords();
      break;
    case '7':
      exportData();
      break;
    case '8':
      createBackup();
      break;
    case '9':
      viewStatistics();
      break;
    case '0':
      console.log('\n👋 Exiting NodeVault... Goodbye!');
      rl.close();
      return;
    default:
      console.log('❌ Invalid option. Please try again.');
      await waitAndContinue();
      showMenu();
  }
}

// Helper function for prompts
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function waitAndContinue() {
  await askQuestion('\nPress Enter to continue...');
}

// FEATURE 1: Add Record (updated)
async function addRecord() {
  console.log('\n=== ADD NEW RECORD ===');
  const name = await askQuestion('Enter record name: ');
  const value = await askQuestion('Enter record value: ');
  
  if (!name || !value) {
    console.log('❌ Both name and value are required!');
  } else {
    db.addRecord({ name, value });
    console.log('✅ Record added successfully!');
  }
  await waitAndContinue();
  showMenu();
}

// FEATURE 2: List Records
function listRecords() {
  console.log('\n=== ALL RECORDS ===');
  const records = db.listRecords();
  
  if (records.length === 0) {
    console.log('No records found.');
  } else {
    console.log('─'.repeat(70));
    console.log('ID'.padEnd(15) + 'Name'.padEnd(25) + 'Value'.padEnd(20) + 'Created At');
    console.log('─'.repeat(70));
    
    records.forEach(record => {
      const date = record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A';
      console.log(
        record.id.toString().padEnd(15) +
        record.name.padEnd(25) +
        record.value.padEnd(20) +
        date
      );
    });
    
    console.log('─'.repeat(70));
    console.log(`Total: ${records.length} records`);
  }
  
  rl.question('\nPress Enter to continue...', () => showMenu());
}

// FEATURE 3: Update Record
async function updateRecord() {
  console.log('\n=== UPDATE RECORD ===');
  const records = db.listRecords();
  
  if (records.length === 0) {
    console.log('No records to update.');
    await waitAndContinue();
    showMenu();
    return;
  }
  
  // Show current records
  records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
  
  const id = await askQuestion('\nEnter record ID to update: ');
  const record = records.find(r => r.id === Number(id));
  
  if (!record) {
    console.log('❌ Record not found!');
  } else {
    const newName = await askQuestion(`New name [${record.name}]: `) || record.name;
    const newValue = await askQuestion(`New value [${record.value}]: `) || record.value;
    
    const updated = db.updateRecord(Number(id), newName, newValue);
    console.log(updated ? '✅ Record updated!' : '❌ Update failed.');
  }
  
  await waitAndContinue();
  showMenu();
}

// FEATURE 4: Delete Record
async function deleteRecord() {
  console.log('\n=== DELETE RECORD ===');
  const records = db.listRecords();
  
  if (records.length === 0) {
    console.log('No records to delete.');
    await waitAndContinue();
    showMenu();
    return;
  }
  
  records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name}`));
  
  const id = await askQuestion('\nEnter record ID to delete: ');
  const deleted = db.deleteRecord(Number(id));
  console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
  
  await waitAndContinue();
  showMenu();
}

// FEATURE 5: Search Records (NEW)
async function searchRecords() {
  console.log('\n=== SEARCH RECORDS ===');
  const keyword = await askQuestion('Enter search keyword: ');
  
  if (!keyword) {
    console.log('❌ Please enter a search keyword.');
    await waitAndContinue();
    showMenu();
    return;
  }
  
  const results = await db.searchRecords(keyword);
  
  if (results.length === 0) {
    console.log('🔍 No matching records found.');
  } else {
    console.log(`\n🔍 Found ${results.length} matching record(s):`);
    console.log('─'.repeat(70));
    console.log('ID'.padEnd(15) + 'Name'.padEnd(25) + 'Value'.padEnd(20) + 'Source');
    console.log('─'.repeat(70));
    
    results.forEach(record => {
      const source = record._id ? 'MongoDB' : 'File';
      console.log(
        record.id.toString().padEnd(15) +
        record.name.padEnd(25) +
        record.value.padEnd(20) +
        source
      );
    });
  }
  
  await waitAndContinue();
  showMenu();
}

// FEATURE 6: Sort Records (NEW)
async function sortRecords() {
  console.log('\n=== SORT RECORDS ===\n');
  console.log('Sort by:');
  console.log('1. ID');
  console.log('2. Name');
  console.log('3. Creation Date');
  
  const fieldChoice = await askQuestion('Choose field (1-3): ');
  
  console.log('\nSort order:');
  console.log('1. Ascending (A-Z, Oldest first)');
  console.log('2. Descending (Z-A, Newest first)');
  
  const orderChoice = await askQuestion('Choose order (1-2): ');
  
  let field, order;
  switch(fieldChoice) {
    case '1': field = 'id'; break;
    case '2': field = 'name'; break;
    case '3': field = 'createdAt'; break;
    default: field = 'id';
  }
  
  order = orderChoice === '2' ? 'desc' : 'asc';
  
  const sorted = db.sortRecords(field, order);
  
  if (sorted.length === 0) {
    console.log('No records to sort.');
  } else {
    console.log(`\n📊 Sorted by ${field} (${order}):`);
    console.log('─'.repeat(70));
    console.log('ID'.padEnd(15) + 'Name'.padEnd(25) + 'Value'.padEnd(20) + 'Created At');
    console.log('─'.repeat(70));
    
    sorted.forEach(record => {
      const date = record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A';
      console.log(
        record.id.toString().padEnd(15) +
        record.name.padEnd(25) +
        record.value.padEnd(20) +
        date
      );
    });
  }
  
  await waitAndContinue();
  showMenu();
}

// FEATURE 7: Export Data (NEW)
function exportData() {
  console.log('\n=== EXPORT DATA ===');
  
  try {
    const result = db.exportData();
    console.log(`✅ Data exported successfully to: ${result}`);
    
    // Show preview
    const content = fs.readFileSync('export.txt', 'utf8');
    const lines = content.split('\n').slice(0, 10);
    console.log('\n📄 Preview (first 10 lines):');
    console.log('─'.repeat(50));
    lines.forEach(line => console.log(line));
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.log('❌ Export failed:', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => showMenu());
}

// FEATURE 8: Create Backup (NEW)
function createBackup() {
  console.log('\n=== CREATE BACKUP ===');
  
  try {
    const filename = db.createBackup();
    console.log(`✅ Backup created: ${filename}`);
    
    // List all backups
    const backupDir = './backups';
    if (fs.existsSync(backupDir)) {
      const backups = fs.readdirSync(backupDir);
      console.log(`\n📂 Total backups: ${backups.length}`);
      if (backups.length > 0) {
        console.log('Recent backups:');
        backups.slice(-3).forEach(backup => {
          const stats = fs.statSync(`${backupDir}/${backup}`);
          console.log(`  • ${backup} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Backup failed:', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => showMenu());
}

// FEATURE 9: View Statistics (NEW)
function viewStatistics() {
  console.log('\n=== VAULT STATISTICS ===');
  
  const stats = db.getStatistics();
  
  if (stats.total === 0) {
    console.log('No records available for statistics.');
  } else {
    console.log('📊 Storage Statistics:');
    console.log('─'.repeat(40));
    console.log(`Total Records:        ${stats.total}`);
    console.log(`Longest Name:         ${stats.longestName}`);
    console.log(`Shortest Name:        ${stats.shortestName}`);
    console.log(`Average Name Length:  ${stats.avgNameLength} characters`);
    console.log(`Total Value Length:   ${stats.totalValueLength} characters`);
    
    if (stats.earliestRecord) {
      console.log(`Earliest Record:      ${stats.earliestRecord}`);
      console.log(`Latest Record:        ${stats.latestRecord}`);
    }
    
    // File size info
    try {
      const fileStats = fs.statSync('./data/vault.json');
      console.log(`File Size:            ${(fileStats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    
    console.log('─'.repeat(40));
  }
  
  rl.question('\nPress Enter to continue...', () => showMenu());
}

// Start the application
showMenu();
