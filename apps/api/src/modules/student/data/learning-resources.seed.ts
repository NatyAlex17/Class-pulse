import type { LearningModuleDefinition } from '../types/student-portal.types';

// 17-module CNA curriculum skeleton (Title 22 hour requirements + block/segment
// breakdown). Every resource is a 'text' placeholder — lesson content is added
// later via the admin Learning Resources builder.
export const learningResourcesSeed: LearningModuleDefinition[] = [
  {
    "id": "cna-m1",
    "title": "Module 1: Orientation to the Nursing Assistant Role",
    "summary": "Sets the tone for the whole program. Factual (roles, Title 22, certification, ethics) — lead with narrated graphics, keep it warm and welcoming since it is the student's first module. Planned content: 100 min; required minimum: 100 min (meets).",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 0,
    "sections": [
      {
        "id": "cna-m1-s1",
        "title": "A new CNA's first shift",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m1-s1-r1",
            "title": "A new CNA's first shift",
            "type": "text",
            "duration": "10 min",
            "description": "Placeholder — add the lesson content for \"A new CNA's first shift\" (Scenario, 10 min)."
          }
        ]
      },
      {
        "id": "cna-m1-s2",
        "title": "Roles, responsibilities & the care team",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m1-s2-r1",
            "title": "Roles, responsibilities & the care team",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Roles, responsibilities & the care team\" (Teach, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m1-s3",
        "title": "Title 22 & certification pathway",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m1-s3-r1",
            "title": "Title 22 & certification pathway",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Title 22 & certification pathway\" (Teach, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m1-s4",
        "title": "Match responsibilities to scenarios",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m1-s4-r1",
            "title": "Match responsibilities to scenarios",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"Match responsibilities to scenarios\" (Interact, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m1-s5",
        "title": "Ethics & confidentiality: what would you do?",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m1-s5-r1",
            "title": "Ethics & confidentiality: what would you do?",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Ethics & confidentiality: what would you do?\" (Apply, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m1-s6",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m1-s6-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m2",
    "title": "Module 2: Resident Rights",
    "summary": "Rights violations are best taught through situations, not statutes read aloud. Heavy on animated scenarios. Note: 1 full hour must cover preventing/recognizing/reporting rights violations. Planned content: 150 min; required minimum: 150 min (meets). Game candidate (high): rights recognition — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 2.5,
    "moduleFee": 0,
    "order": 1,
    "sections": [
      {
        "id": "cna-m2-s1",
        "title": "A dignity violation, seen from the resident's view",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m2-s1-r1",
            "title": "A dignity violation, seen from the resident's view",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"A dignity violation, seen from the resident's view\" (Scenario, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s2",
        "title": "Title 22, H&S Code & federal rights framework",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m2-s2-r1",
            "title": "Title 22, H&S Code & federal rights framework",
            "type": "text",
            "duration": "28 min",
            "description": "Placeholder — add the lesson content for \"Title 22, H&S Code & federal rights framework\" (Teach, 28 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s3",
        "title": "Recognizing a rights violation in progress",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m2-s3-r1",
            "title": "Recognizing a rights violation in progress",
            "type": "text",
            "duration": "15 min",
            "description": "Placeholder — add the lesson content for \"Recognizing a rights violation in progress\" (Scenario, 15 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s4",
        "title": "Report it: branching decision path",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m2-s4-r1",
            "title": "Report it: branching decision path",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Report it: branching decision path\" (Apply, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s5",
        "title": "Preventing & reporting (required 1-hr component)",
        "description": "Direct instruction. Required 1-hour component per Title 22.",
        "resources": [
          {
            "id": "cna-m2-s5-r1",
            "title": "Preventing & reporting (required 1-hr component)",
            "type": "text",
            "duration": "35 min",
            "description": "Placeholder — add the lesson content for \"Preventing & reporting (required 1-hr component)\" (Teach, 35 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s6",
        "title": "Sort: violation vs. acceptable practice",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m2-s6-r1",
            "title": "Sort: violation vs. acceptable practice",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Sort: violation vs. acceptable practice\" (Interact, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m2-s7",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m2-s7-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m3",
    "title": "Module 3: Communication & Interpersonal Skills",
    "summary": "Communication is inherently performative — show it. Animation and branching dialogue carry this better than narration. Planned content: 100 min; required minimum: 100 min (meets). Game candidate (med): dialogue branching — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 2,
    "sections": [
      {
        "id": "cna-m3-s1",
        "title": "A difficult family conversation",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m3-s1-r1",
            "title": "A difficult family conversation",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"A difficult family conversation\" (Scenario, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m3-s2",
        "title": "Communication & defense mechanisms",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m3-s2-r1",
            "title": "Communication & defense mechanisms",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Communication & defense mechanisms\" (Teach, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m3-s3",
        "title": "Choose the response: dialogue branches",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m3-s3-r1",
            "title": "Choose the response: dialogue branches",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Choose the response: dialogue branches\" (Interact, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m3-s4",
        "title": "Sociocultural factors: case reflection",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m3-s4-r1",
            "title": "Sociocultural factors: case reflection",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Sociocultural factors: case reflection\" (Apply, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m3-s5",
        "title": "Family interaction & attitudes toward illness",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m3-s5-r1",
            "title": "Family interaction & attitudes toward illness",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Family interaction & attitudes toward illness\" (Teach, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m3-s6",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m3-s6-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m4",
    "title": "Module 4: Safety & Emergency Procedures",
    "summary": "Short, high-stakes, factual. One tight hour — a scenario to anchor it, crisp teaching, and a decision drill. Planned content: 50 min; required minimum: 50 min (meets). Game candidate (med): response drills — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 0.83,
    "moduleFee": 0,
    "order": 3,
    "sections": [
      {
        "id": "cna-m4-s1",
        "title": "Fire alarm on the unit",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m4-s1-r1",
            "title": "Fire alarm on the unit",
            "type": "text",
            "duration": "8 min",
            "description": "Placeholder — add the lesson content for \"Fire alarm on the unit\" (Scenario, 8 min)."
          }
        ]
      },
      {
        "id": "cna-m4-s2",
        "title": "Emergency, safety rules, fire & disaster plans",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m4-s2-r1",
            "title": "Emergency, safety rules, fire & disaster plans",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Emergency, safety rules, fire & disaster plans\" (Teach, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m4-s3",
        "title": "Sequence the emergency response",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m4-s3-r1",
            "title": "Sequence the emergency response",
            "type": "text",
            "duration": "10 min",
            "description": "Placeholder — add the lesson content for \"Sequence the emergency response\" (Interact, 10 min)."
          }
        ]
      },
      {
        "id": "cna-m4-s4",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m4-s4-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "10 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 10 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m5",
    "title": "Module 5: Body Mechanics & Safe Patient Handling",
    "summary": "Physical skill — students must see it done. Real demonstration clips are worth the cost here, paired with graphics on the principles. Planned content: 100 min; required minimum: 100 min (meets). Game candidate (med): sequencing / spot-error — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 4,
    "sections": [
      {
        "id": "cna-m5-s1",
        "title": "A CNA injures their back — why?",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m5-s1-r1",
            "title": "A CNA injures their back — why?",
            "type": "text",
            "duration": "8 min",
            "description": "Placeholder — add the lesson content for \"A CNA injures their back — why?\" (Scenario, 8 min)."
          }
        ]
      },
      {
        "id": "cna-m5-s2",
        "title": "Basic rules of body mechanics",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m5-s2-r1",
            "title": "Basic rules of body mechanics",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Basic rules of body mechanics\" (Teach, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m5-s3",
        "title": "Transfer techniques, step by step",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m5-s3-r1",
            "title": "Transfer techniques, step by step",
            "type": "text",
            "duration": "24 min",
            "description": "Placeholder — add the lesson content for \"Transfer techniques, step by step\" (Demo, 24 min)."
          }
        ]
      },
      {
        "id": "cna-m5-s4",
        "title": "Ambulation & positioning",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m5-s4-r1",
            "title": "Ambulation & positioning",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Ambulation & positioning\" (Demo, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m5-s5",
        "title": "Spot the unsafe lift",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m5-s5-r1",
            "title": "Spot the unsafe lift",
            "type": "text",
            "duration": "14 min",
            "description": "Placeholder — add the lesson content for \"Spot the unsafe lift\" (Interact, 14 min)."
          }
        ]
      },
      {
        "id": "cna-m5-s6",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m5-s6-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m6",
    "title": "Module 6: Infection Control",
    "summary": "Procedural core (infection control). Motion graphics for the invisible (micro-organisms, transmission) + demonstration for handwashing/PPE. Planned content: 100 min; required minimum: 100 min (meets). Game candidate (high): chain-of-infection — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 5,
    "sections": [
      {
        "id": "cna-m6-s1",
        "title": "Micro-organisms & how infection spreads",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m6-s1-r1",
            "title": "Micro-organisms & how infection spreads",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Micro-organisms & how infection spreads\" (Teach, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m6-s2",
        "title": "Handwashing & PPE, correct sequence",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m6-s2-r1",
            "title": "Handwashing & PPE, correct sequence",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Handwashing & PPE, correct sequence\" (Demo, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m6-s3",
        "title": "Standard precautions & principles of asepsis",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m6-s3-r1",
            "title": "Standard precautions & principles of asepsis",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Standard precautions & principles of asepsis\" (Teach, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m6-s4",
        "title": "Break the chain of infection",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m6-s4-r1",
            "title": "Break the chain of infection",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Break the chain of infection\" (Interact, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m6-s5",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m6-s5-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 22 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m7",
    "title": "Module 7: Measurements & Time: Metric System and Military Time",
    "summary": "Short and mechanical (metric system, military time). Teaching + lots of practice interaction; this is a \"do it\" skill. Planned content: 50 min; required minimum: 50 min (meets).",
    "requiredHours": 0.83,
    "moduleFee": 0,
    "order": 6,
    "sections": [
      {
        "id": "cna-m7-s1",
        "title": "Metric system, weight, length, volume",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m7-s1-r1",
            "title": "Metric system, weight, length, volume",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Metric system, weight, length, volume\" (Teach, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m7-s2",
        "title": "Convert & record: practice drills",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m7-s2-r1",
            "title": "Convert & record: practice drills",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Convert & record: practice drills\" (Interact, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m7-s3",
        "title": "Military time / 24-hour clock",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m7-s3-r1",
            "title": "Military time / 24-hour clock",
            "type": "text",
            "duration": "8 min",
            "description": "Placeholder — add the lesson content for \"Military time / 24-hour clock\" (Teach, 8 min)."
          }
        ]
      },
      {
        "id": "cna-m7-s4",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m7-s4-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "8 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 8 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m8",
    "title": "Module 8: Personal Care Skills",
    "summary": "THE BIG ONE — 14 hours / 700 minutes. This cannot be one block; split into many sub-lessons (bathing, dressing, oral care, hair/nail, prosthetics, skin/decubitus, elimination, bowel/bladder, weighing). Demonstration-heavy. Plan this as roughly 8-10 mini-modules, each with its own time gate, so a student completes them across multiple sittings. Planned content: 670 min; required minimum: 700 min (currently under by 30 min — add or expand content to close the gap). Large module: build as multiple sub-lessons, each with its own time gate. Game candidate (med): skill sequencing — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 11.67,
    "moduleFee": 0,
    "order": 7,
    "sections": [
      {
        "id": "cna-m8-s1",
        "title": "A full morning care routine, previewed",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m8-s1-r1",
            "title": "A full morning care routine, previewed",
            "type": "text",
            "duration": "14 min",
            "description": "Placeholder — add the lesson content for \"A full morning care routine, previewed\" (Scenario, 14 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s2",
        "title": "Bathing & medicinal baths",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s2-r1",
            "title": "Bathing & medicinal baths",
            "type": "text",
            "duration": "70 min",
            "description": "Placeholder — add the lesson content for \"Bathing & medicinal baths\" (Demo, 70 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s3",
        "title": "Dressing & oral hygiene",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s3-r1",
            "title": "Dressing & oral hygiene",
            "type": "text",
            "duration": "70 min",
            "description": "Placeholder — add the lesson content for \"Dressing & oral hygiene\" (Demo, 70 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s4",
        "title": "Hair, shampoo, nail care & shaving",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s4-r1",
            "title": "Hair, shampoo, nail care & shaving",
            "type": "text",
            "duration": "60 min",
            "description": "Placeholder — add the lesson content for \"Hair, shampoo, nail care & shaving\" (Demo, 60 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s5",
        "title": "Prosthetic devices",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m8-s5-r1",
            "title": "Prosthetic devices",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Prosthetic devices\" (Teach, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s6",
        "title": "Skin care & preventing decubitus ulcers",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s6-r1",
            "title": "Skin care & preventing decubitus ulcers",
            "type": "text",
            "duration": "80 min",
            "description": "Placeholder — add the lesson content for \"Skin care & preventing decubitus ulcers\" (Demo, 80 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s7",
        "title": "Elimination needs",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s7-r1",
            "title": "Elimination needs",
            "type": "text",
            "duration": "70 min",
            "description": "Placeholder — add the lesson content for \"Elimination needs\" (Demo, 70 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s8",
        "title": "Bowel & bladder retraining",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s8-r1",
            "title": "Bowel & bladder retraining",
            "type": "text",
            "duration": "80 min",
            "description": "Placeholder — add the lesson content for \"Bowel & bladder retraining\" (Demo, 80 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s9",
        "title": "Weighing & measuring the patient",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m8-s9-r1",
            "title": "Weighing & measuring the patient",
            "type": "text",
            "duration": "60 min",
            "description": "Placeholder — add the lesson content for \"Weighing & measuring the patient\" (Demo, 60 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s10",
        "title": "Skill-sequence practice across all areas",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m8-s10-r1",
            "title": "Skill-sequence practice across all areas",
            "type": "text",
            "duration": "56 min",
            "description": "Placeholder — add the lesson content for \"Skill-sequence practice across all areas\" (Interact, 56 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s11",
        "title": "Full-shift case: plan the care",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m8-s11-r1",
            "title": "Full-shift case: plan the care",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Full-shift case: plan the care\" (Apply, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m8-s12",
        "title": "Comprehensive knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m8-s12-r1",
            "title": "Comprehensive knowledge check",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Comprehensive knowledge check\" (Check, 30 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m9",
    "title": "Module 9: Basic Nursing Skills & Procedures",
    "summary": "Second-largest — 7 hours / 350 minutes. Also needs splitting. Procedural: specimens, tubing care, I&O, bedmaking, enemas, admit/transfer/discharge, dressings. Planned content: 350 min; required minimum: 350 min (meets). Large module: build as multiple sub-lessons, each with its own time gate. Game candidate (med): procedure sequencing — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 5.83,
    "moduleFee": 0,
    "order": 8,
    "sections": [
      {
        "id": "cna-m9-s1",
        "title": "Specimen collection (stool, urine, sputum)",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m9-s1-r1",
            "title": "Specimen collection (stool, urine, sputum)",
            "type": "text",
            "duration": "50 min",
            "description": "Placeholder — add the lesson content for \"Specimen collection (stool, urine, sputum)\" (Demo, 50 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s2",
        "title": "Care of patients with tubing",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m9-s2-r1",
            "title": "Care of patients with tubing",
            "type": "text",
            "duration": "55 min",
            "description": "Placeholder — add the lesson content for \"Care of patients with tubing\" (Demo, 55 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s3",
        "title": "Intake & output",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m9-s3-r1",
            "title": "Intake & output",
            "type": "text",
            "duration": "35 min",
            "description": "Placeholder — add the lesson content for \"Intake & output\" (Teach, 35 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s4",
        "title": "Bedmaking (occupied & unoccupied)",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m9-s4-r1",
            "title": "Bedmaking (occupied & unoccupied)",
            "type": "text",
            "duration": "45 min",
            "description": "Placeholder — add the lesson content for \"Bedmaking (occupied & unoccupied)\" (Demo, 45 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s5",
        "title": "Enemas & laxative suppositories",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m9-s5-r1",
            "title": "Enemas & laxative suppositories",
            "type": "text",
            "duration": "50 min",
            "description": "Placeholder — add the lesson content for \"Enemas & laxative suppositories\" (Demo, 50 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s6",
        "title": "Admission, transfer & discharge",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m9-s6-r1",
            "title": "Admission, transfer & discharge",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Admission, transfer & discharge\" (Teach, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s7",
        "title": "Bandages & nonsterile dressings",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m9-s7-r1",
            "title": "Bandages & nonsterile dressings",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Bandages & nonsterile dressings\" (Demo, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s8",
        "title": "Match procedure to correct steps",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m9-s8-r1",
            "title": "Match procedure to correct steps",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Match procedure to correct steps\" (Interact, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m9-s9",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m9-s9-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "15 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 15 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m10",
    "title": "Module 10: Vital Signs",
    "summary": "Procedural and measurable. Demonstration of each measurement + interactive practice reading values. Planned content: 150 min; required minimum: 150 min (meets). Game candidate (med): read & record — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 2.5,
    "moduleFee": 0,
    "order": 9,
    "sections": [
      {
        "id": "cna-m10-s1",
        "title": "Purpose, factors & normal ranges",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m10-s1-r1",
            "title": "Purpose, factors & normal ranges",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"Purpose, factors & normal ranges\" (Teach, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m10-s2",
        "title": "Temperature, pulse, respiration",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m10-s2-r1",
            "title": "Temperature, pulse, respiration",
            "type": "text",
            "duration": "34 min",
            "description": "Placeholder — add the lesson content for \"Temperature, pulse, respiration\" (Demo, 34 min)."
          }
        ]
      },
      {
        "id": "cna-m10-s3",
        "title": "Blood pressure technique",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m10-s3-r1",
            "title": "Blood pressure technique",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Blood pressure technique\" (Demo, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m10-s4",
        "title": "Read & record: is this normal or abnormal?",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m10-s4-r1",
            "title": "Read & record: is this normal or abnormal?",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Read & record: is this normal or abnormal?\" (Interact, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m10-s5",
        "title": "Recording & reporting abnormalities",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m10-s5-r1",
            "title": "Recording & reporting abnormalities",
            "type": "text",
            "duration": "14 min",
            "description": "Placeholder — add the lesson content for \"Recording & reporting abnormalities\" (Teach, 14 min)."
          }
        ]
      },
      {
        "id": "cna-m10-s6",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m10-s6-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 16 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m11",
    "title": "Module 11: Nutrition & Feeding",
    "summary": "Conceptual with a hands-on feeding component. Teaching + a feeding demonstration + case application. Planned content: 100 min; required minimum: 100 min (meets).",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 10,
    "sections": [
      {
        "id": "cna-m11-s1",
        "title": "Proper nutrition & diet therapy",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m11-s1-r1",
            "title": "Proper nutrition & diet therapy",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"Proper nutrition & diet therapy\" (Teach, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m11-s2",
        "title": "Feeding techniques",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m11-s2-r1",
            "title": "Feeding techniques",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Feeding techniques\" (Demo, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m11-s3",
        "title": "Match diet to resident needs",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m11-s3-r1",
            "title": "Match diet to resident needs",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Match diet to resident needs\" (Apply, 18 min)."
          }
        ]
      },
      {
        "id": "cna-m11-s4",
        "title": "Build a compliant meal tray",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m11-s4-r1",
            "title": "Build a compliant meal tray",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Build a compliant meal tray\" (Interact, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m11-s5",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m11-s5-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m12",
    "title": "Module 12: Recognizing & Responding to Emergencies",
    "summary": "High-stakes recognition & response. Scenario-driven with decision drills; pairs well with Module 4 (Safety & Emergency Procedures). Planned content: 100 min; required minimum: 100 min (meets). Game candidate (high): emergency recognition — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 11,
    "sections": [
      {
        "id": "cna-m12-s1",
        "title": "A resident in distress",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m12-s1-r1",
            "title": "A resident in distress",
            "type": "text",
            "duration": "10 min",
            "description": "Placeholder — add the lesson content for \"A resident in distress\" (Scenario, 10 min)."
          }
        ]
      },
      {
        "id": "cna-m12-s2",
        "title": "Signs & symptoms of distress",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m12-s2-r1",
            "title": "Signs & symptoms of distress",
            "type": "text",
            "duration": "24 min",
            "description": "Placeholder — add the lesson content for \"Signs & symptoms of distress\" (Teach, 24 min)."
          }
        ]
      },
      {
        "id": "cna-m12-s3",
        "title": "Recognize the emergency: rapid drills",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m12-s3-r1",
            "title": "Recognize the emergency: rapid drills",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Recognize the emergency: rapid drills\" (Interact, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m12-s4",
        "title": "Immediate intervention & emergency codes",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m12-s4-r1",
            "title": "Immediate intervention & emergency codes",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"Immediate intervention & emergency codes\" (Teach, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m12-s5",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m12-s5-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 20 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m13",
    "title": "Module 13: Mental Health, Dementia & Human Development",
    "summary": "5 hours (SNF/ICF programs) — communication + clinical. Dementia & special-needs care is best taught through animated scenarios. Includes intro to anatomy & physiology (min 1 hr). Note: non-SNF/ICF programs use 3 hours here instead of 5. Planned content: 250 min; required minimum: 250 min (meets). Large module: build as multiple sub-lessons, each with its own time gate. Game candidate (high): condition matching — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 4.17,
    "moduleFee": 0,
    "order": 12,
    "sections": [
      {
        "id": "cna-m13-s1",
        "title": "Communicating with a resident who has dementia",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m13-s1-r1",
            "title": "Communicating with a resident who has dementia",
            "type": "text",
            "duration": "14 min",
            "description": "Placeholder — add the lesson content for \"Communicating with a resident who has dementia\" (Scenario, 14 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s2",
        "title": "Special needs: developmental & mental disorders",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m13-s2-r1",
            "title": "Special needs: developmental & mental disorders",
            "type": "text",
            "duration": "50 min",
            "description": "Placeholder — add the lesson content for \"Special needs: developmental & mental disorders\" (Teach, 50 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s3",
        "title": "Alzheimer's & related dementias",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m13-s3-r1",
            "title": "Alzheimer's & related dementias",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Alzheimer's & related dementias\" (Teach, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s4",
        "title": "Intro to anatomy & physiology (min 1 hr)",
        "description": "Direct instruction. Required minimum 1-hour component.",
        "resources": [
          {
            "id": "cna-m13-s4-r1",
            "title": "Intro to anatomy & physiology (min 1 hr)",
            "type": "text",
            "duration": "60 min",
            "description": "Placeholder — add the lesson content for \"Intro to anatomy & physiology (min 1 hr)\" (Teach, 60 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s5",
        "title": "Behavioral changes: respond to the situation",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m13-s5-r1",
            "title": "Behavioral changes: respond to the situation",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Behavioral changes: respond to the situation\" (Apply, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s6",
        "title": "Community resources & psychosocial needs",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m13-s6-r1",
            "title": "Community resources & psychosocial needs",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Community resources & psychosocial needs\" (Teach, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s7",
        "title": "Match condition to care approach",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m13-s7-r1",
            "title": "Match condition to care approach",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Match condition to care approach\" (Interact, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m13-s8",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m13-s8-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "10 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 10 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m14",
    "title": "Module 14: Restorative Care & Range of Motion",
    "summary": "Restorative care & ROM — demonstration of devices and range-of-motion, plus the \"why\" of promoting independence. Planned content: 100 min; required minimum: 100 min (meets).",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 13,
    "sections": [
      {
        "id": "cna-m14-s1",
        "title": "Promoting potential & complications of inactivity",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m14-s1-r1",
            "title": "Promoting potential & complications of inactivity",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Promoting potential & complications of inactivity\" (Teach, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m14-s2",
        "title": "Range of motion & ambulation",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m14-s2-r1",
            "title": "Range of motion & ambulation",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"Range of motion & ambulation\" (Demo, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m14-s3",
        "title": "Devices, equipment & ADLs",
        "description": "Instructor demonstration.",
        "resources": [
          {
            "id": "cna-m14-s3-r1",
            "title": "Devices, equipment & ADLs",
            "type": "text",
            "duration": "22 min",
            "description": "Placeholder — add the lesson content for \"Devices, equipment & ADLs\" (Demo, 22 min)."
          }
        ]
      },
      {
        "id": "cna-m14-s4",
        "title": "Restorative vs. dependent care: sort it",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m14-s4-r1",
            "title": "Restorative vs. dependent care: sort it",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"Restorative vs. dependent care: sort it\" (Interact, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m14-s5",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m14-s5-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m15",
    "title": "Module 15: Observation, Documentation & Reporting",
    "summary": "4 hours — documentation is dry but critical. Break it up with heavy interaction: students should practice charting, not watch charting. Planned content: 200 min; required minimum: 200 min (meets). Game candidate (high): charting + anatomy game — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 3.33,
    "moduleFee": 0,
    "order": 14,
    "sections": [
      {
        "id": "cna-m15-s1",
        "title": "A missed observation and its consequence",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m15-s1-r1",
            "title": "A missed observation and its consequence",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"A missed observation and its consequence\" (Scenario, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s2",
        "title": "Observation & reporting responsibility",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m15-s2-r1",
            "title": "Observation & reporting responsibility",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Observation & reporting responsibility\" (Teach, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s3",
        "title": "Care plans & documentation",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m15-s3-r1",
            "title": "Care plans & documentation",
            "type": "text",
            "duration": "34 min",
            "description": "Placeholder — add the lesson content for \"Care plans & documentation\" (Teach, 34 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s4",
        "title": "Chart it: practice documentation entries",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m15-s4-r1",
            "title": "Chart it: practice documentation entries",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Chart it: practice documentation entries\" (Interact, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s5",
        "title": "Legal issues, terminology & abbreviations",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m15-s5-r1",
            "title": "Legal issues, terminology & abbreviations",
            "type": "text",
            "duration": "40 min",
            "description": "Placeholder — add the lesson content for \"Legal issues, terminology & abbreviations\" (Teach, 40 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s6",
        "title": "What to report vs. what to chart",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m15-s6-r1",
            "title": "What to report vs. what to chart",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"What to report vs. what to chart\" (Apply, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m15-s7",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m15-s7-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m16",
    "title": "Module 16: Dying, Death & Grief",
    "summary": "Deeply human — animation handles emotional content with dignity across all ages. Scenario and reflection lead; keep the tone respectful. Planned content: 100 min; required minimum: 100 min (meets). Game candidate (med): reflection branching — layer a reusable engine on top of the teach block, do not replace instruction with it.",
    "requiredHours": 1.67,
    "moduleFee": 0,
    "order": 15,
    "sections": [
      {
        "id": "cna-m16-s1",
        "title": "Supporting a family in final hours",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m16-s1-r1",
            "title": "Supporting a family in final hours",
            "type": "text",
            "duration": "12 min",
            "description": "Placeholder — add the lesson content for \"Supporting a family in final hours\" (Scenario, 12 min)."
          }
        ]
      },
      {
        "id": "cna-m16-s2",
        "title": "Stages of grief & emotional/spiritual needs",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m16-s2-r1",
            "title": "Stages of grief & emotional/spiritual needs",
            "type": "text",
            "duration": "24 min",
            "description": "Placeholder — add the lesson content for \"Stages of grief & emotional/spiritual needs\" (Teach, 24 min)."
          }
        ]
      },
      {
        "id": "cna-m16-s3",
        "title": "Responding to a dying resident's needs",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m16-s3-r1",
            "title": "Responding to a dying resident's needs",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"Responding to a dying resident's needs\" (Apply, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m16-s4",
        "title": "Signs of approaching death & postmortem care",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m16-s4-r1",
            "title": "Signs of approaching death & postmortem care",
            "type": "text",
            "duration": "26 min",
            "description": "Placeholder — add the lesson content for \"Signs of approaching death & postmortem care\" (Teach, 26 min)."
          }
        ]
      },
      {
        "id": "cna-m16-s5",
        "title": "Module knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m16-s5-r1",
            "title": "Module knowledge check",
            "type": "text",
            "duration": "18 min",
            "description": "Placeholder — add the lesson content for \"Module knowledge check\" (Check, 18 min)."
          }
        ]
      }
    ]
  },
  {
    "id": "cna-m17",
    "title": "Module 17: Abuse Prevention, Recognition & Reporting",
    "summary": "6 hours / 300 minutes on preventing, recognizing & reporting abuse. Serious, legally weighted content — scenario-driven recognition training with strong emphasis on the reporting pathway. Split into several sittings. Planned content: 300 min; required minimum: 300 min (meets).",
    "requiredHours": 5,
    "moduleFee": 0,
    "order": 16,
    "sections": [
      {
        "id": "cna-m17-s1",
        "title": "Recognizing subtle signs of abuse",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m17-s1-r1",
            "title": "Recognizing subtle signs of abuse",
            "type": "text",
            "duration": "16 min",
            "description": "Placeholder — add the lesson content for \"Recognizing subtle signs of abuse\" (Scenario, 16 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s2",
        "title": "Types of abuse & how to recognize each",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m17-s2-r1",
            "title": "Types of abuse & how to recognize each",
            "type": "text",
            "duration": "60 min",
            "description": "Placeholder — add the lesson content for \"Types of abuse & how to recognize each\" (Teach, 60 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s3",
        "title": "A reporting decision under pressure",
        "description": "Opening scenario to anchor the lesson.",
        "resources": [
          {
            "id": "cna-m17-s3-r1",
            "title": "A reporting decision under pressure",
            "type": "text",
            "duration": "20 min",
            "description": "Placeholder — add the lesson content for \"A reporting decision under pressure\" (Scenario, 20 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s4",
        "title": "Preventing abuse: the CNA's role",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m17-s4-r1",
            "title": "Preventing abuse: the CNA's role",
            "type": "text",
            "duration": "50 min",
            "description": "Placeholder — add the lesson content for \"Preventing abuse: the CNA's role\" (Teach, 50 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s5",
        "title": "Mandated reporting: the legal pathway",
        "description": "Direct instruction.",
        "resources": [
          {
            "id": "cna-m17-s5-r1",
            "title": "Mandated reporting: the legal pathway",
            "type": "text",
            "duration": "55 min",
            "description": "Placeholder — add the lesson content for \"Mandated reporting: the legal pathway\" (Teach, 55 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s6",
        "title": "Case series: recognize, respond, report",
        "description": "Applied case work.",
        "resources": [
          {
            "id": "cna-m17-s6-r1",
            "title": "Case series: recognize, respond, report",
            "type": "text",
            "duration": "50 min",
            "description": "Placeholder — add the lesson content for \"Case series: recognize, respond, report\" (Apply, 50 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s7",
        "title": "Report or not? Guided decisions",
        "description": "Interactive practice.",
        "resources": [
          {
            "id": "cna-m17-s7-r1",
            "title": "Report or not? Guided decisions",
            "type": "text",
            "duration": "30 min",
            "description": "Placeholder — add the lesson content for \"Report or not? Guided decisions\" (Interact, 30 min)."
          }
        ]
      },
      {
        "id": "cna-m17-s8",
        "title": "Comprehensive knowledge check",
        "description": "Knowledge check.",
        "resources": [
          {
            "id": "cna-m17-s8-r1",
            "title": "Comprehensive knowledge check",
            "type": "text",
            "duration": "19 min",
            "description": "Placeholder — add the lesson content for \"Comprehensive knowledge check\" (Check, 19 min)."
          }
        ]
      }
    ]
  }
];
