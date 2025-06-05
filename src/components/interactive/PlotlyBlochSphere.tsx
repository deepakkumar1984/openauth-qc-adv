import React, { useMemo, useEffect, useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { ComplexNumber, QubitState } from '../../types';

interface PlotlyBlochSphereProps {
  qubitState: QubitState;
  width?: number;
  height?: number;
  animationDuration?: number;
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

// Helper function to interpolate between two complex numbers
function interpolateComplex(c1: ComplexNumber, c2: ComplexNumber, t: number): ComplexNumber {
  return {
    re: c1.re + (c2.re - c1.re) * t,
    im: c1.im + (c2.im - c1.im) * t
  };
}

export const PlotlyBlochSphere: React.FC<PlotlyBlochSphereProps> = ({ 
  qubitState, 
  width = 500, 
  height = 500,
  animationDuration = 500
}) => {
  const [animatedState, setAnimatedState] = useState<QubitState>(qubitState);
  const previousStateRef = useRef<QubitState>(qubitState);
  const animationFrameRef = useRef<number>();

  // Animate state transitions
  useEffect(() => {
    const startTime = Date.now();
    const startState = previousStateRef.current;
    const endState = qubitState;

    // Only animate if the state actually changed
    if (startState.alpha.re === endState.alpha.re && 
        startState.alpha.im === endState.alpha.im &&
        startState.beta.re === endState.beta.re && 
        startState.beta.im === endState.beta.im) {
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Smooth easing function (ease-in-out)
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const interpolatedAlpha = interpolateComplex(startState.alpha, endState.alpha, easedProgress);
      const interpolatedBeta = interpolateComplex(startState.beta, endState.beta, easedProgress);

      setAnimatedState({
        alpha: interpolatedAlpha,
        beta: interpolatedBeta
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        previousStateRef.current = endState;
      }
    };

    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [qubitState, animationDuration]);

  const plotData = useMemo(() => {
    const [x, y, z] = qubitToBlochCoordinates(animatedState.alpha, animatedState.beta);
    
    // Create sphere surface with higher resolution for smoother appearance
    const sphereSize = 30;
    const u = Array.from({ length: sphereSize }, (_, i) => (i / (sphereSize - 1)) * 2 * Math.PI);
    const v = Array.from({ length: sphereSize }, (_, i) => (i / (sphereSize - 1)) * Math.PI);
    
    const sphereX: number[][] = [];
    const sphereY: number[][] = [];
    const sphereZ: number[][] = [];
    
    for (let i = 0; i < sphereSize; i++) {
      sphereX[i] = [];
      sphereY[i] = [];
      sphereZ[i] = [];
      for (let j = 0; j < sphereSize; j++) {
        sphereX[i][j] = Math.sin(v[i]) * Math.cos(u[j]);
        sphereY[i][j] = Math.sin(v[i]) * Math.sin(u[j]);
        sphereZ[i][j] = Math.cos(v[i]);
      }
    }
    
    // Create great circles (longitude and latitude lines)
    const circlePoints = 100;
    const theta = Array.from({ length: circlePoints }, (_, i) => (i / (circlePoints - 1)) * 2 * Math.PI);
    
    // Equatorial circle (XY plane)
    const equatorX = theta.map(t => Math.cos(t));
    const equatorY = theta.map(t => Math.sin(t));
    const equatorZ = theta.map(() => 0);
    
    // Prime meridian (XZ plane)
    const meridianX = theta.map(t => Math.cos(t));
    const meridianY = theta.map(() => 0);
    const meridianZ = theta.map(t => Math.sin(t));
    
    // Greenwich meridian (YZ plane)
    const greenwichX = theta.map(() => 0);
    const greenwichY = theta.map(t => Math.cos(t));
    const greenwichZ = theta.map(t => Math.sin(t));
    
    return [
      // Bloch sphere surface with better styling
      {
        type: 'surface' as const,
        x: sphereX,
        y: sphereY,
        z: sphereZ,
        opacity: 0.15,
        colorscale: [[0, 'rgba(100,150,200,0.15)'], [1, 'rgba(100,150,200,0.15)']],
        showscale: false,
        hoverinfo: 'skip' as const,
        name: 'Bloch Sphere',
        lighting: {
          ambient: 0.8,
          diffuse: 0.8,
          specular: 0.2
        },
        lightposition: {
          x: 1,
          y: 1,
          z: 1
        }
      },
      // Great circles for better sphere visualization
      // Equatorial circle
      {
        type: 'scatter3d' as const,
        x: equatorX,
        y: equatorY,
        z: equatorZ,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        name: 'Equator',
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Prime meridian
      {
        type: 'scatter3d' as const,
        x: meridianX,
        y: meridianY,
        z: meridianZ,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        name: 'Prime Meridian',
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Greenwich meridian
      {
        type: 'scatter3d' as const,
        x: greenwichX,
        y: greenwichY,
        z: greenwichZ,
        mode: 'lines' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        name: 'Greenwich Meridian',
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // State vector with enhanced styling
      {
        type: 'scatter3d' as const,
        x: [0, x],
        y: [0, y],
        z: [0, z],
        mode: 'lines+markers' as const,
        line: { color: '#0ea5e9', width: 8 },
        marker: { 
          size: [0, 12], 
          color: ['rgba(0,0,0,0)', '#0ea5e9'],
          symbol: ['circle', 'circle'],
          line: { color: 'white', width: 2 }
        },
        name: 'State Vector',
        hovertemplate: `State Vector<br>x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}<extra></extra>`
      },
      // Reference states markers
      // |0⟩ state (North pole)
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [0],
        z: [1],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#ff6b6b' },
        text: ['|0⟩'],
        textposition: 'top center' as const,
        name: '|0⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|0⟩ state (North pole)'
      },
      // |1⟩ state (South pole)
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [0],
        z: [-1],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#ff6b6b' },
        text: ['|1⟩'],
        textposition: 'bottom center' as const,
        name: '|1⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|1⟩ state (South pole)'
      },
      // |+⟩ state (positive X)
      {
        type: 'scatter3d' as const,
        x: [1],
        y: [0],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#4ecdc4' },
        text: ['|+⟩'],
        textposition: 'middle right' as const,
        name: '|+⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|+⟩ state (Hadamard of |0⟩)'
      },
      // |-⟩ state (negative X)
      {
        type: 'scatter3d' as const,
        x: [-1],
        y: [0],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#4ecdc4' },
        text: ['|-⟩'],
        textposition: 'middle left' as const,
        name: '|-⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|-⟩ state (Hadamard of |1⟩)'
      },
      // |+i⟩ state (positive Y)
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [1],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#45b7d1' },
        text: ['|+i⟩'],
        textposition: 'middle center' as const,
        name: '|+i⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|+i⟩ state (positive Y axis)'
      },
      // |-i⟩ state (negative Y)
      {
        type: 'scatter3d' as const,
        x: [0],
        y: [-1],
        z: [0],
        mode: 'markers+text' as const,
        marker: { size: 6, color: '#45b7d1' },
        text: ['|-i⟩'],
        textposition: 'middle center' as const,
        name: '|-i⟩ state',
        hoverinfo: 'text' as const,
        hovertext: '|-i⟩ state (negative Y axis)'
      },
      // Coordinate axes
      // X axis
      {
        type: 'scatter3d' as const,
        x: [-1.2, 1.2],
        y: [0, 0],
        z: [0, 0],
        mode: 'lines+text' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        text: ['', 'X'],
        textposition: 'middle right' as const,
        name: 'X axis',
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Y axis
      {
        type: 'scatter3d' as const,
        x: [0, 0],
        y: [-1.2, 1.2],
        z: [0, 0],
        mode: 'lines+text' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        text: ['', 'Y'],
        textposition: 'middle center' as const,
        name: 'Y axis',
        hoverinfo: 'skip' as const,
        showlegend: false
      },
      // Z axis
      {
        type: 'scatter3d' as const,
        x: [0, 0],
        y: [0, 0],
        z: [-1.2, 1.2],
        mode: 'lines+text' as const,
        line: { color: 'rgba(255,255,255,0.3)', width: 2 },
        text: ['', 'Z'],
        textposition: 'top center' as const,
        name: 'Z axis',
        hoverinfo: 'skip' as const,
        showlegend: false
      }
    ];
  }, [animatedState]);

  const layout = {
    title: {
      text: 'Bloch Sphere',
      font: { color: '#e0f2fe', size: 18 }
    },
    scene: {
      xaxis: { 
        title: 'X', 
        range: [-1.5, 1.5],
        showgrid: true,
        gridcolor: 'rgba(255,255,255,0.1)',
        color: 'white',
        showspikes: false
      },
      yaxis: { 
        title: 'Y', 
        range: [-1.5, 1.5],
        showgrid: true,
        gridcolor: 'rgba(255,255,255,0.1)',
        color: 'white',
        showspikes: false
      },
      zaxis: { 
        title: 'Z', 
        range: [-1.5, 1.5],
        showgrid: true,
        gridcolor: 'rgba(255,255,255,0.1)',
        color: 'white',
        showspikes: false
      },
      bgcolor: 'rgba(0,0,0,0)',
      camera: {
        eye: { x: 1.8, y: 1.8, z: 1.8 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
      },
      aspectmode: 'cube' as const,
      aspectratio: { x: 1, y: 1, z: 1 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'white' },
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'rgba(0,0,0,0.7)',
      font: { color: 'white', size: 10 },
      bordercolor: 'rgba(255,255,255,0.2)',
      borderwidth: 1
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'],
    responsive: true,
    scrollZoom: true,
    toImageButtonOptions: {
      format: 'png',
      filename: 'bloch_sphere',
      height: 500,
      width: 700,
      scale: 1
    }
  };

  // Console log for debugging
  const [x, y, z] = qubitToBlochCoordinates(animatedState.alpha, animatedState.beta);
  console.log('Plotly Bloch coordinates:', { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) });
  console.log('Animated Alpha:', animatedState.alpha, 'Beta:', animatedState.beta);

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="mt-2 text-sm text-slate-400">
        <p>Coordinates: x={x.toFixed(3)}, y={y.toFixed(3)}, z={z.toFixed(3)}</p>
        <p>Target: α=({qubitState.alpha.re.toFixed(3)}, {qubitState.alpha.im.toFixed(3)}i), β=({qubitState.beta.re.toFixed(3)}, {qubitState.beta.im.toFixed(3)}i)</p>
        <p>Use mouse to rotate, zoom, and pan • Smooth transitions enabled</p>
      </div>
    </div>
  );
};
