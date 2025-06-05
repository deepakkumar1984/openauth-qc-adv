// Test script to verify Bloch sphere coordinates
function stateToBlochCoordinates(state) {
  const { alpha, beta } = state;
  
  const x = 2 * alpha * beta;
  const y = 0; // No imaginary part in our simplified model
  const z = alpha * alpha - beta * beta;
  
  return [x, y, z];
}

// Test |0⟩ state
const state0 = { alpha: 1, beta: 0 };
console.log('|0⟩ state:', state0);
console.log('Coordinates:', stateToBlochCoordinates(state0), 'Expected: [0, 0, 1]');

// Test |1⟩ state  
const state1 = { alpha: 0, beta: 1 };
console.log('\n|1⟩ state:', state1);
console.log('Coordinates:', stateToBlochCoordinates(state1), 'Expected: [0, 0, -1]');

// Test Hadamard on |0⟩ -> |+⟩ state
const invSqrt2 = 1 / Math.sqrt(2);
const statePlus = { alpha: invSqrt2, beta: invSqrt2 };
console.log('\n|+⟩ state (H|0⟩):', statePlus);
console.log('Coordinates:', stateToBlochCoordinates(statePlus), 'Expected: [1, 0, 0]');

// Test |-⟩ state
const stateMinus = { alpha: invSqrt2, beta: -invSqrt2 };
console.log('\n|-⟩ state:', stateMinus);
console.log('Coordinates:', stateToBlochCoordinates(stateMinus), 'Expected: [-1, 0, 0]');

// Test Y gate on |0⟩
const stateY = { alpha: 0, beta: 1 }; // Y|0⟩ = i|1⟩, but simplified to |1⟩
console.log('\nY|0⟩ state (simplified):', stateY);
console.log('Coordinates:', stateToBlochCoordinates(stateY), 'Expected: [0, 0, -1]');
