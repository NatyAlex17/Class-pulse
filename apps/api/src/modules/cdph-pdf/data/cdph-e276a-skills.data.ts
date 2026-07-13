export interface CdphE276ASkillItem {
  id: string;
  label: string;
}

export interface CdphE276ASkillModule {
  /** Matches a module id in the learning resources config (e.g. "cdphe-m8"). */
  moduleId: string;
  clinicalHours: number;
  items: CdphE276ASkillItem[];
}

function skillModule(moduleNumber: number, clinicalHours: number, labels: string[]): CdphE276ASkillModule {
  return {
    moduleId: `cdphe-m${moduleNumber}`,
    clinicalHours,
    items: labels.map((label, index) => ({ id: `m${moduleNumber}-${index + 1}`, label })),
  };
}

/** Official CDPH 276A skills checklist line items, transcribed from the published form. Module numbers without a clinical component are omitted. */
export const CDPH_E276A_SKILLS: CdphE276ASkillModule[] = [
  skillModule(2, 1, [
    'Knock on door before entering',
    'Pull privacy curtains during personal care',
    'Keep patient information confidential',
    'Treat patient with respect and dignity',
    'Encourage patient to make choices',
    'Explain procedures to patient',
  ]),
  skillModule(4, 1, ['Demonstrate fire/disaster procedures', 'Handles oxygen safely', 'Use of fire extinguisher']),
  skillModule(5, 4, [
    'General use of gait belt',
    'Assist patient up to head of bed with two assistants',
    'Turn and position the patient — supine',
    'Turn and position the patient — side-lying',
    'Turn and position the patient — use of lift sheet',
    'Assist transfer from bed to chair or wheelchair',
    'Assist transfer from chair or wheelchair to bed',
    'Use of mechanical lift',
  ]),
  skillModule(6, 8, [
    'Hand washing',
    'Proper handling of linen',
    'Use of standard precautions — gloving',
    'Use of standard precautions — gowning',
    'Use of standard precautions — applying mask',
    'Dispose of trash and waste by double-bagging',
  ]),
  skillModule(7, 1, ['Measure oral intake', 'Measure urinary output', 'Use military time in documentation']),
  skillModule(8, 40, [
    'Back rub',
    'Bed bath and partial bath',
    'Tub bath',
    'Shower',
    'Assist with oral hygiene',
    'Mouth care of the unconscious patient',
    'Denture care',
    'Nail care',
    "Comb patient's hair",
    'Shampoo bedridden resident',
    'Shampoo with shower or tub bath',
    'Use of medicinal shampoo',
    'Shave patient with razor and electric shaver',
    'Dress and undress patient',
    'Change clothes of patient with IV',
    'Assist with use of urinal',
    'Assist with use of the bedpan',
    'Assist to toilet or bedside commode',
    'Bladder retraining',
    'Bowel retraining',
    'Perineal care',
    'Care and use of artificial limbs',
    'Use and application of splints',
    'Apply and remove behind-the-ear hearing aid',
    'Measure height of patient in bed',
    'Weigh patient in bed',
    'Measure and weigh patient using upright scale',
  ]),
  skillModule(9, 20, [
    'Collect and identify specimens — sputum',
    'Collect and identify specimens — urine: clean catch',
    'Collect and identify specimens — stool',
    'Make occupied bed',
    'Make unoccupied bed',
    'Administer commercially prepared cleansing enema',
    'Administer enemas — tap water, soap suds',
    'Administer laxative suppository',
    'Empty urinary bag',
    'Care for patient with tubing — oxygen',
    'Care for patient with tubing — IV',
    'Care for patient with tubing — gastrostomy',
    'Care for patient with tubing — nasogastric',
    'Care for patient with tubing — urinary catheter',
    'Apply antiembolic hose, elastic stockings (TED hose)',
    'Admit, transfer and discharge patient',
    'Apply non-sterile dressing',
    'Apply topical non-prescription ointment',
  ]),
  skillModule(10, 6, [
    'Measure and record temperature — oral',
    'Measure and record temperature — axillary',
    'Measure and record temperature — rectal',
    'Measure and record pulse: radial and apical',
    'Measure and record respiration',
    'Measure and record blood pressure: manual and digital electronic',
  ]),
  skillModule(11, 6, [
    'Feed the patient who is unable to feed themselves',
    'Assist patient who can feed self',
    'Verify patient given correct diet tray',
    'Use of assistive devices such as orthopedic utensils, cups and other devices',
  ]),
  skillModule(12, 1, [
    'Apply postural supports as safety devices',
    'Apply soft wrist/ankle restraints as safety devices',
    'Heimlich maneuver for conscious patient',
    'Heimlich maneuver for unconscious patient',
    'Position call light properly',
  ]),
  skillModule(13, 4, [
    'Use of dementia-related communication skills, including listening and speaking strategies',
    'Identify your name and purpose of interaction',
    "Make eye contact at patient's eye level",
    'Use of a continuum of verbal and other non-physical techniques such as redirect, for combative patients',
  ]),
  skillModule(14, 4, [
    'Perform range of motion exercises',
    'Assist ambulation of patient using gait belt',
    'Assist patient to ambulate with walker',
    'Assist patient to ambulate with cane',
    'Proper use of rehabilitative devices',
  ]),
  skillModule(15, 4, [
    'Report appropriate information to charge nurse',
    'Document vital signs, and activities of daily living timely and correctly',
    'Document changes in patient bodily functions and behavior',
    'Participate in resident care planning',
  ]),
];
