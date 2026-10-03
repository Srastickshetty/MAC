// ---------------------------------------------------------------------------
// Mac Brew Farm: content you can edit without touching any other file.
// Menu text and prices were transcribed from the client's menu images.
// Items marked CHECK are things to confirm with the client (see NOTES-FOR-CLIENT.md).
// ---------------------------------------------------------------------------

export const site = {
  name: 'Mac Brew Farm',
  city: 'Bengaluru',
  tagline: 'Good food. Great pours. Even better vibes.',
  mapsUrl: 'https://maps.app.goo.gl/RtQ9ZF1NsLNxJRQh9?g_st=ic',
  // Fill these in and they appear in the "Find us" section automatically.
  // Leave a field as '' to hide it.
  address: '', // e.g. 'Street, Area, Bengaluru 560xxx'
  hours: '', // e.g. 'Daily, 12 noon to 11:30 pm'
  phone: '', // e.g. '+91 98xxxxxxx'
  whatsapp: '', // digits only with country code, e.g. '9198xxxxxxxx'
  instagram: '', // full URL, e.g. 'https://instagram.com/yourhandle'
  email: '',
};

// ---------------------------------------------------------------------------
// Signature cocktails. `color` and `foam` drive the 3D glass; `garnish` is the
// colour of the citrus wheel on the rim. `img` is optional (a real photo).
// ---------------------------------------------------------------------------
export const cocktails = [
  {
    id: 'pom-rita', name: 'Pom Rita', price: 595,
    desc: 'Tequila, Triple Sec, Agave Syrup, Lime Juice, Pomegranate Juice',
    color: '#D6284F', foam: 0.35, garnish: '#F2A72B', img: 'media/img/pomrita.webp',
  },
  {
    id: 'smokin-pumpkin', name: 'Smokin Pumpkin', price: 595,
    desc: 'Whiskey, Lime Juice, Homemade Pumpkin Puree',
    color: '#D9822B', foam: 0, garnish: '#E8861D',
  },
  {
    id: 'ruby-creeper', name: 'Ruby Creeper', price: 495,
    desc: 'Gin, Lime Juice, Simple Syrup, Raspberry Sorbet, Champagne',
    color: '#B01040', foam: 0.12, garnish: '#C0143C',
  },
  {
    id: 'down-drift-dreams', name: 'Down Drift Dreams', price: 595,
    desc: 'Rum, Vanilla & Caramel Syrup, Vanilla Ice Cream, Espresso',
    color: '#7A4A30', foam: 0.55, garnish: '#E9D3B0',
  },
  {
    id: 'mac-brew-splash', name: 'Mac Brew Splash', price: 595,
    desc: 'Tequila, Lime Juice, Simple Syrup, Lychee Juice, White Wine',
    color: '#E6E2AE', foam: 0, garnish: '#F3EFE0', img: 'media/img/lychee-cocktail.webp',
  },
  {
    id: 'oreo-lady', name: 'Oreo Lady', price: 495,
    desc: 'Vodka, Kahlua, Espresso, Vanilla Syrup, Oreo Ice Cream',
    color: '#5A3A2A', foam: 0.6, garnish: '#2C1D18', img: 'media/img/oreo-lady.webp',
  },
  {
    id: 'basil-spritz', name: 'Basil Spritz', price: 495,
    desc: 'Gin, Soda, Basil Espuma Foam',
    color: '#A7D17F', foam: 0.8, garnish: '#5C9A3C',
  },
  {
    id: 'honey-mango-katli', name: 'Honey Mango Katli', price: 595,
    desc: 'Vodka (Kaju Katli Infuse), Fresh Mango, Curd, Salt, Honey',
    color: '#F4B53F', foam: 0.2, garnish: '#F6B93B', img: 'media/img/mango-drink.webp',
  },
  {
    id: 'herbal-rose', name: 'The Herbal Rose', price: 595,
    desc: 'Gin, Campari, Sweet Vermouth, Rose Syrup, Rosemary, Egg',
    color: '#C73C7C', foam: 0.7, garnish: '#E8A0C0', img: 'media/img/herbal-rose.webp',
  },
  {
    id: 'rum-biryani', name: 'Rum Biryani', price: 595,
    desc: 'Infused Rum, Simple Syrup, Coconut Water',
    color: '#D9B56F', foam: 0, garnish: '#9CC34A',
  },
  {
    id: 'system-hack', name: 'System Hack', price: 695,
    desc: 'Vodka, Gin, Tequila, Rum, Triple Sec, Lime Juice, In House Beer',
    color: '#C8701E', foam: 0.15, garnish: '#9CC34A',
  },
];

// ---------------------------------------------------------------------------
// Menu tabs. Theme colours follow the printed menu pages (green, maroon, tan).
// ---------------------------------------------------------------------------
const saladPrices = [295, 355, 475]; // Veg, Chicken, Prawns (same for every salad)
const salad = (name, desc) => ({ name, desc, prices: saladPrices });

