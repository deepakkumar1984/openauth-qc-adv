-- Database population script for Quantum Adventure
-- This file contains INSERT statements to populate the database with course content

-- Insert main course
INSERT INTO Courses (title, description) VALUES ('Quantum Computing Fundamentals', 'An interactive journey into the world of quantum mechanics and computation. Explore qubits, quantum gates, algorithms, and the future of quantum technology.');

-- Insert course sections (modules)
INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES 
(1, 'intro-qubits', 'The Quantum Leap: Meet the Qubit', 'AcademicCap', 'Welcome, brave explorer, to the Quantum Realm! Forget everything you know about classical bits that are simply 0 or 1. We''re about to meet the qubit, the mischievous and powerful hero of our story. It''s a particle of pure potential!', 'You met the qubit and discovered its superposition powers!', 0),
(1, 'quantum-gates', 'Quantum Gates: The Tools of Transformation', 'LightBulb', 'Now that you''ve befriended the qubit, it''s time to learn how to manipulate and control these quantum states. Enter the quantum gates—the magical tools that can rotate, flip, and entangle qubits in ways that would make classical logic jealous!', 'You mastered the art of quantum gates and transformations!', 1),
(1, 'entanglement', 'Quantum Entanglement: The Spooky Connection', 'Sparkles', 'Prepare to witness one of the most mind-bending phenomena in quantum mechanics! When qubits become entangled, they form an unbreakable bond that transcends space and time. Einstein called it "spooky action at a distance," but we call it absolutely magical!', 'You explored the mysterious world of quantum entanglement!', 2),
(1, 'superposition-deep', 'Superposition Mastery: Living in Multiple Realities', 'PuzzlePiece', 'Time to dive deeper into the quantum rabbit hole! Superposition isn''t just about being 0 and 1 simultaneously—it''s about existing in multiple realities at once. Let''s explore how this quantum weirdness becomes computational power!', 'You mastered the art of quantum superposition!', 3),
(1, 'measurement', 'Quantum Measurement: Collapsing the Wave Function', 'CodeBracketSquare', 'Every quantum story has a moment of truth—the measurement! When we observe a qubit, we force it to choose a side, collapsing its wave function into a definite state. But timing is everything in the quantum world!', 'You learned the delicate art of quantum measurement!', 4),
(1, 'interference', 'Quantum Interference: The Dance of Probabilities', 'Sparkles', 'Watch as quantum states dance together, amplifying some possibilities while canceling others! Quantum interference is like conducting an orchestra of probabilities, creating beautiful patterns that classical computers could never achieve!', 'You orchestrated the symphony of quantum interference!', 5),
(1, 'algorithms', 'Quantum Algorithms: Where Magic Meets Logic', 'CodeBracketSquare', 'Now comes the grand finale—putting it all together to create quantum algorithms that can solve problems classical computers struggle with! From searching databases to factoring numbers, quantum algorithms are reshaping what''s possible!', 'You unlocked the power of quantum algorithms!', 6),
(1, 'future', 'The Quantum Future: Your Adventure Continues', 'Sparkles', 'The quantum realm is vast and full of mysteries yet to be solved. As you''ve learned the fundamentals, you''re now ready to join the quantum revolution! The future is quantum, and you''re part of it!', 'You''re ready to shape the quantum future!', 7);

-- Insert learning units for intro-qubits section
INSERT INTO LearningUnits (section_id, external_id, title, explanation, unit_type, unit_data, unit_order) VALUES 
(1, 'c1-1', 'Classical Bits vs. Qubits', 'Classical bits are like light switches—they''re either ON (1) or OFF (0). But qubits? They''re like magical coins that can be heads, tails, or spinning in the air showing both sides at once! This "spinning" state is called superposition, and it''s what gives quantum computers their incredible power.', 'INFO', NULL, 0),
(1, 'c1-2', 'Visualizing a Qubit', 'Let''s see your first qubit in action! This quantum particle exists in a superposition state—it''s both 0 and 1 until we measure it. Watch how the probabilities dance!', 'QUBIT_VISUALIZER', '{"initialAlpha": 1, "initialBeta": 0}', 1),
(1, 'c1-3', 'The Bloch Sphere', 'Every qubit can be represented as a point on a magical sphere called the Bloch sphere. The north pole is |0⟩, the south pole is |1⟩, and everywhere else represents different superposition states. It''s like a globe, but for quantum states!', 'INFO', NULL, 2),
(1, 'c1-4', 'Superposition in Action', 'Now let''s create a true superposition state! Move the qubit to the equator of the Bloch sphere and watch the magic happen—it''s equally likely to be measured as 0 or 1!', 'QUBIT_VISUALIZER', '{"initialAlpha": 0.707, "initialBeta": 0.707}', 3),
(1, 'c1-5', 'Quiz: Understanding Qubits', 'Time to test your quantum knowledge! Don''t worry—in the quantum world, learning is just another form of superposition!', 'QUIZ', '{"question": "What makes a qubit different from a classical bit?", "options": ["It can only be 0 or 1", "It can be in superposition of 0 and 1", "It''s faster than classical bits", "It''s smaller than classical bits"], "correctAnswer": 1, "feedbackCorrect": "Exactly! Superposition is the quantum superpower!", "feedbackIncorrect": "Not quite! Think about what makes quantum special..."}', 4);

