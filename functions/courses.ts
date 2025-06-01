// Courses API module using Hono
import { Hono } from 'hono';
import { Env } from './types'; // Removed Variables import
import { authMiddleware } from './utils';

function createCoursesModule() {
  const app = new Hono<{ Bindings: Env }>();

// GET /courses - List all courses
app.get('/', authMiddleware, async (c) => {
  try {
    const courses = await c.env.DB.prepare(
      'SELECT id, title, description, level, created_at, updated_at FROM Courses ORDER BY id'
    ).all();
    
    return c.json({ courses: courses.results });
  } catch (dbError: any) {
    console.error('Database error fetching courses:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

// GET /courses/{courseId} - Get a single course by ID
app.get('/:courseId', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    const course = await c.env.DB.prepare(
      'SELECT id, title, description, level, created_at, updated_at FROM Courses WHERE id = ?1'
    ).bind(courseId).first();

    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }
    return c.json(course);
  } catch (dbError: any) {
    console.error('Database error fetching course:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

// POST /courses - Create a new course
app.post('/', authMiddleware, async (c) => {
  try {
    const { title, description, level } = await c.req.json();

    if (!title || !description || !level) {
      return c.json({ error: 'Missing required fields (title, description, level)' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO Courses (title, description, level) VALUES (?1, ?2, ?3) RETURNING id, title, description, level, created_at, updated_at'
    ).bind(title, description, level).first();

    if (!result) {
      return c.json({ error: 'Failed to create course' }, 500);
    }
    
    return c.json(result, 201);
  } catch (e: any) {
    console.error('Error creating course:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A course with this title already exists.' }, 409);
    }
    return c.json({ error: 'Server error creating course' }, 500);
  }
});

// PUT /courses/{courseId} - Update an existing course
app.put('/:courseId', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    const { title, description, level } = await c.req.json();

    if (!title && !description && !level) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    // Check if course exists
    const existingCourse = await c.env.DB.prepare('SELECT id FROM Courses WHERE id = ?1').bind(courseId).first();
    if (!existingCourse) {
      return c.json({ error: 'Course not found' }, 404);
    }

    let updateQuery = 'UPDATE Courses SET ';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (title) {
      updateQuery += `title = ?${paramIndex++}, `;
      params.push(title);
    }
    if (description) {
      updateQuery += `description = ?${paramIndex++}, `;
      params.push(description);
    }
    if (level) {
      updateQuery += `level = ?${paramIndex++}, `;
      params.push(level);
    }
    
    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = ?${paramIndex}`;
    params.push(courseId);
    
    // Remove trailing comma if any field was added
    updateQuery = updateQuery.replace(/, WHERE/, ' WHERE');


    const result = await c.env.DB.prepare(updateQuery)
      .bind(...params)
      .run();

    if (result.meta.changes === 0) {
      // This might happen if the data is the same or for other reasons
      return c.json({ error: 'Failed to update course or no changes made' }, 500);
    }

    const updatedCourse = await c.env.DB.prepare(
      'SELECT id, title, description, level, created_at, updated_at FROM Courses WHERE id = ?1'
    ).bind(courseId).first();

    return c.json(updatedCourse);
  } catch (e: any) {
    console.error('Error updating course:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A course with this title already exists.' }, 409);
    }
    return c.json({ error: 'Server error updating course' }, 500);
  }
});

// DELETE /courses/{courseId} - Delete a course
app.delete('/:courseId', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    // Check if course exists
    const existingCourse = await c.env.DB.prepare('SELECT id FROM Courses WHERE id = ?1').bind(courseId).first();
    if (!existingCourse) {
      return c.json({ error: 'Course not found' }, 404);
    }
    
    // Note: Consider implications of deleting a course with sections and units.
    // For now, we'll allow direct deletion. Cascading deletes should be set up in DB schema or handled here.
    const result = await c.env.DB.prepare('DELETE FROM Courses WHERE id = ?1').bind(courseId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Failed to delete course' }, 500);
    }

    return c.json({ message: 'Course deleted successfully' }, 200);
  } catch (e: any) {
    console.error('Error deleting course:', e);
    // Check for foreign key constraint errors if sections/units depend on this course
    // For SQLite, this might manifest as a generic error or a specific constraint violation message.
    if (e.message?.toUpperCase().includes('FOREIGN KEY CONSTRAINT FAILED')) {
        return c.json({ error: 'Cannot delete course because it has associated sections or learning units. Please delete them first.' }, 409);
    }
    return c.json({ error: 'Server error deleting course' }, 500);
  }
});

// GET /courses/{courseId}/sections - Get course sections
app.get('/:courseId/sections', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    const sections = await c.env.DB.prepare(
      'SELECT id, external_id, title, icon_ref, story_intro, summary, section_order, course_id FROM CourseSections WHERE course_id = ?1 ORDER BY section_order'
    ).bind(courseId).all();
    
    return c.json(sections.results); // Return array of sections directly
  } catch (dbError: any) {
    console.error('Database error fetching sections:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

// POST /courses/:courseId/sections - Create a new section for a course
app.post('/:courseId/sections', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    const { title, external_id, icon_ref, story_intro, summary, section_order } = await c.req.json();

    if (!title || section_order === undefined || !external_id) { // external_id is likely important
      return c.json({ error: 'Missing required fields (title, external_id, section_order)' }, 400);
    }

    // Check if course exists
    const courseExists = await c.env.DB.prepare('SELECT id FROM Courses WHERE id = ?1').bind(courseId).first();
    if (!courseExists) {
      return c.json({ error: 'Course not found' }, 404);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO CourseSections (course_id, title, external_id, icon_ref, story_intro, summary, section_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING id, course_id, title, external_id, icon_ref, story_intro, summary, section_order, created_at, updated_at'
    ).bind(courseId, title, external_id, icon_ref || null, story_intro || null, summary || null, section_order).first();

    if (!result) {
      return c.json({ error: 'Failed to create section' }, 500);
    }
    
    return c.json(result, 201);
  } catch (e: any) {
    console.error('Error creating section:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A section with this external_id or title might already exist for this course.' }, 409);
    }
    return c.json({ error: 'Server error creating section' }, 500);
  }
});

// PUT /courses/:courseId/sections/:sectionId - Update an existing section
app.put('/:courseId/sections/:sectionId', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  const sectionId = parseInt(c.req.param('sectionId'));

  if (isNaN(courseId) || isNaN(sectionId)) {
    return c.json({ error: 'Invalid course or section ID' }, 400);
  }

  try {
    const { title, external_id, icon_ref, story_intro, summary, section_order } = await c.req.json();

    if (!title && !external_id && !icon_ref && !story_intro && !summary && section_order === undefined) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    // Check if section exists and belongs to the course
    const existingSection = await c.env.DB.prepare(
      'SELECT id FROM CourseSections WHERE id = ?1 AND course_id = ?2'
    ).bind(sectionId, courseId).first();

    if (!existingSection) {
      return c.json({ error: 'Section not found or does not belong to this course' }, 404);
    }

    let updateQuery = 'UPDATE CourseSections SET ';
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (title !== undefined) { updateQuery += `title = ?${paramIndex++}, `; params.push(title); }
    if (external_id !== undefined) { updateQuery += `external_id = ?${paramIndex++}, `; params.push(external_id); }
    if (icon_ref !== undefined) { updateQuery += `icon_ref = ?${paramIndex++}, `; params.push(icon_ref); }
    if (story_intro !== undefined) { updateQuery += `story_intro = ?${paramIndex++}, `; params.push(story_intro); }
    if (summary !== undefined) { updateQuery += `summary = ?${paramIndex++}, `; params.push(summary); }
    if (section_order !== undefined) { updateQuery += `section_order = ?${paramIndex++}, `; params.push(section_order); }
    
    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = ?${paramIndex++} AND course_id = ?${paramIndex}`;
    params.push(sectionId, courseId);
    
    updateQuery = updateQuery.replace(/, updated_at/, ' updated_at'); // Clean up trailing comma

    const result = await c.env.DB.prepare(updateQuery).bind(...params).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Failed to update section or no changes made' }, 500);
    }

    const updatedSection = await c.env.DB.prepare(
      'SELECT id, course_id, title, external_id, icon_ref, story_intro, summary, section_order, created_at, updated_at FROM CourseSections WHERE id = ?1'
    ).bind(sectionId).first();

    return c.json(updatedSection);
  } catch (e: any) {
    console.error('Error updating section:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A section with this external_id or title might already exist for this course.' }, 409);
    }
    return c.json({ error: 'Server error updating section' }, 500);
  }
});

// DELETE /courses/:courseId/sections/:sectionId - Delete a section
app.delete('/:courseId/sections/:sectionId', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  const sectionId = parseInt(c.req.param('sectionId'));

  if (isNaN(courseId) || isNaN(sectionId)) {
    return c.json({ error: 'Invalid course or section ID' }, 400);
  }

  try {
    // Check if section exists and belongs to the course
    const existingSection = await c.env.DB.prepare(
      'SELECT id FROM CourseSections WHERE id = ?1 AND course_id = ?2'
    ).bind(sectionId, courseId).first();

    if (!existingSection) {
      return c.json({ error: 'Section not found or does not belong to this course' }, 404);
    }

    // Check for associated learning units
    const learningUnits = await c.env.DB.prepare(
      'SELECT id FROM LearningUnits WHERE section_id = ?1'
    ).bind(sectionId).all();

    if (learningUnits.results && learningUnits.results.length > 0) {
      return c.json({ error: 'Cannot delete section because it has associated learning units. Please delete them first.' }, 409);
    }

    const result = await c.env.DB.prepare('DELETE FROM CourseSections WHERE id = ?1 AND course_id = ?2')
      .bind(sectionId, courseId)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Failed to delete section' }, 500);
    }

    return c.json({ message: 'Section deleted successfully' }, 200);
  } catch (e: any) {
    console.error('Error deleting section:', e);
    // This check might be redundant if the learning units check is comprehensive
    if (e.message?.toUpperCase().includes('FOREIGN KEY CONSTRAINT FAILED')) {
        return c.json({ error: 'Cannot delete section due to foreign key constraints. Ensure all learning units are removed.' }, 409);
    }
    return c.json({ error: 'Server error deleting section' }, 500);
  }
});

