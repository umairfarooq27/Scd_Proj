function validateRecord(record) {
  if (!record.name || !record.value) throw new Error('Record must have both name and value.');
  return true;
}

function generateId() {
  return Date.now();
}

// Helper to format date
function formatDate(date) {
  return date ? new Date(date).toLocaleString() : 'N/A';
}

module.exports = { validateRecord, generateId, formatDate };
