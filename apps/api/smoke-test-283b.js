const { CdphPdfService } = require('./dist/modules/cdph-pdf/services/cdph-pdf.service');
const fs = require('fs');

const service = new CdphPdfService();
const buffer = service.generate283B({
  requestType: 'enrollment',
  lastName: 'Singh',
  firstName: 'Amara',
  middleInitial: 'R',
  sex: 'Female',
  addressLine1: '221 Baker St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94110',
  confidentialAddressLine1: '',
  confidentialCity: '',
  confidentialState: '',
  confidentialZip: '',
  dob: '04/12/1998',
  ssn: '123-45-6789',
  itin: '',
  driversLicenseNumber: 'D1234567',
  driversLicenseState: 'CA',
  phone: '(555) 010-2291',
  email: 'amara.singh@classpulse.edu',
  textMessageConsent: true,
  conviction: true,
  convictionDescription: 'Misdemeanor, resolved 2019',
  convictionCourt: 'San Francisco Superior Court',
  convictionDate: '03/2019',
  adverseAction: false,
  adverseActionLicenseType: '',
  adverseActionLicenseNumber: '',
  adverseActionType: '',
  trainingProgramName: 'Fall CNA Cohort 2026',
  trainingProgramPhone: '(555) 010-3000',
  trainingProgramAddressLine1: '400 Main St',
  trainingProgramCity: 'San Francisco',
  trainingProgramState: 'CA',
  trainingProgramZip: '94110',
  trainingProgramId: 'CNA-1234',
  trainingBeginDate: '01/05/2026',
  trainingEndDate: '03/16/2026',
  signedAt: new Date().toISOString(),
});

fs.writeFileSync('smoke-test-283b-output.pdf', buffer);
console.log('Wrote', buffer.length, 'bytes to smoke-test-283b-output.pdf');
