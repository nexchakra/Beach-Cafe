
import { MenuItem } from './types';

export const MENU_DATA: MenuItem[] = [
  {
    id: '1',
    name: 'Wagyu Beef Carpaccio',
    description: 'Thinly sliced A5 Wagyu, truffle oil, capers, and aged parmesan shavings.',
    price: 24,
    category: 'Starter',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    dietary: ['Gluten-Free'],
    sourcing: [
      {
        ingredient: 'A5 Wagyu',
        location: 'Kagoshima, Japan',
        story: 'Sourced from legendary producers known for intense marbling and umami.',
        link: 'https://www.kagoshimabeef.com'
      },
      {
        ingredient: 'Black Truffle',
        location: 'Périgord, France',
        story: 'Harvested at peak ripeness for an earthy, unmistakable aroma.',
        link: 'https://www.perigord-truffle.com'
      }
    ]
  },
  {
    id: '2',
    name: 'Seared Scallops',
    description: 'Jumbo Hokkaido scallops, pea purée, and crispy pancetta.',
    price: 22,
    category: 'Starter',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
    sourcing: [
      {
        ingredient: 'Hokkaido Scallops',
        location: 'Funka Bay, Japan',
        story: 'Diver-caught in the pristine, nutrient-rich waters of northern Japan.',
        link: '#'
      }
    ]
  },
  {
    id: '3',
    name: 'Pan-Roasted Duck Breast',
    description: 'Spiced honey glaze, cherry reduction, and parsnip mash.',
    price: 38,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1621213143723-29382b976f79?auto=format&fit=crop&w=800&q=80',
    sourcing: [
      {
        ingredient: 'Long Island Duck',
        location: 'Crescent Farms, NY',
        story: 'Free-roaming birds raised with no antibiotics, delivering rich, tender meat.',
        link: 'https://www.crescentduck.com'
      }
    ]
  },
  {
    id: '4',
    name: 'Truffle Mushroom Risotto',
    description: 'Arborio rice, wild forest mushrooms, and fresh black truffle.',
    price: 32,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    dietary: ['Vegetarian', 'Gluten-Free'],
    sourcing: [
      {
        ingredient: 'Acquerello Rice',
        location: 'Vercelli, Italy',
        story: 'Aged for one year to achieve the perfect texture and absorption.',
        link: 'https://www.acquerello.it'
      }
    ]
  },
  {
    id: '5',
    name: 'Miso-Glazed Black Cod',
    description: 'Sweet miso marinade, bok choy, and ginger-infused jasmine rice.',
    price: 42,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    sourcing: [
      {
        ingredient: 'Black Cod',
        location: 'Sablefish Haida Gwaii, BC',
        story: 'Sustainably hook-and-line caught in the cold Pacific currents.',
        link: '#'
      }
    ]
  },
  {
    id: '6',
    name: 'Valrhona Chocolate Fondant',
    description: 'Warm molten center, Madagascan vanilla bean gelato.',
    price: 16,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
    dietary: ['Vegetarian'],
    sourcing: [
      {
        ingredient: 'Valrhona Cocoa',
        location: 'Tain-l\'Hermitage, France',
        story: 'B-Corp certified chocolate representing the pinnacle of cocoa ethics and quality.',
        link: 'https://www.valrhona.com'
      }
    ]
  },
  {
    id: '7',
    name: 'Artisan Cheese Selection',
    description: 'Chef\'s selection of local and imported cheeses with fig jam.',
    price: 18,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80',
    sourcing: [
      {
        ingredient: 'Artisan Cheeses',
        location: 'Various Regions',
        story: 'A rotating selection from small-batch creameries across the globe.',
        link: '#'
      }
    ]
  },
  {
    id: '8',
    name: 'Signature Smoked Old Fashioned',
    description: 'Bourbon, maple, walnut bitters, smoked with cherry wood.',
    price: 18,
    category: 'Beverage',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    sourcing: [
      {
        ingredient: 'Small Batch Bourbon',
        location: 'Kentucky, USA',
        story: 'Triple-distilled and aged in charred American oak barrels.',
        link: '#'
      }
    ]
  }
];
