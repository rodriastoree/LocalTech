export type Category = 'Libros'|'Cuadernos'|'Escritura'|'Papelería'|'Arte'|'Escolar'|'Oficina';
export type StockStatus = 'Disponible'|'Stock bajo'|'Sin stock';
export type PaymentMethod = 'Efectivo'|'Transferencia'|'Tarjeta';

export interface Product {
  id:string; code:string; name:string; category:Category; price:number; stock:number;
  minimumStock:number; supplierId:string; description:string; status?:StockStatus;
}
export interface SaleItem { productId:string; name:string; quantity:number; price:number; }
export interface Sale { id:string; date:string; items:SaleItem[]; paymentMethod:PaymentMethod; total:number; status:'Completada'; }
export interface Supplier { id:string; name:string; phone:string; email:string; address:string; lastRestock:string; }
export interface Movement { id:string; productId:string; quantity:number; type:'Venta'|'Ingreso'|'Ajuste'; date:string; reference:string; }
export interface Notification { id:string; productId:string; title:string; message:string; read:boolean; createdAt:string; }
export interface Activity { id:string; text:string; createdAt:string; type:'sale'|'stock'|'product'|'alert'; }
export interface Settings { storeName:string; owner:string; location:string; lowStockAlerts:boolean; }
export interface DemoState { products:Product[]; sales:Sale[]; suppliers:Supplier[]; movements:Movement[]; notifications:Notification[]; activity:Activity[]; settings:Settings; }