-- Insert learning units for quantum-gates section
INSERT INTO LearningUnits (section_id, external_id, title, explanation, unit_type, unit_data, unit_order) VALUES 
(2, 'c2-1', 'Introduction to Quantum Gates', 'Quantum gates are like magic spells that transform qubit states! Unlike classical logic gates that work with definite 0s and 1s, quantum gates work with probability amplitudes and can create superposition and entanglement. They''re the building blocks of quantum algorithms!', 'INFO', NULL, 0),
(2, 'c2-2', 'The X Gate (Quantum NOT)', 'Meet the X gate—the quantum version of NOT! It flips |0⟩ to |1⟩ and vice versa. But when applied to a superposition state, it does something much more interesting...', 'GATE_APPLICATION', '{"availableGates": ["X"], "targetState": {"alpha": 0, "beta": 1}}', 1),
(2, 'c2-3', 'The Hadamard Gate', 'The Hadamard gate is the superposition creator! It takes |0⟩ and puts it into an equal superposition of |0⟩ and |1⟩. It''s like giving your qubit the quantum equivalent of a magical transformation!', 'GATE_APPLICATION', '{"availableGates": ["H"], "targetState": {"alpha": 0.707, "beta": 0.707}}', 2),
(2, 'c2-4', 'The Z Gate (Phase Flip)', 'The Z gate is subtle but powerful—it flips the phase of the |1⟩ state while leaving |0⟩ unchanged. You might not see the effect immediately, but it''s crucial for quantum interference!', 'GATE_APPLICATION', '{"availableGates": ["Z"], "targetState": {"alpha": 1, "beta": 0}}', 3),
(2, 'c2-5', 'Gate Combinations', 'Now let''s combine gates! Try creating different quantum states by applying multiple gates in sequence. Remember: in quantum mechanics, the order matters!', 'GATE_APPLICATION', '{"availableGates": ["H", "X", "Y", "Z"], "targetState": {"alpha": 0, "beta": -1}}', 4);

-- Insert learning units for entanglement section
INSERT INTO LearningUnits (section_id, external_id, title, explanation, unit_type, unit_data, unit_order) VALUES 
(3, 'c3-1', 'What is Entanglement?', 'Quantum entanglement occurs when qubits become correlated in such a way that measuring one instantly affects the other, no matter how far apart they are! It''s like having two magical coins that always land on opposite sides, even if one is on Earth and the other is on Mars!', 'INFO', NULL, 0),
(3, 'c3-2', 'Bell States: The Entangled Pairs', 'Bell states are the four maximally entangled two-qubit states. They''re named after John Bell, who proved that quantum entanglement is real and not just a theoretical curiosity. Let''s create the famous |Φ+⟩ Bell state!', 'BELL_STATE', '{"targetBellState": "phi_plus"}', 1),
(3, 'c3-3', 'Creating Entanglement', 'To create entanglement, we typically start with one qubit in superposition and then apply a CNOT gate. Watch as two independent qubits become forever linked!', 'CIRCUIT_BUILDER', '{"targetCircuit": [{"gate": "H", "qubit": 0}, {"gate": "CNOT", "control": 0, "target": 1}], "availableGates": ["H", "X", "CNOT"]}', 2),
(3, 'c3-4', 'Measuring Entangled Qubits', 'When you measure one qubit of an entangled pair, you instantly know the state of the other! This isn''t communication—it''s correlation. The spookiness comes from the fact that neither qubit had a definite state before measurement!', 'INFO', NULL, 3),
(3, 'c3-5', 'Reflection: Entanglement Applications', 'Entanglement is the foundation of quantum communication, quantum cryptography, and quantum computing. How do you think this "spooky action at a distance" could be used to solve real-world problems?', 'REFLECTION_PROMPT', '{"prompt": "Think about how quantum entanglement could revolutionize communication, security, or computation. What applications excite you the most?"}', 4);

-- Add some sample achievements
INSERT INTO Achievements (name, description, icon_url, criteria_type, criteria_value) VALUES 
('First Steps', 'Completed your first learning unit', '/icons/first-steps.svg', 'COMPLETE_LEARNING_UNIT', '1'),
('Qubit Master', 'Completed the Introduction to Qubits section', '/icons/qubit-master.svg', 'COMPLETE_SECTION', '1'),
('Gate Keeper', 'Completed the Quantum Gates section', '/icons/gate-keeper.svg', 'COMPLETE_SECTION', '2'),
('Entanglement Expert', 'Completed the Entanglement section', '/icons/entanglement-expert.svg', 'COMPLETE_SECTION', '3'),
('Quiz Champion', 'Scored 100% on a quiz', '/icons/quiz-champion.svg', 'SCORE_THRESHOLD_QUIZ', '100'),
('Quantum Pioneer', 'Completed all available content', '/icons/quantum-pioneer.svg', 'COMPLETE_COURSE', '1');

-- Database population complete
-- Total sections: 8
-- Total learning units: 15 (sample units for first 3 sections)
