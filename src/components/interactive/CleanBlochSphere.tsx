import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { ComplexNumber, QubitState } from '../../types';

interface CleanBlochSphereProps {
  qubitState: QubitState;
  width?: number;
  height?: number;
}

// Helper function to calculate Bloch sphere coordinates from qubit state
function qubitToBlochCoordinates(alpha: ComplexNumber, beta: ComplexNumber): [number, number, number] {
  // Bloch sphere coordinates: x = 2*Re(α*β̄), y = 2*Im(α*β̄), z = |α|² - |β|²
  const betaConj = { re: beta.re, im: -beta.im };
  
  // Calculate α*β̄ (alpha times beta conjugate)
  const alphaBetaConj = {
    re: alpha.re * betaConj.re - alpha.im * betaConj.im,
    im: alpha.re * betaConj.im + alpha.im * betaConj.re
  };
  
  const x = 2 * alphaBetaConj.re;
  const y = 2 * alphaBetaConj.im;
  const z = (alpha.re * alpha.re + alpha.im * alpha.im) - (beta.re * beta.re + beta.im * beta.im);
  
  return [x, y, z];
}

export const CleanBlochSphere: React.FC<CleanBlochSphereProps> = ({ 
  qubitState, 
  width = 500, 
  height = 500
}) => {
  const plotData = useMemo(() => {
    const [x, y, z] = qubitToBlochCoordinates(qubitState.alpha, qubitState.beta);
    
    // Create simple wireframe sphere
    const circlePoints = 50;
    const theta = Array.from({ length: circlePoints }, (_, i) => (i / (circlePoints - 1)) * 2 * Math.PI);
    
    // Three main circles to show sphere shape
    const equatorX = theta.map(t => Math.cos(t));
    const equatorY = theta.map(t => Math.sin(t));
    const equatorZ = theta.map(() => 0);
    
    const meridian1X = theta.map(t => Math.cos(t));
    const meridian1Y = theta.map(() => 0);
    const meridian1Z = theta.map(t => Math.sin(t));
    
    const meridian2X = theta.map(() => 0);
    const meridian2Y = theta.map(t => Math.cos(t));
    const meridian2Z = theta.map(t => Math.sin(t));
    
    return [
      // Three circles to show sphere shape - more visible for education
      {
        type: 'scatter3d' as const,
        x: equatorX,
        y: equatorY,
        z: equatorZ,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.25)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      {
        type: 'scatter3d' as const,
        x: meridian1X,
        y: meridian1Y,
        z: meridian1Z,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.25)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      {
        type: 'scatter3d' as const,
        x: meridian2X,
        y: meridian2Y,
        z: meridian2Z,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.25)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      
      // State vector - the main focus with arrow-like appearance
      {
        type: 'scatter3d' as const,
        x: [0, x],
        y: [0, y],
        z: [0, z],
        mode: 'lines+markers' as const,
        line: { color: '#ff6b6b', width: 6 },
        marker: { 
          size: [0, 12], 
          color: ['rgba(0,0,0,0)', '#ff6b6b'],
          symbol: ['circle', 'circle']
        },
        name: 'Quantum State',
        hovertemplate: `<b>State Vector</b><br>x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}<extra></extra>`,
        showlegend: false
      },
      
      // Educational reference states with clear labels
      // |0⟩ state (North pole) - Z+ axis
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [0],
        z: [1],
        mode: 'markers+text' as const,
        marker: { size: 10, color: '#3b82f6' },
        text: ['|0⟩'],
        textposition: 'top center' as const,
        textfont: { size: 14, color: '#3b82f6', family: 'Arial Black' },
        hovertemplate: '<b>|0⟩ Ground State</b><br>Classical bit: 0<br>Probability: |α|²<extra></extra>',
        showlegend: false
      },
      
      // |1⟩ state (South pole) - Z- axis
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [0],
        z: [-1],
        mode: 'markers+text' as const,
        marker: { size: 10, color: '#ef4444' },
        text: ['|1⟩'],
        textposition: 'bottom center' as const,
        textfont: { size: 14, color: '#ef4444', family: 'Arial Black' },
        hovertemplate: '<b>|1⟩ Excited State</b><br>Classical bit: 1<br>Probability: |β|²<extra></extra>',
        showlegend: false
      },
      
      // |+⟩ state (X+ axis) - Superposition
      {
        type: 'scatter3d' as const,
        x: [1],
        y: [0],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 8, color: '#10b981' },
        text: ['|+⟩'],
        textposition: 'middle right' as const,
        textfont: { size: 12, color: '#10b981', family: 'Arial' },
        hovertemplate: '<b>|+⟩ Plus State</b><br>(|0⟩ + |1⟩)/√2<br>Equal superposition<extra></extra>',
        showlegend: false
      },
      
      // |-⟩ state (X- axis) - Superposition
      {
        type: 'scatter3d' as const,
        x: [-1],
        y: [0],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 8, color: '#f59e0b' },
        text: ['|-⟩'],
        textposition: 'middle left' as const,
        textfont: { size: 12, color: '#f59e0b', family: 'Arial' },
        hovertemplate: '<b>|-⟩ Minus State</b><br>(|0⟩ - |1⟩)/√2<br>Opposite phase<extra></extra>',
        showlegend: false
      },
      
      // |i⟩ state (Y+ axis) - Imaginary superposition
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [1],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 8, color: '#8b5cf6' },
        text: ['|i⟩'],
        textposition: 'middle center' as const,
        textfont: { size: 12, color: '#8b5cf6', family: 'Arial' },
        hovertemplate: '<b>|i⟩ State</b><br>(|0⟩ + i|1⟩)/√2<br>Imaginary phase<extra></extra>',
        showlegend: false
      },
      
      // |-i⟩ state (Y- axis) - Negative imaginary superposition
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [-1],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 8, color: '#ec4899' },
        text: ['|-i⟩'],
        textposition: 'middle center' as const,
        textfont: { size: 12, color: '#ec4899', family: 'Arial' },
        hovertemplate: '<b>|-i⟩ State</b><br>(|0⟩ - i|1⟩)/√2<br>Negative imaginary phase<extra></extra>',
        showlegend: false
      },
      
      // Coordinate axes for educational purposes
      // X-axis
      {
        type: 'scatter3d' as const,
        x: [-1.2, 1.2],
        y: [0, 0],
        z: [0, 0],
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Y-axis
      {
        type: 'scatter3d' as const,
        x: [0, 0],
        y: [-1.2, 1.2],
        z: [0, 0],
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Z-axis
      {
        type: 'scatter3d' as const,
        x: [0, 0],
        y: [0, 0],
        z: [-1.2, 1.2],
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      
      // Axis labels positioned at the ends
      {
        type: 'scatter3d' as const,
        x: [1.3, -1.3, 0, 0, 0, 0],
        y: [0, 0, 1.3, -1.3, 0, 0],
        z: [0, 0, 0, 0, 1.3, -1.3],
        mode: 'text' as const,
        text: ['X+', 'X-', 'Y+', 'Y-', 'Z+', 'Z-'],
        textfont: { size: 12, color: 'rgba(255,255,255,0.6)' },
        hoverinfo: 'skip' as const,
        showlegend: false
      }
    ];
  }, [qubitState]);

  const layout = {
    title: {
      text: 'Bloch Sphere',
      font: { color: '#e0f2fe', size: 18 }
    },
    scene: {
      xaxis: { 
        title: '', 
        range: [-1.4, 1.4],
        showgrid: false,
        showline: false,
        zeroline: false,
        showticklabels: false,
        visible: false
      },
      yaxis: { 
        title: '', 
        range: [-1.4, 1.4],
        showgrid: false,
        showline: false,
        zeroline: false,
        showticklabels: false,
        visible: false
      },
      zaxis: { 
        title: '', 
        range: [-1.4, 1.4],
        showgrid: false,
        showline: false,
        zeroline: false,
        showticklabels: false,
        visible: false
      },
      bgcolor: 'rgba(0,0,0,0)',
      camera: {
        eye: { x: 2, y: 2, z: 2 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
      },
      aspectmode: 'cube' as const,
      aspectratio: { x: 1, y: 1, z: 1 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'white' },
    showlegend: false,
    margin: { l: 0, r: 0, b: 0, t: 40 },
    // Remove transition to prevent camera resets
    transition: {
      duration: 0
    }
  };

  const config = {
    displayModeBar: false, // Hide toolbar to prevent camera resets
    responsive: true,
    staticPlot: false // Keep interactivity but no mode bar
  };

  // Console log for debugging
  const [x, y, z] = qubitToBlochCoordinates(qubitState.alpha, qubitState.beta);
  console.log('Clean Bloch coordinates:', { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: `${width}px`, height: `${height}px` }}
        revision={Date.now()} // Force update but preserve camera
      />
      <div className="mt-2 text-sm text-slate-400">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-300 font-medium">State Vector:</p>
            <p>x={x.toFixed(3)}, y={y.toFixed(3)}, z={z.toFixed(3)}</p>
            <p>|ψ⟩ = ({qubitState.alpha.re.toFixed(3)}{qubitState.alpha.im >= 0 ? '+' : ''}{qubitState.alpha.im.toFixed(3)}i)|0⟩ + ({qubitState.beta.re.toFixed(3)}{qubitState.beta.im >= 0 ? '+' : ''}{qubitState.beta.im.toFixed(3)}i)|1⟩</p>
          </div>
          <div>
            <p className="text-slate-300 font-medium">Probabilities:</p>
            <p>P(|0⟩) = {(qubitState.alpha.re * qubitState.alpha.re + qubitState.alpha.im * qubitState.alpha.im).toFixed(3)}</p>
            <p>P(|1⟩) = {(qubitState.beta.re * qubitState.beta.re + qubitState.beta.im * qubitState.beta.im).toFixed(3)}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <p>• <span className="text-blue-400">|0⟩,|1⟩</span>: Computational basis • <span className="text-green-400">|+⟩,|-⟩</span>: X-basis superposition • <span className="text-purple-400">|i⟩,|-i⟩</span>: Y-basis</p>
          <p>• Drag to rotate • Scroll to zoom • Hover states for details</p>
        </div>
      </div>
    </div>
  );
};
