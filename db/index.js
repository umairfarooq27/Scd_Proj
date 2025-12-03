const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const mongoDB = require('./mongo');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { 
    id: recordUtils.generateId(), 
    name, 
    value,
    createdAt: new Date()
  };
  data.push(newRecord);
  fileDB.writeDB(data);
  
  // Also save to MongoDB
  mongoDB.saveToMongo(newRecord);
  
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  
  // Also update in MongoDB
  mongoDB.updateInMongo(id, newName, newValue);
  
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  
  // Also delete from MongoDB
  mongoDB.deleteFromMongo(id);
  
  vaultEvents.emit('recordDeleted', record);
  return record;
}

// FEATURE 1: Search Records
async function searchRecords(keyword) {
  // Try MongoDB first
  const mongoResults = await mongoDB.searchInMongo(keyword);
  if (mongoResults.length > 0) {
    return mongoResults.map(r => r.toObject());
  }
  
  // Fallback to file search
  const data = fileDB.readDB();
  return data.filter(record => 
    record.name.toLowerCase().includes(keyword.toLowerCase()) ||
    record.value.toLowerCase().includes(keyword.toLowerCase()) ||
    record.id.toString().includes(keyword)
  );
}

// FEATURE 2: Sort Records
function sortRecords(field = 'id', order = 'asc') {
  const data = fileDB.readDB();
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    if (field === 'name') return a.name.localeCompare(b.name);
    if (field === 'createdAt') return new Date(a.createdAt) - new Date(b.createdAt);
    return a.id - b.id;
  });
  
  if (order === 'desc') {
    sorted.reverse();
  }
  
  return sorted;
}

// FEATURE 3: Export to text file
const fs = require('fs');
function exportData() {
  const data = fileDB.readDB();
  const date = new Date().toISOString().replace('T', ' ').substr(0, 19);
  let content = '='.repeat(50) + '\n';
  content += 'NODEVAULT DATA EXPORT\n';
  content += '='.repeat(50) + '\n';
  content += `Export Date: ${date}\n`;
  content += `Total Records: ${data.length}\n`;
  content += '='.repeat(50) + '\n\n';
  
  data.forEach((record, index) => {
    content += `RECORD ${index + 1}\n`;
    content += '-' .repeat(30) + '\n';
    content += `  ID:    ${record.id}\n`;
    content += `  Name:  ${record.name}\n`;
    content += `  Value: ${record.value}\n`;
    if (record.createdAt) {
      content += `  Created: ${new Date(record.createdAt).toLocaleString()}\n`;
    }
    content += '\n';
  });
  
  fs.writeFileSync('export.txt', content);
  return `export.txt (${data.length} records)`;
}

// FEATURE 4: Automatic Backup
function createBackup() {
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
  const filename = `${backupDir}/backup_${timestamp}.json`;
  
  const data = fileDB.readDB();
  const backupData = {
    source: 'file',
    timestamp: new Date().toISOString(),
    count: data.length,
    records: data
  };
  
  fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));
  return filename;
}

// FEATURE 5: Statistics
function getStatistics() {
  const data = fileDB.readDB();
  if (data.length === 0) {
    return { total: 0, message: 'No records found' };
  }
  
  const names = data.map(r => r.name);
  const values = data.map(r => r.value);
  const longestName = names.reduce((a, b) => a.length > b.length ? a : b);
  const shortestName = names.reduce((a, b) => a.length < b.length ? a : b);
  
  const stats = {
    total: data.length,
    longestName: `${longestName} (${longestName.length} chars)`,
    shortestName: `${shortestName} (${shortestName.length} chars)`,
    avgNameLength: (names.reduce((sum, name) => sum + name.length, 0) / data.length).toFixed(2),
    totalValueLength: values.reduce((sum, value) => sum + value.length, 0)
  };
  
  if (data[0].createdAt) {
    const dates = data.map(r => new Date(r.createdAt));
    stats.earliestRecord = new Date(Math.min(...dates)).toLocaleDateString();
    stats.latestRecord = new Date(Math.max(...dates)).toLocaleDateString();
  }
  
  return stats;
}

module.exports = { 
  addRecord, 
  listRecords, 
  updateRecord, 
  deleteRecord,
  searchRecords,
  sortRecords,
  exportData,
  createBackup,
  getStatistics
};
