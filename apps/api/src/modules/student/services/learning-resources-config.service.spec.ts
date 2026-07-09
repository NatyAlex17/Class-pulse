import { LearningResourcesConfigService } from './learning-resources-config.service';

describe('LearningResourcesConfigService', () => {
  let service: LearningResourcesConfigService;

  beforeEach(() => {
    service = new LearningResourcesConfigService();
    service.resetToDefault();
  });

  it('imports curriculum rows from CSV into module, section, and resource groups', () => {
    const csv = [
      'module_id,module_title,module_summary,module_required_hours,module_fee,module_order,section_id,section_title,section_description,resource_id,resource_title,resource_type,resource_duration,resource_description,resource_content',
      '"m1","Module 1","Module summary",2,25,1,"m1-s1","Lesson 1","Lesson description","m1-s1-r1","Lesson 1 text","text","30 min","Imported lesson","Lesson content"',
      '"m1","Module 1","Module summary",2,25,1,"m1-s2","Lesson 2","Lesson description","m1-s2-r1","Lesson 2 text","text","30 min","Imported lesson","Lesson content"',
    ].join('\n');

    const imported = service.importFromCsvContent(csv);

    expect(imported.summary).toEqual({
      modules: 1,
      sections: 2,
      resources: 2,
    });
    expect(imported.config.modules[0]?.moduleFee).toBe(25);
    expect(imported.config.modules[0]?.sections[1]?.resources[0]?.title).toBe('Lesson 2 text');
  });

  it('rejects CSV files that are missing required headers', () => {
    const csv = ['module_id,module_title', '"m1","Module 1"'].join('\n');

    expect(() => service.importFromCsvContent(csv)).toThrow('missing required columns');
  });
});
