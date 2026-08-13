export default function Landing() {
  return (
    <section className="hero">
      <div className="hero-top">
        <span className="brand">FRAME·IN·GOA</span>
        <a className="hero-link" href="#studio">
          PASS STUDIO ↓
        </a>
      </div>

      <svg
        className="scene"
        viewBox="0 0 1440 760"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="sunClip">
            <circle cx="720" cy="430" r="250" />
          </clipPath>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB648" />
            <stop offset="1" stopColor="#FF5E5B" />
          </linearGradient>
        </defs>

        {/* sun */}
        <circle cx="720" cy="430" r="330" fill="#FF5E5B" opacity="0.15" />
        <circle cx="720" cy="430" r="250" fill="url(#sunGrad)" />
        <g clipPath="url(#sunClip)" fill="#170B2E" opacity="0.35">
          <rect x="470" y="470" width="500" height="8" />
          <rect x="470" y="502" width="500" height="12" />
          <rect x="470" y="542" width="500" height="16" />
          <rect x="470" y="590" width="500" height="22" />
          <rect x="470" y="646" width="500" height="30" />
        </g>

        {/* distant hills */}
        <path
          d="M0 520 Q 180 440 380 520 L 380 760 L 0 760 Z"
          fill="#241245"
          opacity="0.8"
        />
        <path
          d="M1060 520 Q 1250 450 1440 520 L 1440 760 L 1060 760 Z"
          fill="#241245"
          opacity="0.8"
        />

        {/* sea waves */}
        <path
          d="M0 560 C 180 540 300 580 480 560 C 660 540 780 580 960 560 C 1140 540 1260 580 1440 560 L 1440 760 L 0 760 Z"
          fill="#1D0F35"
        />
        <path
          d="M0 625 C 180 605 300 645 480 625 C 660 605 780 645 960 625 C 1140 605 1260 645 1440 625 L 1440 760 L 0 760 Z"
          fill="#3A1B54"
          opacity="0.9"
        />

        {/* tiny boat */}
        <g fill="#170B2E">
          <path d="M330 546 L 390 546 L 375 562 L 345 562 Z" />
          <rect x="358" y="512" width="4" height="34" />
          <path d="M362 512 L 386 540 L 362 540 Z" />
        </g>

        {/* palms */}
        <g fill="#12081F">
          <path d="M170 760 Q 190 640 230 560 L 244 566 Q 208 646 200 760 Z" />
          <path d="M237 563 Q 180 528 122 540 Q 186 556 237 563 Z" />
          <path d="M237 563 Q 196 512 140 502 Q 198 530 237 563 Z" />
          <path d="M237 563 Q 232 500 196 464 Q 226 516 237 563 Z" />
          <path d="M237 563 Q 268 506 316 486 Q 268 528 237 563 Z" />
          <path d="M237 563 Q 292 534 344 546 Q 288 558 237 563 Z" />
        </g>
        <g fill="#12081F" transform="translate(1440,0) scale(-1,1)">
          <path d="M150 760 Q 170 655 206 585 L 220 591 Q 188 660 180 760 Z" />
          <path d="M213 588 Q 160 556 106 566 Q 164 580 213 588 Z" />
          <path d="M213 588 Q 176 540 122 532 Q 178 558 213 588 Z" />
          <path d="M213 588 Q 210 528 176 494 Q 204 544 213 588 Z" />
          <path d="M213 588 Q 242 534 288 516 Q 242 556 213 588 Z" />
          <path d="M213 588 Q 266 562 316 572 Q 262 582 213 588 Z" />
        </g>
      </svg>

      <div className="hero-body">
        <span className="tag">GOA, INDIA · 28–31 OCT 2026</span>
        <h1 className="hero-title">
          HACKER HOUSE
          <span className="sticker">GOA '26</span>
        </h1>
        <p className="hero-sub">Four days. Zero distractions. Ship by the sea.</p>
        <a className="cta hero-cta" href="#studio">
          Create your boarding pass ↓
        </a>
      </div>

      <div className="hero-foot">
        <span>#FrameInGoa</span>
        <span>BOARDING PASS STUDIO</span>
      </div>
    </section>
  );
}
