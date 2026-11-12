// One place for the words and links the header and footer share.
// Links that start with "#" are sections of the home page; on other pages they get a "/" in front.

export interface NavLink {
  href: string;
  label: string;
}

export interface MenuCard extends NavLink {
  line: string;
  image: string;
  alt: string;
}

// The one main action. The same words in the nav, the hero, the close, the phone bar and the form button.
export const mainAction: NavLink = { href: '#order', label: 'Join the waitlist' };

// The nav words, in order. Each one is a word from the heading of the section it opens.
export const mainNav: NavLink[] = [
  { href: '#layout', label: 'Keyboard' },
  { href: '#practice', label: 'Practice' },
  { href: '#questions', label: 'Questions' },
];

// Picture cards in the panel that opens under "Keyboard".
export const keyboardMenu: MenuCard[] = [
  {
    href: '#layout',
    label: 'How it types',
    line: 'Hold Space for the other half of the alphabet',
    image: '/img/product/detail-legends-800.webp',
    alt: 'Detailed keycaps close up, each with a black and a blue letter',
  },
  {
    href: '#controls',
    label: 'Controls',
    line: 'Knob, five-way switch and touchpad',
    image: '/img/product/nav-controls.webp',
    alt: 'The five-way switch and the touchpad beside the keys',
  },
  {
    href: '#options',
    label: 'Options',
    line: 'Two colours, two keycap sets, three languages',
    image: '/img/product/nav-options.webp',
    alt: 'Light pink housing with Minimal keycaps',
  },
];

// Two footer columns of four links: on a phone they stand side by side and the footer stays one screen.
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Keyboard',
    links: [
      { href: '#layout', label: 'How it types' },
      { href: '#controls', label: 'Controls' },
      { href: '#options', label: 'Options' },
      { href: '#questions', label: 'Questions' },
    ],
  },
  {
    title: 'Practice',
    links: [
      { href: '/learn/', label: 'Typing course' },
      { href: '/test/', label: 'Speed test' },
      { href: '/editor/', label: 'Layout editor' },
      { href: '/firmware/', label: 'Firmware' },
    ],
  },
];

// The small row at the foot of every page.
export const legalNav: NavLink[] = [
  { href: '/legal/privacy/', label: 'Privacy' },
  { href: '/legal/terms/', label: 'Terms' },
  { href: '/legal/returns/', label: 'Returns' },
  { href: '/legal/company/', label: 'Company' },
];

/** Turns a home-page section link into one that works from any page. */
export function link(href: string, home: boolean): string {
  return href.startsWith('#') && !home ? `/${href}` : href;
}
