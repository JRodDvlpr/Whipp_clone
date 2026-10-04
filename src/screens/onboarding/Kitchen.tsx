import type { KeyboardEvent } from 'react';
import { APPLIANCES } from '../../data/taxonomy';
import type { Appliance, Country } from '../../types';

// Isometric kitchen drawn from simple 3D boxes, so every appliance is a real tap target.
const S = 20;
const OX = 222;
const OY = 196;
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C30 * S, OY + (x + y) * 0.5 * S - z * S];
const pts = (...p: [number, number, number][]) => p.map((q) => iso(...q).join(',')).join(' ');

interface BoxProps {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  top: string;
  right: string;
  left: string;
  stroke?: string;
}
function Box({ x, y, z, w, d, h, top, right, left, stroke = 'rgba(0,0,0,0.06)' }: BoxProps) {
  const X = x + w,
    Y = y + d,
    Z = z + h;
  return (
    <g stroke={stroke} strokeWidth={0.8} strokeLinejoin="round">
      <polygon points={pts([x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z])} fill={top} />
      <polygon points={pts([X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z])} fill={right} />
      <polygon points={pts([x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z])} fill={left} />
    </g>
  );
}

/** Ellipse approximating a circle lying on a horizontal plane. */
const Disc = ({ x, y, z, r, fill }: { x: number; y: number; z: number; r: number; fill: string }) => {
  const [cx, cy] = iso(x, y, z);
  return <ellipse cx={cx} cy={cy} rx={r * S * 1.22} ry={r * S * 0.7} fill={fill} />;
};

const Glow = ({ x, y, z, rx, ry }: { x: number; y: number; z: number; rx: number; ry: number }) => {
  const [cx, cy] = iso(x, y, z);
  return <ellipse className="halo" cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#lime-glow)" />;
};

const WHITE = { top: '#ffffff', right: '#ececea', left: '#dcdcd8' };
const CAB = { top: '#f7f7f5', right: '#e6e6e3', left: '#d6d6d2' };

/** Where each appliance's label sits (3D anchor). */
/** Visible part of the scene (x, y, w, h) — trims empty wall space. */
const VB = [36, 40, 380, 340] as const;

const ANCHORS: Record<Appliance, [number, number, number]> = {
  stove: [0.6, 7.3, 5.6],
  oven: [3.6, 8.9, 2.6],
  air_fryer: [1.4, 4.4, 7.6],
  microwave: [6.8, 1.2, 7.1],
  rice_cooker: [10.2, 1.6, 6.9],
};

