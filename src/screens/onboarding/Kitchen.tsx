import { APPLIANCES } from '../../data/taxonomy';
import type { Appliance, Country } from '../../types';

// Isometric L-shaped kitchen (like Whipp's): stove + oven at the front of the left run,
// air fryer behind it, microwave and rice cooker on the back run. Every appliance and its
// label is a tap target; what you have glows lime.
const S = 20;
const OX = 222;
const OY = 196;
const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C30 * S, OY + (x + y) * 0.5 * S - z * S];
const pts = (...p: [number, number, number][]) => p.map((q) => iso(...q).join(',')).join(' ');
/** Radii of a horizontal circle of radius r once projected. */
const ell = (r: number) => [r * S * Math.SQRT2 * C30, r * S * Math.SQRT2 * 0.5] as const;

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
}
/** A box: top, the +x face (facing right) and the +y face (facing left). */
function Box({ x, y, z, w, d, h, top, right, left }: BoxProps) {
  const X = x + w,
    Y = y + d,
    Z = z + h;
  return (
    <g stroke="rgba(0,0,0,0.05)" strokeWidth={0.8} strokeLinejoin="round">
      <polygon points={pts([x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z])} fill={top} />
      <polygon points={pts([X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z])} fill={right} />
      <polygon points={pts([x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z])} fill={left} />
    </g>
  );
}

/** Flat quad on the +x face (x fixed) or the +y face (y fixed). */
const FaceX = ({ x, y0, y1, z0, z1, fill }: { x: number; y0: number; y1: number; z0: number; z1: number; fill: string }) => (
  <polygon points={pts([x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1])} fill={fill} />
);
const FaceY = ({ y, x0, x1, z0, z1, fill }: { y: number; x0: number; x1: number; z0: number; z1: number; fill: string }) => (
  <polygon points={pts([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1])} fill={fill} />
);

const Disc = ({ x, y, z, r, fill, stroke }: { x: number; y: number; z: number; r: number; fill: string; stroke?: string }) => {
  const [cx, cy] = iso(x, y, z);
  const [rx, ry] = ell(r);
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.2 : 0} />;
};

/** Upright cylinder with a shaded body and a flat top. */
function Cylinder({ x, y, z, r, h, top = '#fdfdfc' }: { x: number; y: number; z: number; r: number; h: number; top?: string }) {
  const [bx, by] = iso(x, y, z);
  const [tx, ty] = iso(x, y, z + h);
  const [rx, ry] = ell(r);
  return (
    <g>
      <path d={`M${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${tx + rx},${ty} L${tx - rx},${ty} Z`} fill="url(#k-body)" />
      <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={top} stroke="rgba(0,0,0,0.06)" strokeWidth={0.8} />
    </g>
  );
}

const Glow = ({ x, y, z, rx, ry }: { x: number; y: number; z: number; rx: number; ry: number }) => {
  const [cx, cy] = iso(x, y, z);
  return <ellipse className="halo" cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#k-glow)" />;
};

const CAB = { top: '#f6f6f4', right: '#e4e4e1', left: '#d9d9d5' };
const SLAB = { top: '#fbfbfa', right: '#e9e9e6', left: '#dededa' };
const WHITE = { top: '#ffffff', right: '#ececea', left: '#e0e0dd' };
const SEAM = '#cdcdc8';

/** Visible part of the scene (x, y, w, h), square like Whipp's card. */
const VB = [40, 22, 420, 420] as const;

/** Where each appliance's label sits (3D anchor). */
const ANCHORS: Record<Appliance, [number, number, number]> = {
  stove: [0.2, 7.4, 5.4],
  oven: [3.2, 8.6, 3.5],
  air_fryer: [1.5, 4.4, 7.6],
  microwave: [6.6, 1.2, 7.4],
  rice_cooker: [10.9, 1.7, 7.0],
};