export const menu = [
  {
    id: 'cocktails',
    label: 'Cocktails',
    title: 'Signature cocktails',
    theme: { band: '#3B1A1D', ink: '#6E3441', badge: '#3B1A1D' },
    items: cocktails.map((c) => ({ name: c.name, desc: c.desc + '.', price: c.price, img: c.img })),
  },
  {
    id: 'salads',
    label: 'Salads',
    title: 'Salads from all over the globe',
    theme: { band: '#1B3A2D', ink: '#2F5A47', badge: '#1B3A2D' },
    columns: ['Veg', 'Chicken', 'Prawns'],
    items: [
      salad('Melon Aguachili', 'Avocado, Tomato, Palm Hearts, Queso Fresco & Tomato Water Chilled Broth'),
      salad('Grape Ceviche', 'Green Grapes, Cilantro, Shallots, Pepper & Orange'), // CHECK: printed as "Green Graves"
      salad('Mexican Salad Bowl', 'Layered Guacamole, Sour Cream, Refried Beans, Tomato Salsa'),
      salad('Crispy Potato Chips Salad', 'Crispy Potato Sliver, Scallion, Tomato, Onions, Peppers, Pickles and Molasses'),
      salad('Classic Som Tam', 'Vegetarian Thai Raw Mango Salad'),
      salad('Buddha Fruit Salad', 'Petit Fruits, Nuts, Labneh and Roasted Nuts'),
      salad('Tahini Miso Green', 'Wok Stewed Tossed Miso Greens: Pakchoy, Broccoli, Scallion and Chestnuts'),
      salad('Tropical Fruit Caesar', 'Fruits, Grilled Vegetables, Crisp Iceberg, Romaine Lettuce, Crostini Croutons, Caesar Dressing'), // CHECK: printed as "Topical"
      salad('Green Salad', 'Cucumber, Tomato, Beetroot, Carrot, Radish, Green Chilli & Lemon'),
      salad('Tropical Fruit Caesar Chicken', 'Crisp Iceberg, Romaine Lettuce, Crostini Croutons, Caesar Dressing'),
    ],
  },
  {
    id: 'mains',
    label: 'Mains',
    title: 'Main course',
    theme: { band: '#2F4A33', ink: '#4A5B3A', badge: '#2F4A33' },
    note: '', // CHECK: no prices were given for mains. Add `price: 000` to any item below to show it.
    groups: [
      {
        label: 'Pasta',
        items: [{ name: 'Arrabbiata Pasta' }, { name: 'Alfredo' }, { name: 'Aglio e Olio' }],
      },
      {
        label: 'Curries and breads',
        items: [
          { name: 'Dal Pappu' },
          { name: 'Paneer Makhni' },
          { name: 'Chicken Patiyala' },
          { name: 'Roti, Naan, Kulcha' },
        ],
      },
      {
        label: 'Burmese',
        items: [{ name: 'Burmese Khausuey', desc: 'Veg or non-veg', img: 'media/img/khao-soi.webp' }], // CHECK spelling
      },
      {
        label: 'Rice and biryani',
        items: [
          { name: 'Veg Biryani' },
          { name: 'Chicken Biryani' },
          { name: 'Mutton Biryani' },
          { name: 'Peas Pulao' },
          { name: 'Steam Basmati Rice' },
          { name: 'Thai Basil Fried Rice' },
          { name: 'Jeera Rice' },
        ],
      },
      {
        label: 'Noodles',
        items: [{ name: 'Hakka Noodles' }, { name: 'Szechuan Noodles' }],
      },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts',
    title: 'Dessert',
    theme: { band: '#C49A6C', ink: '#A97F55', badge: '#86654A' },
    items: [
      { name: 'Pistachio Burnt Cheese Cake', desc: 'Classic Burnt Cheese Baked', price: 395 },
      { name: 'Banana Halwa Parcel & Nuts Malai', desc: 'Malenadu Halwa Filo Parcels Nuts Rabri', price: 395 },
      { name: 'Pears Bondi Rabdi', desc: 'Almond Flakes Saffron Rabri and Pearls Boondi', price: 395 },
      { name: 'Nuts Kunafa & Malai Cream', desc: '', price: 395 }, // CHECK: the printed description was copied from a cocktail
      { name: 'White Chocolate Lava', desc: 'White Chocolate Burst Topped with Cheese Cream and Ice Cream', price: 395 }, // CHECK: printed as "Bust"
      { name: 'Chocolate Forest', desc: 'Chocolate Gateau, Cherry, Chocolate Soil, Vanilla Ice Cream', price: 395 },
      { name: 'Salted Caramel Gooey Brownie', desc: 'Sticky Hot Brownie, Ice Cream and Salted Caramel Sauce', price: 395 },
      { name: 'Coconut Cream Brulee', desc: 'Charred Coconut, Slow Cooked Burnt Coconut Cream', price: 395 },
      { name: 'Russian Cheese Cake', desc: 'Cheese Baked with Crunchy Soil Layered', price: 395 },
      { name: 'Milk Malai Burrata Gateau', desc: 'Saffron Rabri Milk, Milk Burrata & Bean Ice Cream', price: 395 },
      { name: 'Textures of Mousse', desc: 'Pistachio, Chocolate and Biscoff Mousse, Gratin Banana, Strawberry Sponge and Soil', price: 395 },
    ],
  },
];
