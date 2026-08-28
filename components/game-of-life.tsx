'use client';

import {
  Activity,
  Dices,
  Eraser,
  Grid3X3,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

type Grid = Uint8Array;

type SimulationSettings = {
  speed: number;
  cellSize: number;
  density: number;
  opacity: number;
  wrapEdges: boolean;
  showGrid: boolean;
};

const INITIAL_SETTINGS: SimulationSettings = {
  speed: 10,
  cellSize: 9,
  density: 24,
  opacity: 88,
  wrapEdges: true,
  showGrid: false,
};

function randomGrid(size: number, density: number) {
  const grid = new Uint8Array(size);
  for (let index = 0; index < size; index += 1) {
    grid[index] = Math.random() * 100 < density ? 1 : 0;
  }
  return grid;
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="control-row">
      <span className="control-label">
        <span>{label}</span>
        <output>{value}{suffix}</output>
      </span>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(next[0])}
      />
    </label>
  );
}

export function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const gridRef = useRef<Grid>(new Uint8Array());
  const dimensionsRef = useRef({ columns: 0, rows: 0, cellSize: 0 });
  const lastTickRef = useRef(0);
  const drawingRef = useRef(false);
  const paintValueRef = useRef<0 | 1>(1);
  const settingsRef = useRef(INITIAL_SETTINGS);

  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [running, setRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const { columns, rows, cellSize } = dimensionsRef.current;
    const currentSettings = settingsRef.current;
    const dpr = window.devicePixelRatio || 1;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    context.fillStyle = `rgba(255, 255, 255, ${currentSettings.opacity / 100})`;

    const inset = currentSettings.showGrid ? 1 : 0;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (gridRef.current[row * columns + column]) {
          context.fillRect(
            column * cellSize + inset,
            row * cellSize + inset,
            Math.max(1, cellSize - inset),
            Math.max(1, cellSize - inset),
          );
        }
      }
    }
  }, []);

  const resizeGrid = useCallback((density = settingsRef.current.density) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cellSize = settingsRef.current.cellSize;
    const columns = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    dimensionsRef.current = { columns, rows, cellSize };
    gridRef.current = randomGrid(columns * rows, density);
    setPopulation(gridRef.current.reduce((sum, cell) => sum + cell, 0));
    setGeneration(0);
    draw();
  }, [draw]);

  const step = useCallback(() => {
    const { columns, rows } = dimensionsRef.current;
    const current = gridRef.current;
    if (!columns || !rows || !current.length) return;

    const next = new Uint8Array(current.length);
    const shouldWrap = settingsRef.current.wrapEdges;
    let nextPopulation = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        let neighbors = 0;

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (offsetX === 0 && offsetY === 0) continue;

            let neighborColumn = column + offsetX;
            let neighborRow = row + offsetY;

            if (shouldWrap) {
              neighborColumn = (neighborColumn + columns) % columns;
              neighborRow = (neighborRow + rows) % rows;
            } else if (
              neighborColumn < 0 ||
              neighborColumn >= columns ||
              neighborRow < 0 ||
              neighborRow >= rows
            ) {
              continue;
            }

            neighbors += current[neighborRow * columns + neighborColumn];
          }
        }

        const index = row * columns + column;
        const alive = current[index] === 1;
        if (neighbors === 3 || (alive && neighbors === 2)) {
          next[index] = 1;
          nextPopulation += 1;
        }
      }
    }

    gridRef.current = next;
    setPopulation(nextPopulation);
    setGeneration((currentGeneration) => currentGeneration + 1);
    draw();
  }, [draw]);

  const reseed = useCallback(() => {
    const { columns, rows } = dimensionsRef.current;
    gridRef.current = randomGrid(columns * rows, settingsRef.current.density);
    setPopulation(gridRef.current.reduce((sum, cell) => sum + cell, 0));
    setGeneration(0);
    draw();
  }, [draw]);

  const clear = useCallback(() => {
    gridRef.current = new Uint8Array(gridRef.current.length);
    setPopulation(0);
    setGeneration(0);
    setRunning(false);
    draw();
  }, [draw]);

  const paintCell = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const { columns, rows, cellSize } = dimensionsRef.current;
    const column = Math.floor((event.clientX - bounds.left) / cellSize);
    const row = Math.floor((event.clientY - bounds.top) / cellSize);
    if (column < 0 || column >= columns || row < 0 || row >= rows) return;

    const index = row * columns + column;
    if (gridRef.current[index] !== paintValueRef.current) {
      gridRef.current[index] = paintValueRef.current;
      setPopulation((current) => Math.max(0, current + (paintValueRef.current ? 1 : -1)));
      draw();
    }
  }, [draw]);

  useEffect(() => {
    resizeGrid();
    const handleResize = () => resizeGrid();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeGrid]);

  useEffect(() => {
    if (!running) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      return;
    }

    const animate = (time: number) => {
      const interval = 1000 / settingsRef.current.speed;
      if (time - lastTickRef.current >= interval) {
        step();
        lastTickRef.current = time;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, step]);

  useEffect(() => {
    draw();
  }, [settings.opacity, settings.showGrid, draw]);

  const updateSetting = <Key extends keyof SimulationSettings>(
    key: Key,
    value: SimulationSettings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    settingsRef.current = { ...settingsRef.current, [key]: value };
  };

  const changeCellSize = (cellSize: number) => {
    updateSetting('cellSize', cellSize);
    window.requestAnimationFrame(() => resizeGrid());
  };

  return (
    <main className="life-shell">
      <canvas
        ref={canvasRef}
        className="life-canvas"
        aria-label="Live Conway's Game of Life simulation. Drag across the background to draw or erase cells."
        onPointerDown={(event) => {
          drawingRef.current = true;
          const { columns, cellSize } = dimensionsRef.current;
          const bounds = event.currentTarget.getBoundingClientRect();
          const column = Math.floor((event.clientX - bounds.left) / cellSize);
          const row = Math.floor((event.clientY - bounds.top) / cellSize);
          paintValueRef.current = gridRef.current[row * columns + column] ? 0 : 1;
          event.currentTarget.setPointerCapture(event.pointerId);
          paintCell(event);
        }}
        onPointerMove={(event) => {
          if (drawingRef.current) paintCell(event);
        }}
        onPointerUp={(event) => {
          drawingRef.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drawingRef.current = false; }}
      />

      <aside className="control-panel" aria-label="Simulation controls">
        <header className="panel-header">
          <div className="eyebrow"><Sparkles aria-hidden="true" /> Background lab</div>
          <h1>Game of Life</h1>
          <p>Shape the motion behind your future homepage.</p>
        </header>

        <div className="stat-strip" aria-live="polite">
          <div><span>Generation</span><strong>{generation.toLocaleString()}</strong></div>
          <div><span>Population</span><strong>{population.toLocaleString()}</strong></div>
        </div>

        <div className="button-grid">
          <Button
            className="primary-action"
            onClick={() => setRunning((current) => !current)}
          >
            {running ? <Pause /> : <Play />}
            {running ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" onClick={step} disabled={running} title="Advance one generation">
            <SkipForward /> Step
          </Button>
          <Button variant="outline" onClick={reseed}>
            <Dices /> Randomize
          </Button>
          <Button variant="outline" onClick={clear}>
            <Eraser /> Clear
          </Button>
        </div>

        <section className="controls-section">
          <h2><Activity aria-hidden="true" /> Simulation</h2>
          <ControlSlider
            label="Speed"
            value={settings.speed}
            min={1}
            max={30}
            suffix=" fps"
            onChange={(speed) => updateSetting('speed', speed)}
          />
          <ControlSlider
            label="Cell size"
            value={settings.cellSize}
            min={4}
            max={18}
            suffix=" px"
            onChange={changeCellSize}
          />
          <ControlSlider
            label="Seed density"
            value={settings.density}
            min={5}
            max={55}
            suffix="%"
            onChange={(density) => updateSetting('density', density)}
          />
          <ControlSlider
            label="Pixel opacity"
            value={settings.opacity}
            min={15}
            max={100}
            suffix="%"
            onChange={(opacity) => updateSetting('opacity', opacity)}
          />
        </section>

        <section className="controls-section compact">
          <h2><Grid3X3 aria-hidden="true" /> Field</h2>
          <label className="switch-row">
            <span><strong>Wrap edges</strong><small>Cells cross screen boundaries</small></span>
            <Switch
              aria-label="Wrap screen edges"
              checked={settings.wrapEdges}
              onCheckedChange={(wrapEdges) => updateSetting('wrapEdges', wrapEdges)}
            />
          </label>
          <label className="switch-row">
            <span><strong>Pixel gaps</strong><small>Reveal the underlying grid</small></span>
            <Switch
              aria-label="Show pixel gaps"
              checked={settings.showGrid}
              onCheckedChange={(showGrid) => updateSetting('showGrid', showGrid)}
            />
          </label>
        </section>

        <button
          className="reset-link"
          onClick={() => {
            setSettings(INITIAL_SETTINGS);
            settingsRef.current = INITIAL_SETTINGS;
            setRunning(true);
            window.requestAnimationFrame(() => resizeGrid(INITIAL_SETTINGS.density));
          }}
        >
          <RotateCcw aria-hidden="true" /> Reset all settings
        </button>

        <p className="draw-hint">Tip: drag anywhere outside this panel to draw or erase cells.</p>
      </aside>
    </main>
  );
}
