export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  salePrice: number;
  categories: string[];
  stock: number;
  isFlashSale: boolean;
  flashSalePrice?: number;
  discountRate?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  status: 'Pending' | 'Shipped' | 'Delivered';
  paymentMethod: 'COD' | 'bKash' | 'Nagad';
  paymentNumber?: string; // for bKash/Nagad transactions
  transactionId?: string;
  totalAmount: number;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isSystem?: boolean; // system pages like contact or about shouldn't be deleted easily
}

export interface Slider {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export interface HeaderLink {
  id: string;
  text: string;
  url: string;
}

export interface FooterLink {
  id: string;
  text: string;
  url: string;
}

export interface AppSettings {
  companyName: string;
  logoUrl: string; // can be data-url or unsplash image
  logoText: string;
  contactPhone: string;
  contactEmail: string;
  bkashNumber: string;
  nagadNumber: string;
  categories: string[];
  headerLinks: HeaderLink[];
  footerLinks: FooterLink[];
  sliders: Slider[];
  banners: Banner[];
}
