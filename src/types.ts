export interface Product {
  id: string;
  name: string;
  category: 'gourmet' | 'goods' | 'experience';
  categoryLabel: string;
  description: string;
  image: string;
  code: string;
}

export interface CatalogSubmission {
  id: string;
  formType: 'simple' | 'step' | 'interactive';
  formTypeLabel: string;
  catalogNumber: string;
  productCode: string;
  productName: string;
  recipientName: string;
  recipientKana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  notes?: string;
  status: 'pending' | 'processing' | 'shipped';
  createdAt: string;
}
