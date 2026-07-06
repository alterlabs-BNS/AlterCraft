export type BedStyle = 'Straight' | 'Curved' | 'Signature';

export type BedProduct = {
  id: string;
  name: string;
  image: string;
  style: BedStyle;
  price: number;
  finish: string;
  description: string;
};

const makeBed = (
  index: number,
  name: string,
  style: BedStyle,
  finish: string,
): BedProduct => {
  const price = style === 'Straight' ? 15000 : style === 'Curved' ? 17500 : 21000;

  return {
    id: `AC-BED-${String(index).padStart(3, '0')}`,
    name,
    image: `/images/beds/bed-${String(index).padStart(2, '0')}.jpg`,
    style,
    price,
    finish,
    description:
      style === 'Straight'
        ? 'A clean upholstered headboard with an easy-to-coordinate modern profile.'
        : style === 'Curved'
          ? 'A softly shaped upholstered headboard that adds warmth without feeling heavy.'
          : 'A statement headboard with sculpted, round or detailed upholstery work.',
  };
};

export const bedProducts: BedProduct[] = [
  makeBed(1, 'Emerald Channel Bed', 'Straight', 'Forest green channel upholstery'),
  makeBed(2, 'Ivory Arc Bed', 'Curved', 'Warm ivory upholstery'),
  makeBed(3, 'Royal Sapphire Bed', 'Signature', 'Sapphire blue with gold detail'),
  makeBed(4, 'Blush Petal Bed', 'Signature', 'Blush pink petal upholstery'),
  makeBed(5, 'Mocha Scallop Bed', 'Curved', 'Soft mocha upholstery'),
  makeBed(6, 'Urban Step Bed', 'Signature', 'Graphite stepped headboard'),
  makeBed(7, 'Lavender Dream Bed', 'Curved', 'Lavender button upholstery'),
  makeBed(8, 'Pearl Wave Bed', 'Signature', 'Pearl white sculpted upholstery'),
  makeBed(9, 'Noir Diamond Bed', 'Signature', 'Black quilted upholstery'),
  makeBed(10, 'Ocean Halo Bed', 'Signature', 'Deep teal halo upholstery'),
  makeBed(11, 'Champagne Arc Bed', 'Curved', 'Champagne beige upholstery'),
  makeBed(12, 'Midnight Sapphire Bed', 'Signature', 'Midnight blue geometric upholstery'),
  makeBed(13, 'Pearl Contour Bed', 'Signature', 'Layered pearl wave upholstery'),
  makeBed(14, 'Blush Bloom Bed', 'Signature', 'Blush shell upholstery'),
  makeBed(15, 'Noir Crest Bed', 'Signature', 'Black diamond upholstery'),
  makeBed(16, 'Olive Crest Bed', 'Straight', 'Olive vertical-panel upholstery'),
  makeBed(17, 'Lavender Royale Bed', 'Curved', 'Lavender tufted upholstery'),
  makeBed(18, 'Sand Wave Bed', 'Signature', 'Sand-toned flowing upholstery'),
  makeBed(19, 'Golden Panel Bed', 'Signature', 'Black and gold panel upholstery'),
  makeBed(20, 'Lagoon Halo Bed', 'Signature', 'Lagoon teal round upholstery'),
  makeBed(21, 'Marble Crest Bed', 'Signature', 'Ivory asymmetric upholstery'),
  makeBed(22, 'Sage Arch Bed', 'Curved', 'Sage green arch upholstery'),
  makeBed(23, 'Midnight Crown Bed', 'Signature', 'Black crown-panel upholstery'),
  makeBed(24, 'Rose Shell Bed', 'Signature', 'Rose pink shell upholstery'),
  makeBed(25, 'Golden Curve Bed', 'Curved', 'Cream curved upholstery'),
  makeBed(26, 'Teal Royale Bed', 'Curved', 'Jewel teal curved upholstery'),
  makeBed(27, 'Cocoa Halo Bed', 'Signature', 'Cocoa round upholstery'),
  makeBed(28, 'Ivory Bloom Bed', 'Signature', 'Ivory petal upholstery'),
  makeBed(29, 'Ash Panel Bed', 'Straight', 'Ash grey panel upholstery'),
  makeBed(30, 'Plum Royale Bed', 'Straight', 'Plum button upholstery'),
  makeBed(31, 'Crystal Arc Bed', 'Signature', 'Crystal beige round upholstery'),
  makeBed(32, 'Emerald Panel Bed', 'Straight', 'Emerald green panel upholstery'),
  makeBed(33, 'Royal Onyx Bed', 'Signature', 'Onyx geometric upholstery'),
  makeBed(34, 'Blush Shell Bed', 'Signature', 'Blush pink shell upholstery'),
  makeBed(35, 'Ocean Curve Bed', 'Signature', 'Ocean blue fan upholstery'),
  makeBed(36, 'Walnut Luxe Bed', 'Straight', 'Walnut and beige panel upholstery'),
  makeBed(37, 'Lavender Crest Bed', 'Curved', 'Lavender winged upholstery'),
  makeBed(38, 'Cloud Wave Bed', 'Signature', 'Cloud white flowing upholstery'),
  makeBed(39, 'Midnight Frame Bed', 'Signature', 'Black illuminated frame upholstery'),
  makeBed(40, 'Sand Halo Bed', 'Signature', 'Sand beige halo upholstery'),
];

export const bedStyleDescriptions: Record<BedStyle, string> = {
  Straight: 'Straight and simple headboard designs from INR 15,000 + tax.',
  Curved: 'Curved headboard designs from INR 17,500 + tax.',
  Signature: 'Round, sculpted and complex headboard designs from INR 21,000 + tax.',
};
