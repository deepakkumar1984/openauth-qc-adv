-- Database population script for Quantum Adventure
-- This file contains INSERT statements to populate the database with course content

-- Clear existing data
DELETE FROM UserProgress;
DELETE FROM UserAchievements;
DELETE FROM Achievements;
DELETE FROM LearningUnits;
DELETE FROM CourseSections;
DELETE FROM Courses;

-- Insert Courses
INSERT INTO Courses (title, description) VALUES 
('Quantum Quest: The Beginner''s Journey', 'Embark on an epic adventure through the quantum realm! Perfect for curious minds ready to explore the weird and wonderful world of quantum computing.'),
('Quantum Leap: Intermediate Explorations', 'Ready to dive deeper? These modules will challenge your understanding and expand your quantum toolkit.'),
('Quantum Frontiers: Advanced Expeditions', 'Push the boundaries of your knowledge. Explore cutting-edge topics and prepare to contribute to the quantum revolution.');

-- Insert Beginner Course Sections
INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES 
(1, 'introduction-to-quantum', '🚀 Quantum Awakening: What''s the Buzz?', 'RocketLaunch', 'So you’ve heard of quantum technology and how it’s going to revolutionize, well, everything. How do we know that and how does it work? Jump in here to find out!', 'Understood the revolutionary potential of quantum technology.', 0),
(1, 'superposition-principles', '🌀 Superposition: The Art of Being Everywhere', 'Sparkles', 'This skill introduces the superposition principle. You''ll gain insight into where this principle comes from, why it is necessary, and what you can do with it.', 'Grasped the fundamental concept of quantum superposition.', 1),
(1, 'qubits-fundamentals', '💎 Qubits: The Quantum Encoders', 'Cube', 'Start with some fundamentals in how we represent information and by the end of this skill you''ll understand how we can encode and process information using quantum physics!', 'Learned how qubits encode and process information.', 2),
(1, 'measurement-in-quantum', '🔍 Measurement: The Decisive Moment', 'MagnifyingGlass', 'Measurement the destructor. What does it mean to measure something in general? What does it mean to measure something in quantum physics? Discover the dirty secrets about measurement in quantum computing.', 'Uncovered the role and impact of measurement in quantum physics.', 3);

-- Insert Intermediate Course Sections  
INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES 
(2, 'quantum-circuits', '⚡ Quantum Circuits: Blueprints of the Quantum Realm', 'CircuitBoard', 'How do we represent the programs to be run on quantum computers? After this skill you''ll be able to decipher some of the cool diagrams you see in the field.', 'Mastered the art of reading and understanding quantum circuits.', 0),
(2, 'quantum-entanglement', '🕸️ Entanglement: Spooky Action, Powerful Connections', 'LinkIcon', 'Einstein called it "spooky action at a distance." It''s not so spooky, but it may be extremely useful! Discover the most quintessential concept in quantum physics.', 'Explored the mysteries and power of quantum entanglement.', 1),
(2, 'quantum-noise', '🥷 Noise: The Quantum Gremlins', 'ShieldCheck', 'Why don''t we have useful quantum computers yet? Learn what''s holding us back through an understanding of how noise and interference affect quantum computers.', 'Understood the challenges of noise in quantum computation.', 2),
(2, 'quantum-control', '🎮 Quantum Control: Taming the Quantum World', 'AdjustmentsHorizontal', 'Learn all about quantum control and how it is used to create quantum gates and combat noise.', 'Learned techniques for quantum control and noise mitigation.', 3),
(2, 'quantum-coding', '💻 Quantum Coding: Your First Quantum Program', 'CodeBracket', 'Ready for the real thing? Here''s your introduction to the challenges of programming a quantum computer.', 'Took the first steps into programming a quantum computer.', 4);

