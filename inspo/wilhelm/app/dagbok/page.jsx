import { WilhelmAvatar, Stamp } from '../_components/wilhelm';
import TabBar from '../_components/tabbar';

export default function JournalPage() {
  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div style={{ padding: '16px 22px 0' }}>
          <div className="flex between center">
            <Stamp color="#5b6b5a" rotate={-3}>fullført · 14·09</Stamp>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .55 }}>DAGBOK · 042</div>
          </div>
          <h1 style={{ marginTop: 18, fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', fontWeight: 400 }}>
            Tre dager i <em>Finnskogen.</em>
          </h1>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .6, marginTop: 8 }}>
            12.—14. SEPT · 38 KM · 14 T 35
          </div>
        </div>

        <div style={{ padding: '18px 18px 0', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <div className="tilt-l">
            <div className="img-slot" style={{ width: '100%', aspectRatio: '4/5' }}>
              VANNET<br/>VED DAGGRY
            </div>
          </div>
          <div className="flex col gap-2">
            <div className="tilt-r">
              <div className="img-slot" style={{ width: '100%', aspectRatio: '1' }}>HYTTE</div>
            </div>
            <div className="tilt-l">
              <div className="img-slot" style={{ width: '100%', aspectRatio: '1' }}>STIEN</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 22px 0' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', opacity: .6 }}>─── STEMPLER</div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '12px 18px 0', flexWrap: 'wrap' }}>
          <Stamp color="#b85a3c" rotate={-4}>3 hytter · 2 netter</Stamp>
          <Stamp color="#5b6b5a" rotate={2}>finnskogen · 38 km</Stamp>
          <Stamp color="#1a1f1a" rotate={-1}>første regntur</Stamp>
        </div>

        <section style={{
          margin: '18px 18px 24px', padding: '14px 16px', background: '#fff8ea',
          border: '1px solid rgba(26,31,26,.2)', borderRadius: 4, transform: 'rotate(-0.6deg)',
        }}>
          <div className="flex gap-3 center">
            <WilhelmAvatar size={40} variant="ink"/>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', opacity: .6 }}>WILHELM · BREV</div>
          </div>
          <p className="hand" style={{ marginTop: 10, fontSize: 18, color: '#1a3a5a', lineHeight: 1.18, marginBottom: 0 }}>
            Du gikk gjennom regn uten å klage en eneste gang. Skogen husker slikt. Kom tilbake om vinteren — stillheten er en annen da.
          </p>
          <p className="hand" style={{ marginTop: 8, fontSize: 22, color: '#1a3a5a', textAlign: 'right', marginBottom: 0 }}>
            — Wilhelm
          </p>
        </section>
      </main>
      <TabBar/>
    </>
  );
}
