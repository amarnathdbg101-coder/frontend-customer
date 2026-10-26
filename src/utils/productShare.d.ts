import { Product } from '../types';

export interface ProductShareOptions {
  product?: Product | any;
  shopName?: string;
  shopSlug?: string;
  isHindi?: boolean;
  origin?: string;
}

export declare function getProductShareUrl(options?: ProductShareOptions): string;
export declare function formatProductShareText(options?: ProductShareOptions): string;
export declare function getWhatsAppShareUrl(options?: ProductShareOptions): string;
export declare function shareProduct(options?: ProductShareOptions): Promise<{
  success: boolean;
  method: string;
  url: string;
}>;
