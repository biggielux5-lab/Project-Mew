/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorldClock } from '../types';
import { ShieldAlert, Plus, Minus, Lock, Trash2 } from 'lucide-react';

interface WorldClockProps {
  clock: WorldClock;
  isGM: boolean;
  onAdvance: (clock: WorldClock, delta: number) => void;
  onDelete?: (clockId: string) => void;
}

export const WorldClockWidget: React.FC<WorldClockProps> = ({ clock, isGM, onAdvance, onDelete }) => {
  const segments = clock.totalSegments;
  const filled = Math.min(clock.filledSegments, segments);
  const isCompleted = filled >= segments;

  // Render SVG segments
  const size = 120;
  const center = size / 2;
  const radius = center - 8;

  const getCoordinatesForPercent = (percent: number) => {
    const x = center + radius * Math.cos(2 * Math.PI * percent);
    const y = center + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const segmentPaths = [];
  for (let i = 0; i < segments; i++) {
    const startAngle = i / segments - 0.25;
    const endAngle = (i + 1) / segments - 0.25;

    const [startX, startY] = getCoordinatesForPercent(startAngle);
    const [endX, endY] = getCoordinatesForPercent(endAngle);

    const pathData = [
      `M ${center} ${center}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');

    const isSegmentFilled = i < filled;

    segmentPaths.push(
      <path
        key={i}
        d={pathData}
        className={`transition-all duration-300 ${
          isSegmentFilled
            ? isCompleted
              ? 'fill-rose-600 stroke-rose-950'
              : 'fill-purple-600 hover:fill-purple-500 stroke-[#181926]'
            : 'fill-[#1e202e] hover:fill-[#26283b] stroke-[#12131d]'
        }`}
        strokeWidth="2.5"
      />
    );
  }

  return (
    <div
      className={`relative p-5 rounded-xl cris-panel cris-panel-hover flex flex-col justify-between transition-all ${
        clock.isSecret ? 'border-amber-500/30 bg-amber-950/10' : ''
      } ${isCompleted ? 'border-rose-500/50 shadow-rose-950/30' : ''}`}
    >
      {/* Secret GM Tag */}
      {clock.isSecret && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-semibold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
          <Lock className="w-3 h-3" />
          SEGREDO DO MESTRE
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-2 pr-16 mb-2">
          <h4 className="font-bold text-slate-100 text-base leading-tight flex items-center gap-2">
            {isCompleted && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />}
            {clock.name}
          </h4>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          <strong className="text-slate-300">Objetivo da força:</strong> {clock.objective}
        </p>

        {clock.consequence && (
          <div className="mb-4 text-xs bg-purple-950/30 border border-purple-800/30 text-purple-200 p-2.5 rounded-lg">
            <span className="font-semibold text-purple-300">Virada (ao completar):</span> {clock.consequence}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-purple-900/20">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-md">
              <circle cx={center} cy={center} r={radius} fill="#13141f" />
              {segmentPaths}
              <circle cx={center} cy={center} r={radius * 0.35} fill="#0b0c10" stroke="#2c2d3f" strokeWidth="1.5" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-mono font-bold text-slate-200">
                {filled}/{segments}
              </span>
            </div>
          </div>

          <div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                isCompleted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : filled > 0
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isCompleted ? 'Acontecimento Disparado!' : `${segments - filled} etapas restantes`}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {isCompleted ? 'A virada se concretizou no mundo.' : 'O mundo age conforme o tempo passa.'}
            </div>
          </div>
        </div>

        {/* Master Controls */}
        {isGM && (
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onAdvance(clock, -1)}
              disabled={filled <= 0}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Recuar etapa (-1)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAdvance(clock, 1)}
              disabled={filled >= segments}
              className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Avançar etapa (+1)"
            >
              <Plus className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(clock.id)}
                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors ml-1"
                title="Excluir relógio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
