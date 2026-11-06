import type { CSSProperties } from 'react';
import type { Step, Actor } from '../data/types';

const actors: Actor[] = ['rp', 'client', 'auth'];

export function SequenceDiagram({ steps, index, onSelect, playing, name }: {
  steps: Step[]; index: number; onSelect: (index: number) => void;
  playing: boolean; name: string;
}) {
  const labels = ['Relying party', 'Browser', name];
  return <section className={`sequence-diagram ${playing ? 'is-playing' : ''}`} aria-label="Interactive ceremony sequence">
    <div className="sequence-workspace"><div className="sequence-canvas"><div className="sequence-actors">{labels.map(label => <strong key={label}>{label}</strong>)}</div>
    <div className="sequence-timeline"><div className="sequence-lifelines" aria-hidden="true"><i /><i /><i /></div><ol className="sequence-messages">
      {steps.slice(0, index + 1).map((step, i) => {
        const from = actors.indexOf(step.pkt?.from ?? step.who);
        const to = actors.indexOf(step.pkt?.to ?? step.who);
        return <li key={i}>
          <button type="button" aria-current={i === index ? 'step' : undefined}
            aria-label={`Step ${i + 1}: ${step.t}`}
            style={{ '--start': `${16.67 + Math.min(from, to) * 33.33}%`, '--span': `${Math.abs(from - to) * 33.33}%`, '--actor': `${16.67 + from * 33.33}%` } as CSSProperties}
            className={`${i === index ? 'current' : i < index ? 'complete' : ''} ${from === to ? 'local-event' : ''} ${to < from ? 'backward' : ''}`}
            onClick={() => onSelect(i)}>
            <span className="sequence-number">{String(i + 1).padStart(2, '0')}</span>
            <span className="sequence-track" aria-hidden="true">
              <span className={from === to ? 'sequence-local' : 'sequence-arrow'}
                style={{ left: `${16.67 + Math.min(from, to) * 33.33}%`, width: from === to ? '0' : `${Math.abs(from - to) * 33.33}%` }}>
                {from !== to && <><i className={to < from ? 'reverse' : ''} /><b className="sequence-packet" /></>}
              </span>
            </span>
            <span className="sequence-message">{step.pkt?.label ?? step.t}</span>
          </button>
        </li>;
      })}
    </ol></div></div>
    </div>
  </section>;
}