-- Insert Advanced Course Sections
INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES
(3, 'advanced-algorithms-quest', '🌌 The Algorithmist''s Odyssey: Legendary Quantum Recipes', 'Scroll', 'You''ve mastered the basics, brave adventurer! Now, journey into the heart of quantum power. We''ll unearth legendary algorithms like Shor''s and Grover''s – spells that can break modern encryption and search the unsearchable. Prepare to wield computational magic!', 'Deciphered legendary quantum algorithms and their world-changing applications.', 0),
(3, 'error-correction-citadel', '🛡️ Citadel of Resilience: Forging Unbreakable Qubits', 'ShieldLock', 'The quantum realm is fraught with peril – noise and decoherence threaten our delicate qubits. Enter the Citadel of Resilience, where you''ll master the advanced arts of Quantum Error Correction. Learn to build fortresses of code that protect quantum information and pave the way for fault-tolerant quantum computers!', 'Mastered advanced quantum error correction codes to protect qubits from decoherence.', 1),
(3, 'quantum-ml-voyage', '🧠 Symbiosis Sagacity: The Quantum AI Convergence', 'BrainCircuit', 'Witness the dawn of a new intelligence! Embark on a voyage to where quantum mechanics and artificial intelligence converge. Explore how quantum machine learning algorithms could solve intractable problems and unlock new paradigms of thinking machines. The future of AI is quantum-woven!', 'Explored the fusion of quantum computing and AI, unlocking new intelligent frontiers.', 2),
(3, 'hardware-frontiers-expedition', '🛠️ The Qubit Forgemasters: Architectures of Tomorrow', 'Chip', 'Venture into the very heart of quantum machines! This expedition takes you deep into the diverse and experimental world of quantum hardware. From superconducting loops to trapped ions and photonic pathways, discover how these marvels are engineered and the grand challenges that lie in scaling them to their full potential.', 'Journeyed through diverse quantum hardware architectures and their cutting-edge challenges.', 3),
(3, 'quantum-internet-pioneers', '🌐 Weavers of the Quantum Web: The Entangled Internet', 'GlobeNetwork', 'Imagine a network bound by the very laws of quantum mechanics, offering unbreachable security and instantaneous connections. Join the pioneers weaving the Quantum Internet, a tapestry of entangled particles stretching across the globe. Explore the protocols, the promises, and the profound implications of this next-generation communication frontier.', 'Charted the course for the Quantum Internet and its revolutionary communication capabilities.', 4);

-- Learning Units for Beginner Course (Quantum Quest: The Beginner''s Journey - course_id 1)

-- Section: introduction-to-quantum
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'introduction-to-quantum' AND course_id = 1), 'The Quantum Spark: A New Kind of Magic', 'text', 'Discover the very basics of quantum mechanics and why it’s cooler than science fiction.', 10, 0),
((SELECT id FROM CourseSections WHERE external_id = 'introduction-to-quantum' AND course_id = 1), 'Classical vs Quantum: A Tale of Two Worlds', 'video', '/videos/classical-vs-quantum.mp4', 15, 1),
((SELECT id FROM CourseSections WHERE external_id = 'introduction-to-quantum' AND course_id = 1), 'Quantum Puzzle Box: First Challenge', 'interactive', 'IntroQuantumPuzzle', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'introduction-to-quantum' AND course_id = 1), 'Awakening Quiz: Test Your Spark', 'quiz', 'intro_quiz', 10, 3);

-- Section: superposition-principles
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'superposition-principles' AND course_id = 1), 'The Art of Both: Understanding Superposition', 'text', 'Learn how quantum particles can be in multiple states at once. It’s like being in two places at the same time!', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'superposition-principles' AND course_id = 1), 'Wave-Particle Duality Dance', 'video', '/videos/wave-particle.mp4', 10, 1),
((SELECT id FROM CourseSections WHERE external_id = 'superposition-principles' AND course_id = 1), 'Superposition Spinner: Interactive Demo', 'interactive', 'SuperpositionSpinner', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'superposition-principles' AND course_id = 1), 'Duality Dilemma: Superposition Quiz', 'quiz', 'superposition_quiz', 10, 3);

-- Section: qubits-fundamentals
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'qubits-fundamentals' AND course_id = 1), 'Qubits: The Quantum Alphabets', 'text', 'Meet the qubit, the fundamental building block of quantum computers. More than just 0s and 1s!', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'qubits-fundamentals' AND course_id = 1), 'Visualizing Qubits: The Bloch Sphere', 'video', '/videos/bloch-sphere.mp4', 15, 1),
((SELECT id FROM CourseSections WHERE external_id = 'qubits-fundamentals' AND course_id = 1), 'Qubit Constructor: Build Your Own Qubit', 'interactive', 'QubitConstructor', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'qubits-fundamentals' AND course_id = 1), 'Encoder''s Test: Qubit Quiz', 'quiz', 'qubit_quiz', 10, 3);

-- Section: measurement-in-quantum
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'measurement-in-quantum' AND course_id = 1), 'The Observer Effect: Peeking into the Quantum World', 'text', 'Discover what happens when we try to measure a quantum state. Spoiler: it changes things!', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'measurement-in-quantum' AND course_id = 1), 'Quantum Collapse Explained', 'video', '/videos/quantum-collapse.mp4', 10, 1),
((SELECT id FROM CourseSections WHERE external_id = 'measurement-in-quantum' AND course_id = 1), 'Measurement Lab: The Decisive Experiment', 'interactive', 'MeasurementLab', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'measurement-in-quantum' AND course_id = 1), 'Decisive Moment Quiz: Test Your Observation Skills', 'quiz', 'measurement_quiz', 10, 3);

