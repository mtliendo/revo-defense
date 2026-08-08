'use client'
import { useState } from 'react'

/* ---------- geometry: 40px per meter, our court 9m x 9m ---------- */
const U = 40
const PAD = 20
const NET_Y = 180
const toX = (m: number) => PAD + m * U
const toY = (m: number) => NET_Y + m * U

const PLAYERS = {
  M: { name: 'Michael', tag: 'Setter', color: '#FFC857' },
  K: { name: 'Kent', tag: 'Back row', color: '#64D6A4' },
  S: { name: 'Shalome', tag: 'Outside', color: '#5BC0EB' },
  A: { name: 'Alexis', tag: 'Opposite', color: '#C77DFF' },
}

/* Scenarios shared by both schemes — middle, guy, free ball don't change. */
const SHARED = {
  middle: {
    chip: 'Middle / dump',
    same: true,
    title: 'Quick middle or setter dump',
    cue: 'Same in both schemes — a middle attack has no real line. Nearest woman blocks, cover the dump first.',
    setter: 'Michael',
    concede: [
      { x: 0.0, y: 7.7, w: 1.2, h: 1.3 },
      { x: 7.8, y: 7.7, w: 1.2, h: 1.3 },
    ],
    attacker: { x: 4.5, y: -0.8 },
    arrows: [
      { from: [4.5, -0.8], to: [1.2, 6.2] },
      { from: [4.5, -0.8], to: [7.8, 6.2] },
      { from: [4.5, -0.8], to: [4.5, 1.9] },
    ],
    spots: {
      S: {
        x: 4.2,
        y: 0.35,
        block: true,
        job: 'BLOCK. Press over and take the straight-down ball. Square, not reaching.',
      },
      A: {
        x: 7.0,
        y: 2.0,
        job: "Pinch the right seam and stay high. If the set drifts wide, you're the blocker.",
      },
      M: {
        x: 2.6,
        y: 3.6,
        job: 'Left seam, short. Dump first — their setter will test you at least twice a set.',
      },
      K: {
        x: 5.0,
        y: 6.6,
        job: 'Deep middle. Anything hard that gets through the block.',
      },
    },
  },
  guy: {
    chip: 'Their guy',
    same: true,
    title: 'Their guy attacks from behind the 10ft line',
    cue: "Scheme doesn't apply — Michael blocks, which means Michael isn't setting. Kent slides behind the block. Call it out loud.",
    setter: 'Kent',
    concede: [{ x: 3.6, y: 1.4, w: 1.8, h: 1.2 }],
    attacker: { x: 5.0, y: -3.2 },
    arrows: [
      { from: [5.0, -3.2], to: [1.0, 7.8] },
      { from: [5.0, -3.2], to: [8.0, 7.8] },
      { from: [5.0, -3.2], to: [4.5, 8.6] },
    ],
    spots: {
      M: {
        x: 5.0,
        y: 0.4,
        block: true,
        job: "BLOCK. He's swinging from 10+ feet back so the ball is flat and long. Press and take the sharp angle away — make him hit deep.",
      },
      K: {
        x: 4.6,
        y: 3.4,
        job: 'Behind the block and setting this rally. Stay short. If you have to dig it, call for a woman to set and go swing.',
      },
      S: {
        x: 1.6,
        y: 5.8,
        job: 'Deep left corner. Start deeper than feels right — back-row swings land long.',
      },
      A: {
        x: 7.6,
        y: 5.8,
        job: 'Deep right corner. Same. Let the short roll drop if it comes.',
      },
    },
  },
  free: {
    chip: 'Free ball',
    same: true,
    title: 'Free ball / down ball',
    cue: 'Same in both schemes. Call it loud and release — Michael to the net, passing triangle behind him.',
    setter: 'Michael',
    concede: [],
    attacker: { x: 4.5, y: -1.4 },
    arrows: [{ from: [4.5, -1.4], to: [4.5, 5.4] }],
    spots: {
      M: {
        x: 5.8,
        y: 1.6,
        job: "Release to the net, right of center. You're setting — don't pass unless it's on your face.",
      },
      K: {
        x: 4.6,
        y: 7.2,
        job: 'Deep middle. Take the bulk so both women stay free to swing.',
      },
      S: {
        x: 2.2,
        y: 5.0,
        job: 'Left. Pass, then get off the net and load immediately.',
      },
      A: {
        x: 7.2,
        y: 5.0,
        job: "Right. Pass and load. Best swing of the rally — don't waste it.",
      },
    },
  },
}

