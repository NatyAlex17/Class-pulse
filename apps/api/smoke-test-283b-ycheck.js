const { createCdphDocument } = require('./dist/modules/cdph-pdf/templates/cdph-form-layout');

const doc = createCdphDocument();
console.log('page size:', doc.internal.pageSize.getWidth(), 'x', doc.internal.pageSize.getHeight());
