import type { Category, DemoState, Product, Sale, Supplier } from '../types';

const p = (id:string, code:string, name:string, category:Category, price:number, stock:number, minimumStock:number, supplierId:string, description:string):Product =>
  ({id,code,name,category,price,stock,minimumStock,supplierId,description});

export const suppliers:Supplier[] = [
  {id:'s1',name:'Distribuidora Escolar SRL',phone:'+54 3493 45-2187',email:'pedidos@escolar.com.ar',address:'Av. Independencia 743, Sunchales',lastRestock:'2026-08-28'},
  {id:'s2',name:'Papelera Centro',phone:'+54 3493 42-7740',email:'ventas@papeleracentro.com.ar',address:'San Martín 1240, Rafaela',lastRestock:'2026-08-30'},
  {id:'s3',name:'Distribuidora Norte',phone:'+54 3493 48-1092',email:'contacto@distrinorte.com.ar',address:'Mitre 386, Sunchales',lastRestock:'2026-08-24'},
  {id:'s4',name:'Artística del Litoral',phone:'+54 342 455-8814',email:'pedidos@artlitoral.com.ar',address:'Bv. Gálvez 2105, Santa Fe',lastRestock:'2026-08-21'},
  {id:'s5',name:'Ediciones Regionales',phone:'+54 3492 50-3310',email:'distribucion@edicionesregionales.com',address:'Belgrano 455, Rafaela',lastRestock:'2026-08-19'},
];

export const products:Product[] = [
  p('p1','CUA-001','Cuaderno Éxito A4 rayado','Cuadernos',8450,6,5,'s1','Cuaderno tapa dura, 96 hojas rayadas. Preparado para demostrar el flujo 6 → 4 → 14.'),
  p('p2','CUA-002','Cuaderno Rivadavia ABC','Cuadernos',6250,18,6,'s1','Cuaderno escolar tapa flexible de 48 hojas.'),
  p('p3','PAP-014','Resma Ledesma A4 75g','Papelería',9850,24,10,'s2','Resma de 500 hojas blancas tamaño A4.'),
  p('p4','ESC-011','Lapicera Bic Cristal Azul','Escritura',980,42,12,'s3','Bolígrafo trazo medio, tinta azul.'),
  p('p5','ESC-012','Lapicera Bic Cristal Negra','Escritura',980,36,12,'s3','Bolígrafo trazo medio, tinta negra.'),
  p('p6','ESC-021','Resaltador Stabilo Boss Amarillo','Escritura',2450,1,5,'s3','Resaltador amarillo fluorescente.'),
  p('p7','ESC-025','Marcador Sharpie Negro','Escritura',3100,11,4,'s3','Marcador permanente punta fina.'),
  p('p8','ESC-031','Lapicera Parker Jotter Azul','Escritura',28400,0,3,'s3','Lapicera metálica con repuesto azul.'),
  p('p9','ESC-041','Lápiz Faber-Castell HB','Escritura',750,48,15,'s1','Lápiz de grafito HB.'),
  p('p10','ESC-042','Goma Faber-Castell blanca','Escritura',820,4,5,'s1','Goma blanca libre de PVC.'),
  p('p11','REP-003','Repuesto Rivadavia Nº3','Cuadernos',4780,21,8,'s1','Repuesto rayado de 96 hojas.'),
  p('p12','PAP-021','Carpeta A4 con elástico','Papelería',3900,15,5,'s2','Carpeta plástica color surtido.'),
  p('p13','ESC-055','Corrector líquido Filgo','Escritura',1650,7,4,'s3','Corrector de secado rápido.'),
  p('p14','ESC-061','Adhesivo Voligoma 30 ml','Escolar',1450,13,5,'s1','Adhesivo escolar no tóxico.'),
  p('p15','OFI-010','Agenda 2026 semanal','Oficina',12900,9,3,'s2','Agenda semanal con tapa rígida.'),
  p('p16','ART-001','Témpera Alba azul 200 ml','Arte',3950,8,3,'s4','Témpera escolar lavable.'),
  p('p17','ART-002','Témpera Alba roja 200 ml','Arte',3950,3,3,'s4','Témpera escolar lavable.'),
  p('p18','PAP-032','Cartulina color surtido','Papelería',950,55,15,'s2','Cartulina 50 × 65 cm.'),
  p('p19','ART-010','Papel glacé pack x10','Arte',1800,19,6,'s4','Pack de colores surtidos.'),
  p('p20','ESC-072','Fibrones Filgo pack x10','Escolar',7250,12,4,'s1','Fibras de colores lavables.'),
  p('p21','ESC-081','Regla Pizzini 30 cm','Escolar',1400,16,5,'s1','Regla acrílica transparente.'),
  p('p22','ESC-084','Tijera escolar Maped','Escolar',3650,4,4,'s1','Tijera escolar punta redonda.'),
  p('p23','OFI-022','Abrochadora Kangaro Nº10','Oficina',7890,7,3,'s2','Abrochadora metálica compacta.'),
  p('p24','OFI-023','Broches Nº10 caja x1000','Oficina',1750,20,6,'s2','Broches galvanizados.'),
  p('p25','PAP-041','Notas adhesivas 76×76','Oficina',2980,14,5,'s2','Block autoadhesivo amarillo.'),
  p('p26','LIB-001','El Principito — edición escolar','Libros',11900,10,3,'s5','Edición escolar ilustrada.'),
  p('p27','LIB-008','Martín Fierro — escolar','Libros',10500,6,3,'s5','Edición anotada para secundaria.'),
  p('p28','ART-021','Lápices Faber-Castell x12','Arte',7450,9,4,'s4','Lápices de colores hexagonales.'),
  p('p29','PAP-052','Block Canson A4 180g','Arte',8900,5,3,'s4','Block de 20 hojas para dibujo.'),
  p('p30','OFI-031','Calculadora Casio básica','Oficina',14800,3,2,'s3','Calculadora de escritorio 12 dígitos.'),
  p('p31','PAP-060','Sobre papel madera A4','Papelería',520,40,10,'s2','Sobre resistente para documentación.'),
  p('p32','ESC-090','Compás Maped Study','Escolar',6250,2,3,'s1','Compás escolar con mina de repuesto.'),
];

