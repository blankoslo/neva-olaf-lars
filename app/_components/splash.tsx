"use client";

type Props = {
  onStart: () => void;
};

export function Splash({ onStart }: Props) {
  return (
    <div className="splash">
      <svg
        className="splash-bg"
        viewBox="0 0 480 760"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="480" height="760" fill="#0a0f1c" />

        {/* Stjerner */}
        <circle cx="40" cy="25" r="1.1" fill="#c8cead" opacity="0.7" />
        <circle cx="90" cy="50" r="0.8" fill="#c8cead" opacity="0.6" />
        <circle cx="145" cy="18" r="1.3" fill="#c8cead" opacity="0.75" />
        <circle cx="200" cy="38" r="0.9" fill="#c8cead" opacity="0.65" />
        <circle cx="240" cy="12" r="1.1" fill="#c8cead" opacity="0.7" />
        <circle cx="295" cy="44" r="0.8" fill="#c8cead" opacity="0.6" />
        <circle cx="345" cy="20" r="1.2" fill="#c8cead" opacity="0.7" />
        <circle cx="405" cy="48" r="1.0" fill="#c8cead" opacity="0.65" />
        <circle cx="455" cy="22" r="0.9" fill="#c8cead" opacity="0.6" />
        <circle cx="70" cy="80" r="0.7" fill="#c8cead" opacity="0.5" />
        <circle cx="180" cy="70" r="1.0" fill="#c8cead" opacity="0.6" />
        <circle cx="315" cy="60" r="0.8" fill="#c8cead" opacity="0.55" />
        <circle cx="430" cy="74" r="1.1" fill="#c8cead" opacity="0.6" />
        <circle cx="22" cy="105" r="0.7" fill="#c8cead" opacity="0.5" />
        <circle cx="462" cy="95" r="0.8" fill="#c8cead" opacity="0.5" />
        <circle cx="130" cy="100" r="0.6" fill="#c8cead" opacity="0.45" />
        <circle cx="370" cy="88" r="0.7" fill="#c8cead" opacity="0.5" />

        {/* Måne */}
        <circle cx="410" cy="58" r="21" fill="#c8cca8" />
        <circle cx="419" cy="51" r="17" fill="#0a0f1c" />

        {/* Nordlys */}
        <path
          d="M0,105 Q120,72 240,98 Q360,122 480,85"
          fill="none"
          stroke="#2a7a5a"
          strokeWidth="3"
          opacity="0.22"
        />
        <path
          d="M0,122 Q150,91 290,115 Q390,132 480,103"
          fill="none"
          stroke="#3a5a9a"
          strokeWidth="2"
          opacity="0.18"
        />
        <path
          d="M0,140 Q115,116 255,134 Q372,148 480,120"
          fill="none"
          stroke="#2a6a6a"
          strokeWidth="2"
          opacity="0.13"
        />

        {/* Fjerne fjell */}
        <polygon points="0,285 72,152 143,268 0,268" fill="#1e2e3e" />
        <polygon points="52,285 158,130 248,252 52,285" fill="#243445" />
        <polygon points="172,285 298,114 392,234 172,285" fill="#1e2e3e" />
        <polygon points="312,285 422,120 512,214 312,285" fill="#243445" />
        <polygon points="445,285 554,140 642,202 445,285" fill="#1e2e3e" />
        <polygon points="582,285 642,164 680,198 680,285" fill="#243445" />

        {/* Snøtopper */}
        <polygon points="72,152 93,190 51,190" fill="#c8d8e4" />
        <polygon points="158,130 183,172 133,172" fill="#c8d8e4" />
        <polygon points="298,114 325,165 271,165" fill="#c8d8e4" />
        <polygon points="422,120 452,167 392,167" fill="#c8d8e4" />
        <polygon points="554,140 582,185 526,185" fill="#c8d8e4" />

        {/* Mellomfjell */}
        <polygon points="0,345 102,232 193,318 0,345" fill="#18283a" />
        <polygon points="92,363 218,218 320,308 92,363" fill="#16263a" />
        <polygon points="293,363 418,208 513,288 293,363" fill="#18283a" />
        <polygon points="472,358 588,225 662,270 662,358" fill="#16263a" />

        {/* Nære åser */}
        <ellipse cx="62" cy="440" rx="112" ry="74" fill="#0f1e2c" />
        <ellipse cx="242" cy="455" rx="150" ry="72" fill="#0d1c28" />
        <ellipse cx="422" cy="446" rx="152" ry="70" fill="#0f1e2c" />
        <ellipse cx="592" cy="458" rx="118" ry="66" fill="#0d1c28" />

        {/* Trær */}
        <polygon points="56,420 65,381 74,420" fill="#0a1820" />
        <polygon points="80,428 89,388 98,428" fill="#0c1c24" />
        <polygon points="376,418 385,378 394,418" fill="#0a1820" />
        <polygon points="400,425 409,384 418,425" fill="#0c1c24" />
        <polygon points="422,420 432,379 442,420" fill="#0a1820" />

        {/* Bakke */}
        <rect x="0" y="455" width="480" height="305" fill="#0a1420" />
        <ellipse cx="240" cy="455" rx="285" ry="22" fill="#0c1c2a" />
        <ellipse cx="240" cy="451" rx="265" ry="10" fill="#b8ccd8" opacity="0.1" />

        {/* ===== WILHELM ===== */}
        <g className="wilhelm-figure">

        {/* Stokk */}
        <rect x="272" y="270" width="6" height="200" rx="3" fill="#6a4a2a" />

        {/* Ryggsekk */}
        <rect x="200" y="265" width="44" height="64" rx="8" fill="#4a3828" />
        <rect x="204" y="271" width="36" height="20" rx="4" fill="#5a4838" />
        <path
          d="M210,265 Q197,283 195,312"
          fill="none"
          stroke="#3a2a1a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M236,265 Q225,285 223,313"
          fill="none"
          stroke="#3a2a1a"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Kåpe */}
        <path
          d="M196,316 Q188,338 184,400 Q186,420 200,424 Q223,430 246,425 Q262,422 266,402 Q270,372 266,342 Q258,319 248,316 Z"
          fill="#3a2c1a"
        />
        <path
          d="M225,316 Q221,352 219,392 Q218,408 220,424"
          fill="none"
          stroke="#2a1e0e"
          strokeWidth="2"
          opacity="0.38"
        />

        {/* Venstre arm */}
        <path
          d="M188,322 Q171,344 166,365 Q164,378 172,385"
          fill="none"
          stroke="#3a2c1a"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <ellipse cx="172" cy="386" rx="11" ry="9" fill="#5a3a1a" />

        {/* Høyre arm (stokk) */}
        <path
          d="M262,328 Q276,347 276,370 Q275,384 274,397"
          fill="none"
          stroke="#3a2c1a"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <ellipse cx="274" cy="398" rx="9" ry="8" fill="#5a3a1a" />

        {/* Skjerf */}
        <path
          d="M191,318 Q223,307 260,316 Q265,320 262,328 Q223,318 191,328 Z"
          fill="#8a3030"
        />
        <path
          d="M191,328 Q176,337 172,350 Q175,358 181,354 Q185,342 191,335 Z"
          fill="#8a3030"
        />

        {/* Genser/hals */}
        <rect x="210" y="297" width="27" height="23" rx="5" fill="#5a3a1a" />

        {/* Hode */}
        <ellipse cx="224" cy="274" rx="28" ry="31" fill="#c8916a" />
        <ellipse cx="224" cy="290" rx="21" ry="15" fill="#a07050" opacity="0.28" />
        <ellipse cx="196" cy="275" rx="5" ry="7" fill="#c8916a" />
        <ellipse cx="252" cy="275" rx="5" ry="7" fill="#c8916a" />

        {/* Skjegg */}
        <path
          d="M199,280 Q201,307 209,318 Q224,328 239,318 Q247,307 249,280 Q236,290 224,292 Q209,290 199,280 Z"
          fill="#b0a090"
        />
        <path
          d="M205,300 Q224,311 243,300"
          fill="none"
          stroke="#988880"
          strokeWidth="1.5"
          opacity="0.38"
        />
        <path
          d="M207,290 Q224,300 241,290"
          fill="none"
          stroke="#988880"
          strokeWidth="1"
          opacity="0.28"
        />

        {/* Bart */}
        <path
          d="M210,278 Q219,284 224,280 Q229,284 238,278"
          fill="none"
          stroke="#807060"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Øyne */}
        <ellipse cx="212" cy="264" rx="4.2" ry="3.8" fill="#1a1008" />
        <ellipse cx="236" cy="264" rx="4.2" ry="3.8" fill="#1a1008" />
        <circle cx="213.5" cy="262.5" r="1.4" fill="white" opacity="0.85" />
        <circle cx="237.5" cy="262.5" r="1.4" fill="white" opacity="0.85" />

        {/* Øyenbryn */}
        <path
          d="M205,255 Q212,250 220,254"
          fill="none"
          stroke="#706050"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M228,254 Q236,250 243,255"
          fill="none"
          stroke="#706050"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Nese */}
        <path
          d="M222,267 Q220,275 222,278 Q227,280 230,278 Q232,275 226,267"
          fill="#b08060"
          opacity="0.6"
        />

        {/* Rynker */}
        <path
          d="M200,259 Q198,264 200,269"
          fill="none"
          stroke="#a07050"
          strokeWidth="0.8"
          opacity="0.48"
        />
        <path
          d="M248,259 Q250,264 248,269"
          fill="none"
          stroke="#a07050"
          strokeWidth="0.8"
          opacity="0.48"
        />

        {/* Pipe */}
        <path
          d="M230,278 Q242,274 252,272 Q260,272 261,277"
          fill="none"
          stroke="#3a2a1a"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <ellipse cx="262" cy="275" rx="6.5" ry="5.5" fill="#3a2a1a" />
        <ellipse
          className="splash-ember"
          cx="262"
          cy="273"
          rx="3.5"
          ry="2.5"
          fill="#e8a040"
          opacity="0.6"
        />
        <g className="splash-smoke">
          <path
            className="splash-smoke-puff splash-smoke-puff--a"
            d="M262,266 Q259,255 263,244 Q267,234 261,223"
            fill="none"
            stroke="#a0a8a8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            className="splash-smoke-puff splash-smoke-puff--b"
            d="M262,266 Q266,256 260,246 Q255,236 263,225"
            fill="none"
            stroke="#a0a8a8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            className="splash-smoke-puff splash-smoke-puff--c"
            d="M262,266 Q258,257 264,248 Q269,238 259,228"
            fill="none"
            stroke="#a0a8a8"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>

        {/* Lue */}
        <rect x="193" y="245" width="62" height="12" rx="3" fill="#3a2814" />
        <rect x="198" y="222" width="52" height="26" rx="5" fill="#4a3820" />
        <rect x="198" y="241" width="52" height="7" rx="2" fill="#2a1808" />

        {/* Bukser */}
        <rect x="202" y="395" width="16" height="30" rx="3" fill="#2a3040" />
        <rect x="232" y="395" width="16" height="30" rx="3" fill="#2a3040" />

        {/* Støvler */}
        <rect x="200" y="416" width="20" height="22" rx="4" fill="#1a1a1a" />
        <rect x="230" y="416" width="20" height="22" rx="4" fill="#1a1a1a" />
        <rect x="198" y="428" width="24" height="10" rx="3" fill="#111" />
        <rect x="228" y="428" width="24" height="10" rx="3" fill="#111" />

        {/* Fotspor i snøen */}
        <ellipse cx="208" cy="450" rx="6" ry="2.5" fill="#8aa0b0" opacity="0.32" />
        <ellipse cx="235" cy="453" rx="6" ry="2.5" fill="#8aa0b0" opacity="0.28" />
        <ellipse cx="190" cy="457" rx="5" ry="2" fill="#8aa0b0" opacity="0.22" />
        </g>
      </svg>

      <div className="splash-card splash-card--enter">
        <p className="splash-mono">W · T</p>
        <p className="splash-anno">Anno · Friluftskompis</p>
        <h1 className="splash-title">Wilhelm Tyskeberge.</h1>
        <p className="splash-sub">Bestefar frå Vågå · sytti år i fjellet.</p>
        <div className="splash-rule" />
        <p className="splash-quote">
          Ein gammal fjellkjennar som hjelper deg planlegga neste tur.
          Fortel Wilhelm kvar du vil — han kjenner fjellet betre enn kartet.
        </p>
        <button type="button" className="splash-btn" onClick={onStart}>
          Start samtale
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6.5 1L6.5 12M1 6.5L6.5 12L12 6.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="splash-foot">Friluftskompis · 2026</p>
      </div>
    </div>
  );
}