// GET /courses/{courseId}/units - Get all learning units for a specific course
app.get('/:courseId/units', authMiddleware, async (c) => {
  const courseId = parseInt(c.req.param('courseId'));
  if (isNaN(courseId)) {
    return c.json({ error: 'Invalid course ID' }, 400);
  }

  try {
    // This query fetches all learning units that belong to sections of the given courseId.
    const units = await c.env.DB.prepare(
      'SELECT lu.id, lu.section_id, lu.external_id, lu.title, lu.explanation, lu.unit_type, lu.unit_data, lu.unit_order ' +
      'FROM LearningUnits lu ' +
      'JOIN CourseSections cs ON lu.section_id = cs.id ' +
      'WHERE cs.course_id = ?1 ORDER BY cs.section_order, lu.unit_order'
    ).bind(courseId).all();
    
    return c.json(units.results); // Return array of units directly
  } catch (dbError: any) {
    console.error('Database error fetching learning units for course:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});


// GET /sections/{sectionId}/units - Get learning units for a section (Keeping this for potential direct use, though App.tsx uses the one above)
app.get('/sections/:sectionId/units', authMiddleware, async (c) => {
  const sectionId = parseInt(c.req.param('sectionId'));
  if (isNaN(sectionId)) {
    return c.json({ error: 'Invalid section ID' }, 400);
  }

  try {
    // Ensure the 'explanation' field is selected, which it already is.
    // The content of 'explanation' in the DB should be a string (HTML/Markdown).
    // 'unit_data' will continue to be a JSON string.
    const units = await c.env.DB.prepare(
      'SELECT id, external_id, title, explanation, unit_type, unit_data, unit_order FROM LearningUnits WHERE section_id = ?1 ORDER BY unit_order'
    ).bind(sectionId).all();
    
    return c.json({ units: units.results });
  } catch (dbError: any) {
    console.error('Database error fetching learning units:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

// Learning Unit specific routes (nested under sections)

// POST /sections/:sectionId/units - Create a new learning unit for a section
app.post('/sections/:sectionId/units', authMiddleware, async (c) => {
  const sectionId = parseInt(c.req.param('sectionId'));
  if (isNaN(sectionId)) {
    return c.json({ error: 'Invalid section ID' }, 400);
  }

  try {
    const { title, external_id, explanation, unit_type, unit_data, unit_order } = await c.req.json();

    if (!title || !external_id || unit_order === undefined || !unit_type) {
      return c.json({ error: 'Missing required fields (title, external_id, unit_order, unit_type)' }, 400);
    }

    // Check if section exists
    const sectionExists = await c.env.DB.prepare('SELECT id FROM CourseSections WHERE id = ?1').bind(sectionId).first();
    if (!sectionExists) {
      return c.json({ error: 'Section not found' }, 404);
    }
    
    // Ensure unit_data is stringified if it's an object
    const unitDataString = typeof unit_data === 'string' ? unit_data : JSON.stringify(unit_data || {});

    const result = await c.env.DB.prepare(
      'INSERT INTO LearningUnits (section_id, title, external_id, explanation, unit_type, unit_data, unit_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING id, section_id, title, external_id, explanation, unit_type, unit_data, unit_order, created_at, updated_at'
    ).bind(sectionId, title, external_id, explanation || null, unit_type, unitDataString, unit_order).first();

    if (!result) {
      return c.json({ error: 'Failed to create learning unit' }, 500);
    }
    
    // Parse unit_data back to JSON for the response if it was stringified
    if (result && result.unit_data && typeof result.unit_data === 'string') {
      try {
        result.unit_data = JSON.parse(result.unit_data);
      } catch (parseError) {
        console.error("Failed to parse unit_data for response:", parseError);
        // Potentially return unit_data as string if parsing fails
      }
    }
    return c.json(result, 201);

  } catch (e: any) {
    console.error('Error creating learning unit:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A learning unit with this external_id or title might already exist for this section.' }, 409);
    }
    return c.json({ error: 'Server error creating learning unit' }, 500);
  }
});

// PUT /sections/:sectionId/units/:unitId - Update an existing learning unit
app.put('/sections/:sectionId/units/:unitId', authMiddleware, async (c) => {
  const sectionId = parseInt(c.req.param('sectionId'));
  const unitId = parseInt(c.req.param('unitId'));

  if (isNaN(sectionId) || isNaN(unitId)) {
    return c.json({ error: 'Invalid section or unit ID' }, 400);
  }

  try {
    const { title, external_id, explanation, unit_type, unit_data, unit_order } = await c.req.json();

    if (title === undefined && external_id === undefined && explanation === undefined && unit_type === undefined && unit_data === undefined && unit_order === undefined) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    // Check if unit exists and belongs to the section
    const existingUnit = await c.env.DB.prepare(
      'SELECT id FROM LearningUnits WHERE id = ?1 AND section_id = ?2'
    ).bind(unitId, sectionId).first();

    if (!existingUnit) {
      return c.json({ error: 'Learning unit not found or does not belong to this section' }, 404);
    }

    let updateQuery = 'UPDATE LearningUnits SET ';
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (title !== undefined) { updateQuery += `title = ?${paramIndex++}, `; params.push(title); }
    if (external_id !== undefined) { updateQuery += `external_id = ?${paramIndex++}, `; params.push(external_id); }
    if (explanation !== undefined) { updateQuery += `explanation = ?${paramIndex++}, `; params.push(explanation); }
    if (unit_type !== undefined) { updateQuery += `unit_type = ?${paramIndex++}, `; params.push(unit_type); }
    if (unit_data !== undefined) {
      const unitDataString = typeof unit_data === 'string' ? unit_data : JSON.stringify(unit_data || {});
      updateQuery += `unit_data = ?${paramIndex++}, `; 
      params.push(unitDataString);
    }
    if (unit_order !== undefined) { updateQuery += `unit_order = ?${paramIndex++}, `; params.push(unit_order); }
    
    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = ?${paramIndex++} AND section_id = ?${paramIndex}`;
    params.push(unitId, sectionId);
    
    updateQuery = updateQuery.replace(/, updated_at/, ' updated_at');

    const runResult = await c.env.DB.prepare(updateQuery).bind(...params).run();

    if (runResult.meta.changes === 0) {
      return c.json({ error: 'Failed to update learning unit or no changes made' }, 500);
    }

    const updatedUnit = await c.env.DB.prepare(
      'SELECT id, section_id, title, external_id, explanation, unit_type, unit_data, unit_order, created_at, updated_at FROM LearningUnits WHERE id = ?1'
    ).bind(unitId).first();

    // Parse unit_data back to JSON for the response
    if (updatedUnit && updatedUnit.unit_data && typeof updatedUnit.unit_data === 'string') {
      try {
        updatedUnit.unit_data = JSON.parse(updatedUnit.unit_data);
      } catch (parseError) {
        console.error("Failed to parse unit_data for updated unit response:", parseError);
      }
    }

    return c.json(updatedUnit);
  } catch (e: any) {
    console.error('Error updating learning unit:', e);
    if (e.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A learning unit with this external_id or title might already exist for this section.' }, 409);
    }
    return c.json({ error: 'Server error updating learning unit' }, 500);
  }
});

// DELETE /sections/:sectionId/units/:unitId - Delete a learning unit
app.delete('/sections/:sectionId/units/:unitId', authMiddleware, async (c) => {
  const sectionId = parseInt(c.req.param('sectionId'));
  const unitId = parseInt(c.req.param('unitId'));

  if (isNaN(sectionId) || isNaN(unitId)) {
    return c.json({ error: 'Invalid section or unit ID' }, 400);
  }

  try {
    // Check if unit exists and belongs to the section
    const existingUnit = await c.env.DB.prepare(
      'SELECT id FROM LearningUnits WHERE id = ?1 AND section_id = ?2'
    ).bind(unitId, sectionId).first();

    if (!existingUnit) {
      return c.json({ error: 'Learning unit not found or does not belong to this section' }, 404);
    }

    const result = await c.env.DB.prepare('DELETE FROM LearningUnits WHERE id = ?1 AND section_id = ?2')
      .bind(unitId, sectionId)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Failed to delete learning unit' }, 500);
    }

    return c.json({ message: 'Learning unit deleted successfully' }, 200);
  } catch (e: any) {
    console.error('Error deleting learning unit:', e);
    return c.json({ error: 'Server error deleting learning unit' }, 500);
  }
});

  return app;
}

export { createCoursesModule };