export function KitchenPicker({ value, onToggle, country }: { value: Appliance[]; onToggle: (a: Appliance) => void; country: Country }) {
  const on = (a: Appliance) => value.includes(a);
  const props = (a: Appliance, label: string) => ({
    className: `appl ${on(a) ? 'on' : ''}`,
    role: 'button',
    tabIndex: 0,
    'aria-pressed': on(a),
    'aria-label': label,
    onClick: () => onToggle(a),
    onKeyDown: (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle(a)),
  });
  const label = (a: Appliance) => {
    const def = APPLIANCES.find((x) => x.id === a)!;
    return country === 'UK' && def.labelUK ? def.labelUK : def.label;
  };

  return (
    <div className="kitchen">
      <svg viewBox={VB.join(' ')} aria-label="Your kitchen">
        <defs>
          <radialGradient id="lime-glow">
            <stop offset="0%" stopColor="#ddfc5c" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ddfc5c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ddfc5c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Walls */}
        <polygon points={pts([0, 0, 0], [13, 0, 0], [13, 0, 9], [0, 0, 9])} fill="#f1f1ee" />
        <polygon points={pts([0, 0, 0], [0, 11, 0], [0, 11, 9], [0, 0, 9])} fill="#e7e7e3" />
        {/* Floor shadow */}
        <polygon points={pts([0, 0, 0], [13, 0, 0], [13, 11, 0], [0, 11, 0])} fill="#ebebe7" />

        {/* Back counter run */}
        <Box x={3.2} y={0} z={0} w={9.6} d={3} h={4} {...CAB} />
        <Box x={3.2} y={0} z={4} w={9.6} d={3} h={0.3} top="#fbfbfa" right="#e0e0dc" left="#d0d0cb" />
        {[4.6, 7.8, 11].map((x) => (
          <polyline key={x} points={pts([x, 3.01, 0.4], [x, 3.01, 3.6])} stroke="#c9c9c4" strokeWidth={1} />
        ))}
        {/* Left counter run (behind the stove) */}
        <Box x={0} y={0} z={0} w={3.2} d={6.4} h={4} {...CAB} />
        <Box x={0} y={0} z={4} w={3.2} d={6.4} h={0.3} top="#fbfbfa" right="#e0e0dc" left="#d0d0cb" />

        {/* Stove + oven */}
        <g {...props('oven', label('oven'))}>
          <Glow x={3.2} y={8.3} z={1.6} rx={70} ry={86} />
          <Box x={0} y={6.4} z={0} w={3.2} d={3.6} h={4} top="#2a2d30" right="#9ea3a7" left="#7d8287" />
          <polygon points={pts([3.21, 6.8, 0.6], [3.21, 9.6, 0.6], [3.21, 9.6, 3.0], [3.21, 6.8, 3.0])} fill="#24272a" />
          <polygon points={pts([3.22, 7.2, 1.0], [3.22, 9.2, 1.0], [3.22, 9.2, 2.6], [3.22, 7.2, 2.6])} fill="#3b4045" />
          <polyline points={pts([3.25, 7.0, 3.35], [3.25, 9.4, 3.35])} stroke="#e9ecef" strokeWidth={3} strokeLinecap="round" />
          <polygon points={pts([3.21, 6.6, 3.55], [3.21, 9.8, 3.55], [3.21, 9.8, 3.95], [3.21, 6.6, 3.95])} fill="#1d2023" />
        </g>
        <g {...props('stove', label('stove'))}>
          <Glow x={1.6} y={8.2} z={4.3} rx={64} ry={40} />
          <polygon points={pts([0, 6.4, 4.01], [3.2, 6.4, 4.01], [3.2, 10, 4.01], [0, 10, 4.01])} fill="#1f2225" />
          <Disc x={0.85} y={7.3} z={4.02} r={0.62} fill="#f2f2f0" />
          <Disc x={2.3} y={7.4} z={4.02} r={0.5} fill="#f2f2f0" />
          <Disc x={0.9} y={9.1} z={4.02} r={0.5} fill="#f2f2f0" />
          <Disc x={2.3} y={9.0} z={4.02} r={0.62} fill="#f2f2f0" />
        </g>

        {/* Microwave */}
        <g {...props('microwave', label('microwave'))}>
          <Glow x={6.8} y={1.6} z={5.1} rx={70} ry={46} />
          <Box x={5.2} y={0.3} z={4.3} w={3.6} d={2.3} h={2.2} {...WHITE} />
          <polygon points={pts([5.5, 2.61, 4.6], [7.7, 2.61, 4.6], [7.7, 2.61, 6.2], [5.5, 2.61, 6.2])} fill="#3a3f44" />
          <polygon points={pts([7.95, 2.61, 4.7], [8.6, 2.61, 4.7], [8.6, 2.61, 6.1], [7.95, 2.61, 6.1])} fill="#e3e3e0" />
        </g>

        {/* Rice cooker */}
        <g {...props('rice_cooker', label('rice_cooker'))}>
          <Glow x={10.3} y={1.6} z={5} rx={52} ry={40} />
          <Box x={9.4} y={0.6} z={4.3} w={1.9} d={1.9} h={1.5} {...WHITE} />
          <Disc x={10.35} y={1.55} z={5.8} r={0.82} fill="#f3f3f1" />
          <Disc x={10.35} y={1.55} z={5.95} r={0.2} fill="#9aa0a6" />
          <polygon points={pts([9.8, 2.51, 4.6], [10.9, 2.51, 4.6], [10.9, 2.51, 5.3], [9.8, 2.51, 5.3])} fill="#5b6268" />
        </g>

        {/* Air fryer */}
        <g {...props('air_fryer', label('air_fryer'))}>
          <Glow x={1.5} y={4.4} z={5.4} rx={50} ry={56} />
          <Box x={0.6} y={3.4} z={4.3} w={1.9} d={2} h={2.4} {...WHITE} />
          <polygon points={pts([2.51, 3.7, 5.1], [2.51, 5.1, 5.1], [2.51, 5.1, 6.4], [2.51, 3.7, 6.4])} fill="#33383d" />
          <polyline
            points={pts([2.7, 4.2, 4.9], [3.1, 4.4, 4.6], [3.1, 4.6, 4.6])}
            stroke="#3b4045"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {APPLIANCES.filter((a) => on(a.id)).map((a) => {
        const [x, y] = iso(...ANCHORS[a.id]);
        return (
          <span key={a.id} className="label" style={{ left: `${((x - VB[0]) / VB[2]) * 100}%`, top: `${((y - VB[1]) / VB[3]) * 100}%` }}>
            {label(a.id)}
          </span>
        );
      })}
    </div>
  );
}