-- Learning Units for Intermediate Course (Quantum Leap: Intermediate Explorations - course_id 2)

-- Section: quantum-circuits
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-circuits' AND course_id = 2), 'Quantum Gates: The Tools of a Quantum Architect', 'text', 'Learn about Hadamard, CNOT, and other fundamental quantum gates.', 20, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-circuits' AND course_id = 2), 'Building Your First Quantum Circuit', 'interactive', 'QuantumCircuitBuilder', 25, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-circuits' AND course_id = 2), 'Circuit Analysis: Reading Quantum Blueprints', 'video', '/videos/circuit-analysis.mp4', 15, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-circuits' AND course_id = 2), 'Architect''s Exam: Quantum Circuits Quiz', 'quiz', 'circuits_quiz', 15, 3);

-- Section: quantum-entanglement
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-entanglement' AND course_id = 2), 'Entanglement: Einstein''s Spooky Connection', 'text', 'Explore the fascinating phenomenon of entanglement where particles become linked.', 20, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-entanglement' AND course_id = 2), 'Bell''s Test: Proving Quantum Weirdness', 'video', '/videos/bells-test.mp4', 15, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-entanglement' AND course_id = 2), 'Entanglement Weaver: Create Entangled Pairs', 'interactive', 'EntanglementWeaver', 25, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-entanglement' AND course_id = 2), 'Spooky Quiz: Test Your Entanglement Knowledge', 'quiz', 'entanglement_quiz', 15, 3);

-- Section: quantum-noise
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-noise' AND course_id = 2), 'The Quantum Gremlins: Understanding Noise and Decoherence', 'text', 'Learn how environmental factors can disrupt quantum computations.', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-noise' AND course_id = 2), 'Sources of Quantum Noise', 'video', '/videos/quantum-noise-sources.mp4', 10, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-noise' AND course_id = 2), 'Noise Simulator: The Gremlin Attack', 'interactive', 'NoiseSimulator', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-noise' AND course_id = 2), 'Gremlin Hunt: Noise Quiz', 'quiz', 'noise_quiz', 10, 3);

-- Section: quantum-control
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-control' AND course_id = 2), 'Taming the Quantum: Introduction to Quantum Control', 'text', 'Discover techniques to manipulate and protect quantum states.', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-control' AND course_id = 2), 'Pulse Shaping: The Conductor''s Baton', 'video', '/videos/pulse-shaping.mp4', 15, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-control' AND course_id = 2), 'Quantum Gate Calibration Challenge', 'interactive', 'GateCalibrationSim', 25, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-control' AND course_id = 2), 'Conductor''s Challenge: Control Quiz', 'quiz', 'control_quiz', 15, 3);

-- Section: quantum-coding
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-coding' AND course_id = 2), 'Your First Quantum Algorithm: Deutsch-Jozsa', 'text', 'Write and understand your first simple quantum algorithm.', 20, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-coding' AND course_id = 2), 'Coding with Qiskit: A Practical Introduction', 'video', '/videos/qiskit-intro.mp4', 20, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-coding' AND course_id = 2), 'Quantum Code Playground: Deutsch-Jozsa Simulator', 'interactive', 'DeutschJozsaSim', 30, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-coding' AND course_id = 2), 'Coder''s Gauntlet: First Algorithm Quiz', 'quiz', 'coding_quiz', 15, 3);

-- Insert Learning Units for Advanced Course (Quantum Frontiers: Advanced Expeditions - course_id 3)

-- Section: advanced-algorithms-quest
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'advanced-algorithms-quest' AND course_id = 3), 'The Oracle''s Riddle: Unmasking Grover''s Search', 'text', 'Delve into the mystical Grover''s algorithm, a quantum search spell that finds needles in cosmic haystacks.', 20, 0),
((SELECT id FROM CourseSections WHERE external_id = 'advanced-algorithms-quest' AND course_id = 3), 'Shor''s Cipher Cracker: The Key to Ancient Locks', 'interactive', 'ShorAlgorithmSim', 30, 1),
((SELECT id FROM CourseSections WHERE external_id = 'advanced-algorithms-quest' AND course_id = 3), 'Quantum Phase Estimation: Charting Unknown Energies', 'video', '/videos/qpe-explained.mp4', 15, 2),
((SELECT id FROM CourseSections WHERE external_id = 'advanced-algorithms-quest' AND course_id = 3), 'The Alchemist''s Challenge: Variational Quantum Eigensolvers', 'quiz', 'vqe_quiz', 25, 3);

