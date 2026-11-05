import type { Reward } from '../types';

/** Картинка награды на всю площадь круга. Пресеты — SVG, своё фото — <img>. */
export function RewardArt({ reward }: { reward: Reward }) {
  if (reward.kind === 'photo' && reward.image) {
    return <img className="pie__art" src={reward.image} alt="" draggable={false} />;
  }
  return (
    <svg className="pie__art" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {ART[reward.kind]}
    </svg>
  );
}

const pizza = (
  <>
    <circle cx="100" cy="100" r="100" fill="#E39B45" />
    <circle cx="100" cy="100" r="88" fill="#C8371F" />
    <circle cx="100" cy="100" r="83" fill="#F4C247" />
    <circle cx="70" cy="62" r="16" fill="#F9D978" />
    <circle cx="132" cy="128" r="18" fill="#F9D978" />
    <circle cx="58" cy="128" r="12" fill="#F9D978" />
    <circle cx="100" cy="52" r="13" fill="#B42A1A" />
    <circle cx="146" cy="82" r="13" fill="#B42A1A" />
    <circle cx="62" cy="96" r="13" fill="#B42A1A" />
    <circle cx="104" cy="104" r="13" fill="#B42A1A" />
    <circle cx="90" cy="148" r="13" fill="#B42A1A" />
    <circle cx="140" cy="140" r="11" fill="#B42A1A" />
    <circle cx="138" cy="48" r="9" fill="#B42A1A" />
    <circle cx="96" cy="49" r="2.5" fill="#8E1F12" />
    <circle cx="142" cy="80" r="2.5" fill="#8E1F12" />
    <circle cx="66" cy="99" r="2.5" fill="#8E1F12" />
    <circle cx="100" cy="101" r="2.5" fill="#8E1F12" />
    <circle cx="87" cy="151" r="2.5" fill="#8E1F12" />
    <ellipse cx="76" cy="74" rx="8" ry="4" fill="#3C8D3F" transform="rotate(-30 76 74)" />
    <ellipse cx="124" cy="70" rx="8" ry="4" fill="#3C8D3F" transform="rotate(40 124 70)" />
    <ellipse cx="120" cy="118" rx="8" ry="4" fill="#3C8D3F" transform="rotate(-15 120 118)" />
    <ellipse cx="70" cy="146" rx="7" ry="3.5" fill="#3C8D3F" transform="rotate(25 70 146)" />
    <ellipse cx="160" cy="110" rx="7" ry="3.5" fill="#3C8D3F" transform="rotate(70 160 110)" />
    <circle cx="80" cy="118" r="5" fill="none" stroke="#2B2B2B" strokeWidth="3.5" />
    <circle cx="122" cy="160" r="5" fill="none" stroke="#2B2B2B" strokeWidth="3.5" />
    <circle cx="44" cy="80" r="4.5" fill="none" stroke="#2B2B2B" strokeWidth="3.5" />
  </>
);

const game = (
  <>
    <rect width="200" height="200" fill="#3B2A86" />
    <circle cx="100" cy="100" r="80" fill="#4B37A8" />
    <rect x="34" y="44" width="6" height="6" fill="#C6F432" />
    <rect x="158" y="38" width="6" height="6" fill="#C6F432" />
    <rect x="44" y="160" width="6" height="6" fill="#C6F432" />
    <rect x="160" y="152" width="6" height="6" fill="#C6F432" />
    <path
      d="M58 80 C58 72 64 68 72 68 L128 68 C136 68 142 72 142 80 L156 130 C160 146 146 154 136 144 L122 128 L78 128 L64 144 C54 154 40 146 44 130 Z"
      fill="#C6F432"
    />
    <rect x="68" y="84" width="10" height="30" rx="2" fill="#1B1446" />
    <rect x="58" y="94" width="30" height="10" rx="2" fill="#1B1446" />
    <circle cx="128" cy="86" r="6" fill="#1B1446" />
    <circle cx="140" cy="98" r="6" fill="#1B1446" />
    <circle cx="116" cy="98" r="6" fill="#1B1446" />
    <circle cx="128" cy="110" r="6" fill="#1B1446" />
    <rect x="92" y="90" width="16" height="5" rx="2.5" fill="#1B1446" />
  </>
);

const movie = (
  <>
    <rect width="200" height="200" fill="#1F2B5C" />
    <rect x="36" y="46" width="6" height="6" fill="#FFE14D" />
    <rect x="156" y="52" width="6" height="6" fill="#FFE14D" />
    <rect x="40" y="150" width="6" height="6" fill="#FFE14D" />
    <rect x="154" y="146" width="6" height="6" fill="#FFE14D" />
    <circle cx="72" cy="86" r="16" fill="#FFF3C9" />
    <circle cx="92" cy="72" r="18" fill="#FFF3C9" />
    <circle cx="114" cy="70" r="17" fill="#FFF3C9" />
    <circle cx="132" cy="84" r="15" fill="#FFF3C9" />
    <circle cx="102" cy="90" r="16" fill="#FFF3C9" />
    <circle cx="96" cy="74" r="5" fill="#F6D77A" />
    <circle cx="118" cy="72" r="4" fill="#F6D77A" />
    <circle cx="76" cy="88" r="4" fill="#F6D77A" />
    <path d="M60 104 L140 104 L128 168 L72 168 Z" fill="#FFFFFF" />
    <path d="M76 104 L92 104 L94.4 168 L83.2 168 Z" fill="#E8412C" />
    <path d="M108 104 L124 104 L116.8 168 L105.6 168 Z" fill="#E8412C" />
    <rect x="56" y="98" width="88" height="12" rx="3" fill="#E8412C" />
  </>
);

const sweet = (
  <>
    <rect width="200" height="200" fill="#FFD3E2" />
    <circle cx="100" cy="100" r="74" fill="#E2A15A" />
    <circle cx="100" cy="100" r="62" fill="#FF5FA2" />
    <circle cx="60" cy="130" r="10" fill="#FF5FA2" />
    <circle cx="140" cy="128" r="9" fill="#FF5FA2" />
    <circle cx="100" cy="158" r="8" fill="#FF5FA2" />
    <circle cx="100" cy="100" r="22" fill="#E2A15A" />
    <circle cx="100" cy="100" r="15" fill="#FFD3E2" />
    <rect x="70" y="62" width="12" height="4" rx="2" fill="#FFE14D" transform="rotate(30 76 64)" />
    <rect x="120" y="58" width="12" height="4" rx="2" fill="#3D6BFF" transform="rotate(-20 126 60)" />
    <rect x="138" y="96" width="12" height="4" rx="2" fill="#FFFFFF" transform="rotate(70 144 98)" />
    <rect x="56" y="100" width="12" height="4" rx="2" fill="#1FA971" transform="rotate(-50 62 102)" />
    <rect x="84" y="136" width="12" height="4" rx="2" fill="#FFE14D" transform="rotate(10 90 138)" />
    <rect x="118" y="134" width="12" height="4" rx="2" fill="#FFFFFF" transform="rotate(-35 124 136)" />
  </>
);

/** Заглушка для «своего фото», пока картинка не выбрана. */
const photo = (
  <>
    <rect width="200" height="200" fill="#E7E1D2" />
    <circle cx="138" cy="66" r="16" fill="#F4C247" />
    <path d="M0 170 L64 96 L104 140 L130 112 L200 178 L200 200 L0 200 Z" fill="#9A917F" />
    <path d="M0 186 L50 150 L90 176 L130 150 L200 190 L200 200 L0 200 Z" fill="#7C735F" />
  </>
);

const ART = { pizza, game, movie, sweet, photo };