const SCHEMES = {
  A: {
    id: 'A',
    name: 'Scheme A',
    short: 'Block line',
    accent: '#FF5A4D',
    accentInk: '#12080A',
    kicker: 'Scheme A · Block line, dig cross',
    scenarios: [
      {
        key: 'base',
        chip: 'Base',
        title: 'Base — their pass is up',
        cue: "Read their setter's shoulders and hips. Nobody commits until the ball leaves her hands.",
        setter: 'Michael',
        concede: [],
        attacker: null,
        arrows: [],
        spots: {
          S: {
            x: 2.0,
            y: 1.6,
            job: "Left front, one step off the net. Any set toward our left and you're the blocker — line up outside her, on the antenna.",
          },
          A: {
            x: 7.0,
            y: 1.6,
            job: 'Right front, one step off the net. Same read on our right side.',
          },
          M: {
            x: 4.5,
            y: 2.6,
            job: "Middle, 2.5m off. Your read is their guy: if he's loading behind the 10ft line, you're going up.",
          },
          K: {
            x: 4.5,
            y: 6.8,
            job: 'Deep middle. You move first — wherever the block goes, you fill the cross-court behind it.',
          },
        },
      },
      {
        key: 'left',
        chip: 'Their left side',
        title: 'They set their left side → attack at our right',
        cue: "Alexis blocks line. We're giving up the deep line corner on purpose — and with Michael's reach behind the block, that window is small.",
        setter: 'Michael',
        concede: [{ x: 7.7, y: 7.6, w: 1.3, h: 1.4 }],
        attacker: { x: 7.5, y: -0.8 },
        arrows: [
          { from: [7.5, -0.8], to: [8.3, 6.4], kill: true },
          { from: [7.5, -0.8], to: [1.2, 7.0] },
          { from: [7.5, -0.8], to: [2.6, 2.4] },
        ],
        spots: {
          A: {
            x: 7.4,
            y: 0.35,
            block: true,
            job: 'BLOCK LINE. Outside hand on the line, press over. The line is yours and only yours.',
          },
          M: {
            x: 6.5,
            y: 3.0,
            job: "Behind the block. Tips, high hands, deflections — and you're tall enough that anything she tries to push over your block toward the corner has to be near-perfect. Stay short, stay free to set.",
          },
          K: {
            x: 3.0,
            y: 6.6,
            job: 'Deep cross. Every hard-driven ball through the seam is yours. Start moving on her arm swing, not before.',
          },
          S: {
            x: 1.8,
            y: 3.2,
            job: 'Short cross. Sharp angle and roll shots. Stay high so you can turn and swing in transition.',
          },
        },
      },
      {
        key: 'right',
        chip: 'Their right side',
        title: 'They set their right side → attack at our left',
        cue: "Mirror image. Shalome blocks line, deep line corner is the give — and it's a narrow window past Michael.",
        setter: 'Michael',
        concede: [{ x: 0.0, y: 7.6, w: 1.3, h: 1.4 }],
        attacker: { x: 1.5, y: -0.8 },
        arrows: [
          { from: [1.5, -0.8], to: [0.7, 6.4], kill: true },
          { from: [1.5, -0.8], to: [7.8, 7.0] },
          { from: [1.5, -0.8], to: [6.4, 2.4] },
        ],
        spots: {
          S: {
            x: 1.6,
            y: 0.35,
            block: true,
            job: 'BLOCK LINE. Outside hand on the line, press over. Take line away and hold it.',
          },
          M: {
            x: 2.5,
            y: 3.0,
            job: 'Behind the block. Tips and deflections. Your reach is what keeps the corner honest — stay short and stay free to set.',
          },
          K: {
            x: 6.0,
            y: 6.6,
            job: 'Deep cross. The hard-driven ball through the seam is yours.',
          },
          A: {
            x: 7.2,
            y: 3.2,
            job: "Short cross. Sharp angle and rolls. Stay high — you're our first swing back.",
          },
        },
      },
      SHARED.middle,
      SHARED.guy,
      SHARED.free,
    ],
  },
  B: {
    id: 'B',
    name: 'Scheme B',
    short: 'Block angle',
    accent: '#2ED3B7',
    accentInk: '#06201C',
    kicker: 'Scheme B · Block angle, dig line',
    scenarios: [
      {
        key: 'base',
        chip: 'Base',
        title: 'Base — their pass is up',
        cue: "Same start. The difference is Kent's first step — he's going to the line on whichever side they set, not to the middle.",
        setter: 'Michael',
        concede: [],
        attacker: null,
        arrows: [],
        spots: {
          S: {
            x: 2.0,
            y: 1.6,
            job: "Left front, one step off the net. Set toward our left and you're blocking the angle — line up on her hitting shoulder, not the antenna.",
          },
          A: {
            x: 7.0,
            y: 1.6,
            job: 'Right front, one step off the net. Same read on our right side.',
          },
          M: {
            x: 4.5,
            y: 2.6,
            job: 'Middle, 2.5m off. Watching their guy — if he loads behind the 10ft line you go up and Kent takes over setting.',
          },
          K: {
            x: 4.5,
            y: 6.8,
            job: 'Deep middle, but your first move is diagonal to the line on the attack side. Narrow lane, so get there early and set your feet.',
          },
        },
      },
      {
        key: 'left',
        chip: 'Their left side',
        title: 'They set their left side → attack at our right',
        cue: "Alexis takes the angle away. Kent owns the line. The give is the ball that clears Michael's hands into the deep cross corner — a small window at his height.",
        setter: 'Michael',
        concede: [{ x: 0.2, y: 7.5, w: 1.5, h: 1.5 }],
        attacker: { x: 7.5, y: -0.8 },
        arrows: [
          { from: [7.5, -0.8], to: [8.3, 6.4] },
          { from: [7.5, -0.8], to: [1.4, 6.8], kill: true },
          { from: [7.5, -0.8], to: [2.6, 2.4] },
        ],
        spots: {
          A: {
            x: 6.9,
            y: 0.35,
            block: true,
            job: "BLOCK ANGLE. Line up on her hitting shoulder, not the antenna, and reach inside. You're erasing the hard cross — the swing she takes most.",
          },
          K: {
            x: 7.9,
            y: 4.6,
            job: "LINE. Narrow lane, short flight, arrives fast. Feet set before she contacts and don't cheat inside.",
          },
          M: {
            x: 4.8,
            y: 2.9,
            job: "Behind the block, middle. Tips, high hands, off-hand deflections. Fewest touches on the court, which is why you're still setting.",
          },
          S: {
            x: 2.0,
            y: 2.8,
            job: "Short cross — the cut shot inside the block. Stay high; you're the first swing back the other way.",
          },
        },
      },
      {
        key: 'right',
        chip: 'Their right side',
        title: 'They set their right side → attack at our left',
        cue: 'Mirror image. Shalome takes angle, Kent slides to our left sideline.',
        setter: 'Michael',
        concede: [{ x: 7.3, y: 7.5, w: 1.5, h: 1.5 }],
        attacker: { x: 1.5, y: -0.8 },
        arrows: [
          { from: [1.5, -0.8], to: [0.7, 6.4] },
          { from: [1.5, -0.8], to: [7.6, 6.8], kill: true },
          { from: [1.5, -0.8], to: [6.4, 2.4] },
        ],
        spots: {
          S: {
            x: 2.1,
            y: 0.35,
            block: true,
            job: 'BLOCK ANGLE. On her hitting shoulder, reach inside. Take the hard cross off the table.',
          },
          K: {
            x: 1.1,
            y: 4.6,
            job: 'LINE. Set your feet early. This ball comes fast but it comes to a spot you already know.',
          },
          M: {
            x: 4.2,
            y: 2.9,
            job: 'Behind the block, middle. Tips and deflections. Hands stay clean for the set.',
          },
          A: {
            x: 7.0,
            y: 2.8,
            job: 'Short cross — the cut inside the block. Stay high and load your approach.',
          },
        },
      },
      SHARED.middle,
      SHARED.guy,
      SHARED.free,
    ],
  },
}