-- Section: error-correction-citadel
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'error-correction-citadel' AND course_id = 3), 'The Quantum Knight''s Oath: Understanding Decoherence', 'text', 'Learn about the dragon of decoherence and why quantum knights must shield their precious qubits.', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'error-correction-citadel' AND course_id = 3), 'Forging the Shor Code: The First Quantum Armor', 'interactive', 'ShorCodeSim', 25, 1),
((SELECT id FROM CourseSections WHERE external_id = 'error-correction-citadel' AND course_id = 3), 'Surface Sentry: The Promise of Topological Codes', 'video', '/videos/surface-codes.mp4', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'error-correction-citadel' AND course_id = 3), 'The Stabilizer''s Vigil: Mastering Quantum Error Correction', 'quiz', 'qec_stabilizer_quiz', 20, 3);

-- Section: quantum-ml-voyage
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-ml-voyage' AND course_id = 3), 'The Oracle of QML: Introduction to Quantum Machine Learning', 'text', 'Gaze into the crystal ball of QML. What mysteries can quantum computers unlock for AI?', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-ml-voyage' AND course_id = 3), 'Quantum Kernels: Weaving New Data Dimensions', 'interactive', 'QuantumKernelExplorer', 25, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-ml-voyage' AND course_id = 3), 'Variational Classifiers: Training Quantum Sentinels', 'video', '/videos/variational-classifiers.mp4', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-ml-voyage' AND course_id = 3), 'The Neural Network Nexus: Quantum Meets Deep Learning', 'quiz', 'qnn_quiz', 20, 3);

-- Section: hardware-frontiers-expedition
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'hardware-frontiers-expedition' AND course_id = 3), 'The Superconducting Spires: Journey to Low Temperatures', 'text', 'Descend into the cryogenic realms where superconducting qubits reign supreme.', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'hardware-frontiers-expedition' AND course_id = 3), 'Trapped Ion Sanctuaries: Qubits Held by Light', 'video', '/videos/trapped-ions.mp4', 20, 1),
((SELECT id FROM CourseSections WHERE external_id = 'hardware-frontiers-expedition' AND course_id = 3), 'Photonic Pathways: Qubits Riding on Light Beams', 'interactive', 'PhotonicQubitSim', 25, 2),
((SELECT id FROM CourseSections WHERE external_id = 'hardware-frontiers-expedition' AND course_id = 3), 'The Neutral Atom Grid: Assembling Qubit Armies', 'quiz', 'neutral_atom_quiz', 20, 3);

-- Section: quantum-internet-pioneers
INSERT INTO LearningUnits (section_id, title, content_type, content_url_or_text, estimated_time_minutes, unit_order) VALUES
((SELECT id FROM CourseSections WHERE external_id = 'quantum-internet-pioneers' AND course_id = 3), 'The Entanglement Telegraph: Basics of Quantum Communication', 'text', 'Send your first quantum message! Learn the principles behind secure quantum communication.', 15, 0),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-internet-pioneers' AND course_id = 3), 'Quantum Key Distribution: The Unbreakable Code Scroll', 'interactive', 'BB84Sim', 25, 1),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-internet-pioneers' AND course_id = 3), 'Repeaters of the Realm: Extending Quantum Reach', 'video', '/videos/quantum-repeaters.mp4', 20, 2),
((SELECT id FROM CourseSections WHERE external_id = 'quantum-internet-pioneers' AND course_id = 3), 'Teleportation Trails: Sending Qubits Across the Void', 'quiz', 'teleportation_quiz', 20, 3);

-- Add some sample achievements
INSERT INTO Achievements (name, description, icon_url, criteria_type, criteria_value) VALUES 
('First Steps', 'Completed your first learning unit', '/icons/first-steps.svg', 'COMPLETE_LEARNING_UNIT', '1'),
('Qubit Master', 'Completed the Qubits section', '/icons/qubit-master.svg', 'COMPLETE_SECTION_BY_EXTERNAL_ID', 'qubits-fundamentals'),
('Superposition Scholar', 'Completed the Superposition section', '/icons/superposition-scholar.svg', 'COMPLETE_SECTION_BY_EXTERNAL_ID', 'superposition-principles'),
('Circuit Architect', 'Completed the Circuits section', '/icons/circuit-architect.svg', 'COMPLETE_SECTION_BY_EXTERNAL_ID', 'quantum-circuits'),
('Entanglement Explorer', 'Completed the Entanglement section', '/icons/entanglement-explorer.svg', 'COMPLETE_SECTION_BY_EXTERNAL_ID', 'quantum-entanglement'),
('Quiz Champion', 'Scored 100% on a quiz', '/icons/quiz-champion.svg', 'SCORE_THRESHOLD_QUIZ', '100'),
('Quantum Pioneer', 'Completed all available content in a course', '/icons/quantum-pioneer.svg', 'COMPLETE_COURSE', '1');

-- Database population complete