export function KitchenPicker({ value, onToggle, country }: { value: Appliance[]; onToggle: (a: Appliance) => void; country: Country }) {
  const on = (a: Appliance) => value.includes(a);
  // The SVG shapes are extra tap targets for touch; the labels are the accessible buttons.
  const g = (a: Appliance) => ({ className: `appl ${on(a) ? 'on' : ''}`, onClick: () => onToggle(a) });
  const label = (a: Appliance) => {
    const def = APPLIANCES.find((x) => x.id === a)!;
    return country === 'UK' && def.labelUK ? def.labelUK : def.label;
  };

  return (
    <div className="kitchen">
      <svg viewBox={VB.join(' ')} aria-hidden="true">
        <defs>
          <radialGradient id="k-glow">
            <stop offset="0%" stopColor="#ddfc5c" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ddfc5c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ddfc5c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="k-body" x1="0" x2="1">
            <stop offset="0%" stopColor="#d9d9d6" />
            <stop offset="45%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e6e6e3" />
          </linearGradient>
          <linearGradient id="k-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9ccce" />
            <stop offset="100%" stopColor="#a9adb0" />
          </linearGradient>
          <filter id="k-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* Soft floor shadow under the L */}
        <polygon
          points={pts([-0.4, -0.4, 0], [13.6, -0.4, 0], [13.6, 3.8, 0], [4, 3.8, 0], [4, 10.8, 0], [-0.4, 10.8, 0])}
          fill="rgba(60,64,60,0.16)"
          filter="url(#k-soft)"
        />

        {/* Back run: cabinets, three doors, counter slab */}
        <Box x={3.2} y={0} z={0} w={9.8} d={3} h={4} {...CAB} />
        {[6.4, 9.7].map((x) => (
          <polyline key={x} points={pts([x, 3.01, 0.25], [x, 3.01, 3.75])} stroke={SEAM} strokeWidth={1.2} />
        ))}
        <FaceY y={3.01} x0={3.2} x1={13} z0={0} z1={0.22} fill="#cfcfcb" />
        <Box x={3.2} y={0} z={4} w={9.8} d={3} h={0.28} {...SLAB} />

        {/* Left run behind the stove: one door on its inner face */}
        <Box x={0} y={0} z={0} w={3.2} d={6.4} h={4} {...CAB} />
        <polyline points={pts([3.21, 4.7, 0.25], [3.21, 4.7, 3.75])} stroke={SEAM} strokeWidth={1.2} />
        <FaceX x={3.21} y0={3} y1={6.4} z0={0} z1={0.22} fill="#d3d3cf" />
        <Box x={0} y={0} z={4} w={3.2} d={6.4} h={0.28} {...SLAB} />

        {/* Air fryer: rounded white body, dark display and the basket handle */}
        <g {...g('air_fryer')}>
          <Glow x={1.5} y={4.5} z={5.5} rx={58} ry={66} />
          <Cylinder x={1.5} y={4.5} z={4.28} r={1.05} h={2.4} />
          <Disc x={1.5} y={4.5} z={6.68} r={0.7} fill="#f4f4f2" />
          {(() => {
            const [cx, cy] = iso(2.35, 5.1, 6.05);
            return <rect x={cx - 6} y={cy - 9} width={12} height={17} rx={3} fill="#2b2f33" />;
          })()}
          {(() => {
            const [cx, cy] = iso(2.45, 5.25, 5.0);
            return <path d={`M${cx},${cy} l7,3 l0,15`} stroke="#3b4045" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
          })()}
        </g>
        {/* Oven: stainless front with a black control strip, knobs, window and bar handle */}
        <g {...g('oven')}>
          <Glow x={3.0} y={8.6} z={1.8} rx={92} ry={104} />
          <Box x={0} y={6.4} z={0} w={3.2} d={3.6} h={4} top="#7a7e81" right="url(#k-steel)" left="#9a9fa3" />
          <FaceX x={3.21} y0={6.4} y1={10} z0={0} z1={0.25} fill="#7f8487" />
          <FaceX x={3.22} y0={6.5} y1={9.9} z0={3.25} z1={3.95} fill="#1d2023" />
          {[6.95, 9.35].map((y) => {
            const [cx, cy] = iso(3.24, y, 3.6);
            return <circle key={y} cx={cx} cy={cy} r={4.2} fill="#eef0f1" />;
          })}
          <FaceX x={3.24} y0={7.7} y1={8.6} z0={3.45} z1={3.75} fill="#e9ecef" />
          <polyline points={pts([3.32, 6.9, 2.95], [3.32, 9.5, 2.95])} stroke="#f2f2ef" strokeWidth={4.2} strokeLinecap="round" />
          <FaceX x={3.22} y0={6.9} y1={9.5} z0={0.7} z1={2.6} fill="#2a2e31" />
          <FaceX x={3.23} y0={7.15} y1={9.25} z0={0.95} z1={2.35} fill="#3a3f43" />
        </g>

        {/* Stove: grey glass hob with four white rings */}
        <g {...g('stove')}>
          <Glow x={1.6} y={8.2} z={4.2} rx={74} ry={48} />
          <polygon points={pts([0, 6.4, 4.01], [3.2, 6.4, 4.01], [3.2, 10, 4.01], [0, 10, 4.01])} fill="#7b7f82" />
          <polygon points={pts([0.12, 6.52, 4.02], [3.08, 6.52, 4.02], [3.08, 9.88, 4.02], [0.12, 9.88, 4.02])} fill="#8b8f92" />
          <Disc x={0.95} y={7.35} z={4.03} r={0.62} fill="#f4f4f2" />
          <Disc x={2.35} y={7.45} z={4.03} r={0.5} fill="#f4f4f2" />
          <Disc x={0.95} y={9.0} z={4.03} r={0.5} fill="#f4f4f2" />
          <Disc x={2.3} y={8.95} z={4.03} r={0.62} fill="#f4f4f2" />
          {[2.75, 2.95].map((x) => {
            const [cx, cy] = iso(x, 9.7, 4.03);
            return <circle key={x} cx={cx} cy={cy} r={1.6} fill="#2a2d30" />;
          })}
        </g>

        {/* Microwave: white box, dark window and a control panel */}
        <g {...g('microwave')}>
          <Glow x={6.8} y={1.6} z={5.3} rx={84} ry={58} />
          <Box x={5.0} y={0.3} z={4.28} w={3.8} d={2.4} h={2.3} {...WHITE} />
          <FaceY y={2.71} x0={5.25} x1={7.75} z0={4.55} z1={6.3} fill="#e7e7e4" />
          <FaceY y={2.72} x0={5.45} x1={7.55} z0={4.75} z1={6.1} fill="#2b2f33" />
          <FaceY y={2.72} x0={5.6} x1={6.6} z0={5.6} z1={6.0} fill="#3a4045" />
          <FaceY y={2.72} x0={7.95} x1={8.6} z0={5.6} z1={6.2} fill="#d6d6d3" />
          {[5.05, 5.4].map((z) => {
            const [cx, cy] = iso(8.27, 2.72, z);
            return <circle key={z} cx={cx} cy={cy} r={2.4} fill="#b7b9bb" />;
          })}
        </g>

        {/* Rice cooker: round white body, domed lid, dark display, side handle */}
        <g {...g('rice_cooker')}>
          <Glow x={10.4} y={1.6} z={5} rx={64} ry={50} />
          <Cylinder x={10.4} y={1.6} z={4.28} r={1.05} h={1.35} />
          <Disc x={10.4} y={1.6} z={5.75} r={0.95} fill="#f7f7f5" stroke="rgba(0,0,0,0.07)" />
          <Disc x={10.4} y={1.6} z={5.85} r={0.32} fill="#e2e2df" />
          {(() => {
            const [cx, cy] = iso(11.15, 2.35, 4.95);
            return <rect x={cx - 7} y={cy - 6} width={14} height={11} rx={2.5} fill="#2b2f33" />;
          })()}
          {(() => {
            const [ax, ay] = iso(11.45, 1.0, 5.5);
            return <path d={`M${ax - 2},${ay - 4} q12,2 9,14`} stroke="#2b2f33" strokeWidth={3.4} fill="none" strokeLinecap="round" />;
          })()}
        </g>
      </svg>

      {APPLIANCES.map((a) => {
        const [x, y] = iso(...ANCHORS[a.id]);
        return (
          <button
            key={a.id}
            className={`label ${on(a.id) ? 'on' : ''}`}
            aria-pressed={on(a.id)}
            onClick={() => onToggle(a.id)}
            style={{ left: `${((x - VB[0]) / VB[2]) * 100}%`, top: `${((y - VB[1]) / VB[3]) * 100}%` }}
          >
            {label(a.id)}
          </button>
        );
      })}
    </div>
  );
}
