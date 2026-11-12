// One place for the links the header and footer share.

export interface NavLink {
  href: string;
  label: string;
}

export const mainNav: NavLink[] = [
  { href: '/learn/', label: 'Learn' },
  { href: '/test/', label: 'Speed test' },
  { href: '/editor/', label: 'Layout editor' },
  { href: '/firmware/', label: 'Firmware' },
];

export const shopLink: NavLink = { href: '/shop/', label: 'Shop' };

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Keyboard',
    links: [
      { href: '/', label: 'Overview' },
      shopLink,
      { href: '/firmware/', label: 'Firmware' },
    ],
  },
  {
    title: 'Practice',
    links: [
      { href: '/learn/', label: 'Typing course' },
      { href: '/test/', label: 'Speed test' },
      { href: '/editor/', label: 'Layout editor' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/terms/', label: 'Terms' },
      { href: '/legal/privacy/', label: 'Privacy' },
      { href: '/legal/returns/', label: 'Returns' },
      { href: '/legal/company/', label: 'Company' },
    ],
  },
];
