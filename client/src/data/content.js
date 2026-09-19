// Keep editorial copy and replaceable media endpoints together. API content can
// later be mapped to this shape without changing presentational components.
export const siteContent = {
  brand: 'Galaxy Studios',
  hero: {
    eyebrow: 'Est. 2014 · India & beyond',
    title: 'Wedding photography\n& cinematic films',
    statement: 'Capture the moments. Preserve the feeling.',
    primaryCta: { label: 'Explore our work', href: '/portfolio' },
    secondaryCta: { label: 'Begin your story', href: '/contact' },
  },
  media: {
    // Replace this public demo source with a Cloudinary URL or local asset later.
    heroVideo: 'https://cdn.coverr.co/videos/coverr-a-couple-on-a-beach-at-sunset-1574/1080p.mp4',
    heroPoster: '',
  },
}