export default function RevCoDefense() {
  const [schemeId, setSchemeId] = useState('A')
  const [idx, setIdx] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [showShots, setShowShots] = useState(true)

  const scheme = SCHEMES[schemeId as keyof typeof SCHEMES]
  const sc = scheme.scenarios[idx]
  const order = ['M', 'K', 'S', 'A']

  return (
    <div
      className='revco'
      style={
        {
          '--sig': scheme.accent as unknown as string,
          '--sigink': scheme.accentInk as unknown as string,
        } as React.CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .revco {
          --ink:#0E1419; --panel:#17202A; --line:#26323F;
          --text:#E8EEF3; --dim:#8DA0B0; --hot:#FF5A4D;
          background:
            radial-gradient(1200px 600px at 12% -10%, rgba(255,90,77,.07), transparent 55%),
            radial-gradient(900px 500px at 90% 0%, rgba(46,211,183,.05), transparent 50%),
            var(--ink);
          color:var(--text); min-height:100vh;
          font-family:'Inter',system-ui,sans-serif;
          padding:18px 14px 40px; box-sizing:border-box;
        }
        .revco * { box-sizing:border-box; }
        .shell { width:100%; max-width:1120px; margin:0 auto; }
        .kicker {
          font-family:'Barlow Condensed',sans-serif; font-weight:600;
          letter-spacing:.16em; text-transform:uppercase; font-size:11px; color:var(--sig);
          transition:color .2s;
        }
        .h1 {
          font-family:'Barlow Condensed',sans-serif; font-weight:700;
          font-size:clamp(30px, 4vw, 44px); line-height:1.02; letter-spacing:-.01em; margin:4px 0 2px;
          text-transform:uppercase;
        }
        .sub { font-size:12px; color:var(--dim); margin:0 0 14px; }
        .top { margin-bottom:2px; }
        .seg { display:flex; border:1px solid var(--line); border-radius:2px; overflow:hidden; margin-bottom:14px; max-width:420px; }
        .seg button {
          flex:1; background:var(--panel); border:none; cursor:pointer; padding:10px 8px;
          color:var(--dim); font-family:'Barlow Condensed',sans-serif; font-weight:700;
          font-size:15px; letter-spacing:.08em; text-transform:uppercase;
          transition:background .18s, color .18s; line-height:1.15;
        }
        .seg button small {
          display:block; font-size:10.5px; letter-spacing:.1em; font-weight:600; opacity:.75; margin-top:2px;
        }
        .seg button[data-on="1"] { background:var(--sig); color:var(--sigink); }
        .seg button + button { border-left:1px solid var(--line); }

        .chips { display:flex; gap:7px; overflow-x:auto; padding:0 14px 10px; margin:0 -14px 12px; scrollbar-width:none; }
        .chips::-webkit-scrollbar { display:none; }
        .chip {
          flex:0 0 auto; border:1px solid var(--line); background:var(--panel);
          color:var(--dim); border-radius:2px; padding:8px 12px; cursor:pointer;
          font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:14px;
          letter-spacing:.07em; text-transform:uppercase; white-space:nowrap;
          transition:background .15s, color .15s, border-color .15s;
        }
        .chip:hover { color:var(--text); border-color:#3A4A5C; }
        .chip[data-on="1"] { background:var(--sig); border-color:var(--sig); color:var(--sigink); }
        .chip[data-same="1"]::after { content:" ="; opacity:.55; }
        .chip:focus-visible, .toggle:focus-visible, .card:focus-visible, .seg button:focus-visible { outline:2px solid #FFC857; outline-offset:2px; }

        .stage { display:flex; flex-direction:column; gap:0; }
        .viz { min-width:0; }
        .detail { min-width:0; }
        .board {
          background:var(--panel); border:1px solid var(--line); border-radius:3px; padding:10px;
        }
        .board svg { max-width:440px; margin:0 auto; }
        .legend { display:flex; gap:14px; flex-wrap:wrap; margin-top:2px; font-size:11px; color:var(--dim); }
        .legend span { display:flex; align-items:center; gap:5px; }
        .swatch { width:16px; height:0; border-top:2px solid var(--hot); }
        .swatch.dead { border-top:2px dashed #6B7A88; }
        .swatch.give { width:12px; height:9px; border:1px dashed var(--hot); background:rgba(255,90,77,.14); }

        .cue { display:flex; gap:10px; margin:14px 0 4px; }
        .cuebar { width:3px; background:var(--sig); flex:0 0 3px; transition:background .2s; }
        .cuetext { font-size:13px; line-height:1.5; color:#C7D4DE; }
        .cuetitle {
          font-family:'Barlow Condensed',sans-serif; text-transform:uppercase;
          letter-spacing:.09em; font-weight:700; font-size:15px; color:var(--text); margin-bottom:3px;
        }
        .setterline {
          margin:14px 0 4px; border:1px solid var(--line); border-left:3px solid #FFC857;
          background:#1B242E; padding:9px 11px; font-size:12.5px; color:#C7D4DE;
        }
        .setterline b { color:#FFC857; font-weight:600; }

        .cards { display:grid; gap:8px; margin-top:14px; }
        .card {
          display:grid; grid-template-columns:34px 1fr; gap:11px; align-items:start;
          background:var(--panel); border:1px solid var(--line); border-radius:3px;
          padding:11px 12px; cursor:pointer; text-align:left; width:100%;
          font-family:inherit; color:inherit; transition:border-color .15s, background .15s;
        }
        .card:hover { background:#1B242E; }
        .card[data-on="1"] { border-color:#4A5D70; background:#1D2833; }
        .dot {
          width:34px; height:34px; border-radius:50%; display:grid; place-items:center;
          font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:17px; color:#0E1419;
        }
        .pname {
          font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:16px;
          text-transform:uppercase; letter-spacing:.05em; display:flex; align-items:center; gap:7px; flex-wrap:wrap;
        }
        .badge {
          font-size:9.5px; letter-spacing:.13em; padding:2px 5px; border-radius:2px;
          background:var(--sig); color:var(--sigink); font-weight:700;
        }
        .badge.ghost { background:transparent; border:1px solid var(--line); color:var(--dim); font-weight:600; }
        .pjob { font-size:12.5px; line-height:1.5; color:#B9C7D2; margin-top:4px; }

        .toggle {
          display:flex; align-items:center; gap:7px; background:none; border:none; cursor:pointer;
          color:var(--dim); font-family:'Barlow Condensed',sans-serif; font-size:13px;
          letter-spacing:.09em; text-transform:uppercase; padding:8px 0; margin-top:2px;
        }
        .sw { width:30px; height:16px; border-radius:9px; background:#2A3846; position:relative; transition:background .18s; }
        .sw i { position:absolute; top:2px; left:2px; width:12px; height:12px; border-radius:50%; background:#7B8B99; transition:transform .18s, background .18s; }
        .toggle[data-on="1"] .sw { background:#4A2A28; }
        .toggle[data-on="1"] .sw i { transform:translateX(14px); background:var(--hot); }

        .rules { margin-top:22px; border-top:1px solid var(--line); padding-top:14px; display:flex; flex-wrap:wrap; gap:6px; }
        .rule { font-size:11px; color:var(--dim); border:1px solid var(--line); padding:5px 8px; border-radius:2px; }
        .mover { transition:transform 480ms cubic-bezier(.4,0,.2,1); }
        @media (prefers-reduced-motion: reduce) { .mover { transition:none; } }

        @media (min-width:620px) {
          .cards { grid-template-columns:1fr 1fr; }
        }

        @media (min-width:900px) {
          .revco { padding:32px 28px 56px; }
          .top {
            display:grid;
            grid-template-columns:1fr auto;
            gap:18px 28px;
            align-items:end;
            margin-bottom:18px;
          }
          .top .seg { margin-bottom:0; width:280px; max-width:none; }
          .sub { margin-bottom:0; font-size:13px; }
          .chips {
            overflow:visible; flex-wrap:wrap; padding:0 0 4px; margin:0 0 20px;
          }
          .stage {
            display:grid;
            grid-template-columns:minmax(360px, 440px) minmax(0, 1fr);
            gap:28px 36px;
            align-items:start;
          }
          .viz {
            position:sticky;
            top:24px;
          }
          .board { padding:14px; }
          .board svg { max-width:none; }
          .cue { margin-top:0; }
          .cuetext { font-size:14px; line-height:1.55; }
          .cuetitle { font-size:17px; }
          .setterline { font-size:13px; padding:11px 13px; }
          .cards { margin-top:16px; gap:10px; }
          .pjob { font-size:13px; }
          .rules { margin-top:28px; gap:8px; }
          .rule { font-size:12px; padding:6px 10px; }
        }

        @media (min-width:1100px) {
          .stage { grid-template-columns:minmax(400px, 480px) minmax(0, 1fr); gap:32px 44px; }
          .cards { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className='shell'>
        <div className='top'>
          <div>
            <div className='kicker'>{scheme.kicker}</div>
            <h1 className='h1'>Where we stand</h1>
            <p className='sub'>
              Michael sets · Shalome outside · Alexis opposite · Kent back row
            </p>
          </div>

          <div className='seg' role='group' aria-label='Defensive scheme'>
            {['A', 'B'].map((k) => (
              <button
                key={k}
                data-on={schemeId === k ? '1' : '0'}
                onClick={() => setSchemeId(k)}
                aria-pressed={schemeId === k}
              >
                {SCHEMES[k as keyof typeof SCHEMES].name}
                <small>{SCHEMES[k as keyof typeof SCHEMES].short}</small>
              </button>
            ))}
          </div>
        </div>

        <div className='chips'>
          {scheme.scenarios.map((s: any, i: number | string) => (
            <button
              key={s.key || s.chip}
              className='chip'
              data-on={i === idx ? '1' : '0'}
              data-same={s.same ? '1' : '0'}
              title={s.same ? 'Identical in both schemes' : undefined}
              onClick={() => {
                setIdx(i as number)
                setSelected(null)
              }}
            >
              {s.chip}
            </button>
          ))}
        </div>

        <div className='stage'>
          <div className='viz'>
            <div className='board'>
              <Court
                sc={sc}
                selected={selected}
                onPick={setSelected}
                showShots={showShots}
              />
            </div>

            <button
              className='toggle'
              data-on={showShots ? '1' : '0'}
              onClick={() => setShowShots(!showShots)}
            >
              <span className='sw'>
                <i />
              </span>
              Show their shot options
            </button>

            {showShots && (
              <div className='legend'>
                <span>
                  <i className='swatch' /> Live shot
                </span>
                <span>
                  <i className='swatch dead' /> Blocked away
                </span>
                <span>
                  <i className='swatch give' /> Give — past Michael&apos;s reach
                </span>
              </div>
            )}
          </div>

          <div className='detail'>
            <div className='cue'>
              <div className='cuebar' />
              <div className='cuetext'>
                <div className='cuetitle'>{sc.title}</div>
                {sc.cue}
              </div>
            </div>

            <div className='setterline'>
              Behind the block is the setter. This rally that&apos;s <b>{sc.setter}</b>.
            </div>

            <div className='cards'>
              {order.map((id) => {
                const spot = sc.spots[id as keyof typeof sc.spots]
                const p = PLAYERS[id as keyof typeof PLAYERS]
                return (
                  <button
                    key={id}
                    className='card'
                    data-on={selected === id ? '1' : '0'}
                    onClick={() => setSelected(selected === id ? null : id)}
                  >
                    <span className='dot' style={{ background: p.color }}>
                      {p.name[0]}
                    </span>
                    <span>
                      <span className='pname'>
                        {p.name}
                        {spot && 'block' in spot && spot.block ? (
                          <span className='badge'>Blocker</span>
                        ) : (
                          <span className='badge ghost'>{p.tag}</span>
                        )}
                      </span>
                      <span className='pjob'>
                        {spot && 'job' in spot ? spot.job : ''}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className='rules'>
          <span className='rule'>No let serves</span>
          <span className='rule'>No rotation</span>
          <span className='rule'>Set over must be square</span>
          <span className='rule'>Guys block guys only</span>
          <span className='rule'>Guys attack from behind 10ft</span>
          <span className='rule'>Jump topspin serves legal</span>
        </div>
      </div>
    </div>
  )
}

function Court({
  sc,
  selected,
  onPick,
  showShots,
}: {
  sc: any
  selected: any
  onPick: (id: any) => void
  showShots: boolean
}) {
  const order = ['S', 'A', 'M', 'K']
  return (
    <svg
      viewBox='0 0 400 585'
      width='100%'
      style={{ display: 'block' }}
      role='img'
      aria-label={`Defensive positions: ${sc.title}`}
    >
      <defs>
        <marker
          id='ah'
          markerWidth='7'
          markerHeight='7'
          refX='5.4'
          refY='3'
          orient='auto'
        >
          <path d='M0,0 L6,3 L0,6 z' fill='#FF5A4D' />
        </marker>
      </defs>

      <rect x={PAD} y={20} width={9 * U} height={160} fill='#5E3A20' />
      <line
        x1={PAD}
        y1={60}
        x2={PAD + 9 * U}
        y2={60}
        stroke='#E7DCCB'
        strokeWidth='1.5'
        opacity='.5'
      />
      <text
        x={PAD + 6}
        y={36}
        fontFamily='Barlow Condensed'
        fontSize='11'
        letterSpacing='1.4'
        fill='#C0A991'
      >
        THEIR SIDE
      </text>

      <rect x={PAD} y={NET_Y} width={9 * U} height={3 * U} fill='#B0763F' />
      <rect
        x={PAD}
        y={NET_Y + 3 * U}
        width={9 * U}
        height={6 * U}
        fill='#9C6634'
      />
      <rect
        x={PAD}
        y={NET_Y}
        width={9 * U}
        height={9 * U}
        fill='none'
        stroke='#F6F1E7'
        strokeWidth='2.5'
      />
      <line
        x1={PAD}
        y1={toY(3)}
        x2={PAD + 9 * U}
        y2={toY(3)}
        stroke='#F6F1E7'
        strokeWidth='2'
      />
      <text
        x={PAD + 6}
        y={toY(3) - 7}
        fontFamily='Barlow Condensed'
        fontSize='11'
        letterSpacing='1.4'
        fill='#F0E5D5'
        opacity='.75'
      >
        10 FT LINE
      </text>

      {sc.concede.map((z: any, i: number) => (
        <g key={i}>
          <rect
            x={toX(z.x)}
            y={toY(z.y)}
            width={z.w * U}
            height={z.h * U}
            fill='#FF5A4D'
            opacity='.14'
            stroke='#FF5A4D'
            strokeWidth='1.2'
            strokeDasharray='4 3'
          />
          <text
            x={toX(z.x) + (z.w * U) / 2}
            y={toY(z.y) + (z.h * U) / 2 + 4}
            textAnchor='middle'
            fontFamily='Barlow Condensed'
            fontSize='10'
            letterSpacing='1.1'
            fill='#FFB3AB'
          >
            GIVE
          </text>
        </g>
      ))}

      <line
        x1={PAD}
        y1={NET_Y}
        x2={PAD + 9 * U}
        y2={NET_Y}
        stroke='#0E1419'
        strokeWidth='7'
      />
      <line
        x1={PAD}
        y1={NET_Y}
        x2={PAD + 9 * U}
        y2={NET_Y}
        stroke='#F6F1E7'
        strokeWidth='3.5'
        strokeDasharray='3 3'
      />

      {showShots &&
        sc.arrows.map((a: any, i: number) => (
          <line
            key={i}
            x1={toX(a.from[0])}
            y1={toY(a.from[1])}
            x2={toX(a.to[0])}
            y2={toY(a.to[1])}
            stroke={a.kill ? '#6B7A88' : '#FF5A4D'}
            strokeWidth='1.6'
            strokeDasharray={a.kill ? '5 5' : '0'}
            opacity={a.kill ? '.45' : '.55'}
            markerEnd={a.kill ? undefined : 'url(#ah)'}
          />
        ))}

      {sc.attacker && (
        <g transform={`translate(${toX(sc.attacker.x)},${toY(sc.attacker.y)})`}>
          <circle r='13' fill='#FF5A4D' />
          <path d='M-5,3 L0,-4 L5,3 z' fill='#2A0D0A' />
        </g>
      )}

      {order.map((id) => {
        const s = sc.spots[id as keyof typeof sc.spots]
        const p = PLAYERS[id as keyof typeof PLAYERS]
        const on = selected === id
        return (
          <g
            key={id}
            className='mover'
            style={{ transform: `translate(${toX(s.x)}px, ${toY(s.y)}px)` }}
          >
            <g
              onClick={() => onPick(on ? null : id)}
              style={{ cursor: 'pointer' }}
            >
              {s.block && <circle r='24' fill={p.color} opacity='.18' />}
              <circle
                r='16'
                fill={p.color}
                stroke={
                  on ? '#FFFFFF' : s.block ? '#F6F1E7' : 'rgba(14,20,25,.55)'
                }
                strokeWidth={on ? 3.5 : s.block ? 3 : 1.5}
              />
              <text
                y='6'
                textAnchor='middle'
                fontFamily='Barlow Condensed'
                fontWeight='700'
                fontSize='18'
                fill='#0E1419'
              >
                {p.name[0]}
              </text>
              <text
                y='32'
                textAnchor='middle'
                fontFamily='Barlow Condensed'
                fontWeight='600'
                fontSize='13'
                letterSpacing='.7'
                fill='#EAF1F6'
              >
                {p.name.toUpperCase()}
              </text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}
