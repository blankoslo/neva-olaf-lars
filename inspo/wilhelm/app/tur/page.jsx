import Link from 'next/link';
import { WilhelmAvatar, Stamp } from '../_components/wilhelm';
import { RouteMap } from '../_components/maps';
import { WeatherGlyph } from '../_components/glyph';
import TabBar from '../_components/tabbar';

const TRIP = { region: 'FINNSKOGEN · SOLØR', days: 3, km: 38 };

const DAYS = [
  { id: 'dag-1', d: 'I',   date: 'Lør 12. sept', from: 'Røvollen',    to: 'Linneset',    km: 11, h: '4 t 30', w: 'cloud-sun', t: '12°' },
  { id: 'dag-2', d: 'II',  date: 'Søn 13. sept', from: 'Linneset',    to: 'Roenshaugen', km: 14, h: '5 t 15', w: 'rain',      t: '9°'  },
  { id: 'dag-3', d: 'III', date: 'Man 14. sept', from: 'Roenshaugen', to: 'Røvollen',    km: 13, h: '4 t 50', w: 'sun',       t: '14°' },
];

export default function TripPage() {
  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div style={{ padding: '16px 22px 0' }}>
          <div className="flex between center">
            <Link href="/" className="pill" style={{ textDecoration: 'none' }}>← TILBAKE</Link>
            <Stamp color="#b85a3c" rotate={-3}>· Om 3 dager ·</Stamp>
          </div>
          <h1 style={{ fontSize: 34, lineHeight: 1, marginTop: 18, letterSpacing: '-0.02em', fontWeight: 400 }}>
            Wilhelms<br/><em>runde.</em>
          </h1>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .6, marginTop: 8 }}>
            {TRIP.region} · {TRIP.km} KM · {TRIP.days} DAGER
          </div>
        </div>

        <div style={{ margin: '18px 18px 0', borderRadius: 4, overflow: 'hidden',
          border: '1px solid rgba(26,31,26,.22)', position: 'relative', background: '#e8dfc8' }}>
          <RouteMap width={324} height={170} theme="paper"/>
          <div style={{ position: 'absolute', top: 8, left: 10 }}>
            <Stamp color="#5b6b5a" rotate={-4}>rute · godkjent</Stamp>
          </div>
        </div>

        <div style={{ padding: '18px 22px 6px' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .6 }}>─── REISERUTE</div>
        </div>
        <div style={{ padding: '0 22px' }}>
          {DAYS.map((d, i) => (
            <Link key={d.id} href={`/tur/${d.id}`} style={{
              display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10,
              padding: '12px 0', borderBottom: i < DAYS.length - 1 ? '1px dashed rgba(26,31,26,.25)' : 'none',
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ fontSize: 34, lineHeight: 1, fontStyle: 'italic', color: 'var(--ember-2)' }}>{d.d}</div>
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.16em', opacity: .55 }}>{d.date}</div>
                <div style={{ fontSize: 16, lineHeight: 1.15, marginTop: 2 }}>{d.from} → {d.to}</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '.1em', opacity: .65, marginTop: 4 }}>
                  {d.km} KM · {d.h}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <WeatherGlyph kind={d.w} size={20}/>
                <span className="mono" style={{ fontSize: 11 }}>{d.t}</span>
              </div>
            </Link>
          ))}
        </div>

        <section style={{
          margin: '18px 18px', padding: '14px 16px', background: 'rgba(217,119,87,0.08)',
          border: '1px solid rgba(184,90,60,.45)', borderRadius: 4, position: 'relative',
        }}>
          <div className="flex gap-3 center">
            <WilhelmAvatar size={40} variant="ember"/>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ember-2)' }}>
              WILHELM · NOTAT DAG 2
            </div>
          </div>
          <p className="hand" style={{ marginTop: 8, fontSize: 19, color: '#1a3a5a', lineHeight: 1.15, marginBottom: 0 }}>
            Dag to er den lange. Gå fra Linneset før soloppgang — myra er fastere i kulda.
          </p>
        </section>

        <div style={{ padding: '0 22px 14px' }}>
          <div className="flex between center">
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .6 }}>─── PAKKING</div>
            <span className="mono" style={{ fontSize: 11 }}>14 / 22</span>
          </div>
          <div style={{ height: 6, background: 'rgba(26,31,26,.12)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: '63%', height: '100%', background: 'var(--ember)' }}/>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['STØVLER ✓', 'ULLUNDERTØY ✓', 'HODELYKT ✓', 'KART ✓', 'PRIMUS', 'FYRSTIKKER', 'FØRSTEHJELP'].map((p) => {
              const done = p.includes('✓');
              return (
                <span key={p} className="pill" style={{
                  borderColor: done ? 'var(--sage-2)' : 'rgba(26,31,26,.5)',
                  color: done ? 'var(--sage-2)' : '#2a2520',
                  opacity: done ? 1 : .65,
                }}>{p}</span>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '0 22px 24px' }}>
          <Link href="/live" className="btn-ember" style={{ width: '100%' }}>
            Start turen <span className="mono" style={{ fontSize: 10, opacity: .8 }}>· LIVE</span>
          </Link>
        </div>
      </main>
      <TabBar/>
    </>
  );
}