const popular = ['p1','p3','p4','p6','p11','p2','p9','p14'];
const methods = ['Efectivo','Transferencia','Tarjeta'] as const;
const priceOf = (id:string) => products.find(x=>x.id===id)!.price;
export const sales:Sale[] = Array.from({length:40},(_,i)=>{
  const d = new Date('2026-09-02T16:30:00');
  d.setDate(d.getDate() - Math.floor(i/5));
  d.setHours(9+(i%8), (i*7)%60);
  const productId=popular[i%popular.length];
  const quantity=(i%3)+1;
  const second=popular[(i+3)%popular.length];
  const items = i%4===0
    ? [{productId,name:products.find(x=>x.id===productId)!.name,quantity,price:priceOf(productId)},{productId:second,name:products.find(x=>x.id===second)!.name,quantity:1,price:priceOf(second)}]
    : [{productId,name:products.find(x=>x.id===productId)!.name,quantity,price:priceOf(productId)}];
  return {id:`V-${1047-i}`,date:d.toISOString(),items,paymentMethod:methods[i%3],total:items.reduce((a,x)=>a+x.quantity*x.price,0),status:'Completada'};
});

const now='2026-09-02T16:40:00.000Z';
export const initialState:DemoState = {
  products,
  suppliers,
  sales,
  movements:[
    {id:'m1',productId:'p1',quantity:12,type:'Ingreso',date:'2026-08-28T13:00:00.000Z',reference:'Ingreso de mercadería'},
    {id:'m2',productId:'p1',quantity:-2,type:'Venta',date:'2026-09-02T13:20:00.000Z',reference:'Venta #V-1044'},
    {id:'m3',productId:'p1',quantity:-1,type:'Venta',date:'2026-09-02T15:10:00.000Z',reference:'Venta #V-1047'},
    {id:'m4',productId:'p2',quantity:8,type:'Ingreso',date:'2026-08-30T14:00:00.000Z',reference:'Ingreso de mercadería'},
    {id:'m5',productId:'p6',quantity:-2,type:'Venta',date:'2026-09-02T14:15:00.000Z',reference:'Venta #V-1045'},
  ],
  notifications:[
    {id:'n1',productId:'p6',title:'Stock bajo',message:'Queda 1 unidad. El mínimo configurado es 5.',read:false,createdAt:now},
    {id:'n2',productId:'p8',title:'Sin stock',message:'No quedan unidades disponibles.',read:false,createdAt:'2026-09-02T15:00:00.000Z'},
    {id:'n3',productId:'p10',title:'Stock bajo',message:'Quedan 4 unidades. El mínimo configurado es 5.',read:true,createdAt:'2026-09-02T14:00:00.000Z'},
    {id:'n4',productId:'p32',title:'Stock bajo',message:'Quedan 2 unidades. El mínimo configurado es 3.',read:false,createdAt:'2026-09-02T13:00:00.000Z'},
  ],
  activity:[
    {id:'a1',text:'Venta #V-1047 registrada.',createdAt:'2026-09-02T16:35:00.000Z',type:'sale'},
    {id:'a2',text:'Stock de Cuaderno Éxito actualizado.',createdAt:'2026-09-02T16:22:00.000Z',type:'stock'},
    {id:'a3',text:'Producto “Agenda 2026” agregado.',createdAt:'2026-09-02T15:48:00.000Z',type:'product'},
    {id:'a4',text:'Alerta de stock bajo generada.',createdAt:'2026-09-02T15:05:00.000Z',type:'alert'},
  ],
  settings:{storeName:'Librería CLIP',owner:'Iliana Zanuzzi',location:'Sunchales, Santa Fe',lowStockAlerts:true},
};
