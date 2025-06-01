// Courses API module using Hono
import { Hono } from 'hono';
import { Env, Variables } from './types';
import { authMiddleware } from './utils';

function createCoursesModule() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /courses - List all courses
app.get('/', authMiddleware, async (c) => {
  try {
    const courses = await c.env.DB.prepare(
      'SELECT id, title, description, created_at, updated_at FROM Courses ORDER BY id'
    ).all();
    
    return c.json({ courses: courses.results });
  } catch (dbError: any) {
    console.error('Database error fetching courses:', dbError);
    return c.json({ error: 'Database error' }, 500);
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
      'SELECT id, external_id, title, icon_ref, story_intro, summary, section_order FROM CourseSections WHERE course_id = ?1 ORDER BY section_order'
    ).bind(courseId).all();
    
    return c.json({ sections: sections.results });
  } catch (dbError: any) {
    console.error('Database error fetching sections:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

// GET /sections/{sectionId}/units - Get learning units for a section
app.get('/sections/:sectionId/units', authMiddleware, async (c) => {
  const sectionId = parseInt(c.req.param('sectionId'));
  if (isNaN(sectionId)) {
    return c.json({ error: 'Invalid section ID' }, 400);
  }

  try {
    const units = await c.env.DB.prepare(
      'SELECT id, external_id, title, explanation, unit_type, unit_data, unit_order FROM LearningUnits WHERE section_id = ?1 ORDER BY unit_order'
    ).bind(sectionId).all();
    
    return c.json({ units: units.results });
  } catch (dbError: any) {
    console.error('Database error fetching learning units:', dbError);
    return c.json({ error: 'Database error' }, 500);
  }
});

  return app;
}

export { createCoursesModule };
