// Database population script for Quantum Adventure
// This script extracts course content from constants.tsx and populates the D1 database

import { MODULES } from '../src/constants';

// Type definitions for database insertion
interface CourseData {
  title: string;
  description: string;
}

interface SectionData {
  course_id: number;
  external_id: string;
  title: string;
  icon_ref: string;
  story_intro: string;
  summary: string;
  section_order: number;
}

interface LearningUnitData {
  section_id: number;
  external_id: string;
  title: string;
  explanation: string;
  unit_type: string;
  unit_data: string | null;
  unit_order: number;
}

/**
 * Generates SQL INSERT statements for populating the database
 */
export function generateDatabasePopulationSQL(): string {
  const sqlStatements: string[] = [];

  // Insert main course
  const courseData: CourseData = {
    title: 'Quantum Computing Fundamentals',
    description: 'An interactive journey into the world of quantum mechanics and computation. Explore qubits, quantum gates, algorithms, and the future of quantum technology.'
  };

  sqlStatements.push(`-- Insert main course`);
  sqlStatements.push(`INSERT INTO Courses (title, description) VALUES ('${courseData.title}', '${courseData.description}');`);
  sqlStatements.push('');

  // Insert sections (modules)
  sqlStatements.push(`-- Insert course sections`);
  MODULES.forEach((module, index) => {
    const iconRef = extractIconRef(module.icon);
    const sectionData: SectionData = {
      course_id: 1, // Assuming first course
      external_id: module.id,
      title: module.title,
      icon_ref: iconRef,
      story_intro: module.storyIntro,
      summary: module.summary,
      section_order: index
    };

    const sql = `INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES (${sectionData.course_id}, '${escapeSql(sectionData.external_id)}', '${escapeSql(sectionData.title)}', '${sectionData.icon_ref}', '${escapeSql(sectionData.story_intro)}', '${escapeSql(sectionData.summary)}', ${sectionData.section_order});`;
    sqlStatements.push(sql);
  });
  sqlStatements.push('');

  // Insert learning units (concepts)
  sqlStatements.push(`-- Insert learning units`);
  MODULES.forEach((module, moduleIndex) => {
    const sectionId = moduleIndex + 1; // Assuming sections are inserted in order starting from 1
    
    module.concepts.forEach((concept, conceptIndex) => {
      const unitData = generateUnitData(concept);
      const learningUnit: LearningUnitData = {
        section_id: sectionId,
        external_id: concept.id,
        title: concept.title,
        explanation: concept.explanation,
        unit_type: concept.type,
        unit_data: unitData,
        unit_order: conceptIndex
      };

      const unitDataSql = learningUnit.unit_data ? `'${escapeSql(learningUnit.unit_data)}'` : 'NULL';
      const sql = `INSERT INTO LearningUnits (section_id, external_id, title, explanation, unit_type, unit_data, unit_order) VALUES (${learningUnit.section_id}, '${escapeSql(learningUnit.external_id)}', '${escapeSql(learningUnit.title)}', '${escapeSql(learningUnit.explanation)}', '${learningUnit.unit_type}', ${unitDataSql}, ${learningUnit.unit_order});`;
      sqlStatements.push(sql);
    });
  });

  sqlStatements.push('');
  sqlStatements.push(`-- Database population complete`);
  sqlStatements.push(`-- Total sections: ${MODULES.length}`);
  sqlStatements.push(`-- Total learning units: ${MODULES.reduce((total, module) => total + module.concepts.length, 0)}`);

  return sqlStatements.join('\n');
}

/**
 * Extract icon reference from React component
 */
function extractIconRef(iconComponent: any): string {
  // This is a simplified approach - in a real implementation, you might need a mapping
  const iconString = iconComponent?.type?.name || 'DefaultIcon';
  return iconString.replace('Icon', '') || 'Default';
}

/**
 * Generate unit_data JSON based on concept type and content
 */
function generateUnitData(concept: any): string | null {
  switch (concept.type) {
    case 'QUBIT_VISUALIZER':
      return JSON.stringify({
        initialAlpha: concept.initialState?.alpha || 1,
        initialBeta: concept.initialState?.beta || 0
      });

    case 'GATE_APPLICATION':
      return JSON.stringify({
        availableGates: concept.availableGates || ['X', 'Y', 'Z', 'H'],
        targetState: concept.targetState || { alpha: 0, beta: 1 }
      });

    case 'QUIZ':
      return JSON.stringify({
        question: concept.question || '',
        options: concept.options || [],
        correctAnswer: concept.correctAnswer || 0,
        feedbackCorrect: concept.feedbackCorrect || 'Correct!',
        feedbackIncorrect: concept.feedbackIncorrect || 'Try again!'
      });

    case 'CIRCUIT_BUILDER':
      return JSON.stringify({
        targetCircuit: concept.targetCircuit || [],
        availableGates: concept.availableGates || ['H', 'X', 'Y', 'Z', 'CNOT']
      });

    case 'BELL_STATE':
      return JSON.stringify({
        targetBellState: concept.targetBellState || 'phi_plus'
      });

    case 'REFLECTION_PROMPT':
      return JSON.stringify({
        prompt: concept.prompt || 'Reflect on what you learned.'
      });

    case 'INFO':
    default:
      return null;
  }
}

/**
 * Escape SQL strings to prevent injection
 */
function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

/**
 * Main function to generate and save the population script
 */
if (require.main === module) {
  const sql = generateDatabasePopulationSQL();
  console.log(sql);
}
