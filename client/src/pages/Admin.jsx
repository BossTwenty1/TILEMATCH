import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';
import { formatPHP, ORDER_STATUSES } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, BarChart3, Plus, Edit, Trash2, Download, AlertTriangle, X, ChevronDown, Search } from 'lucide-react';
import './Admin.css';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'inventory', label: 'Inventory', icon: Warehouse },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 }
];
const COLORS = ['#2D5016','#C9A84C','#0f52ba','#c4713b','#1a5276'];

export default function Admin() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({ items: [], lowStockAlertCount: 0 });
  const [orders, setOrders] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [invFilter, setInvFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [form, setForm] = useState({
    name:'',description:'',category:'Ceramic',material:'',color:'',size:'30x30',
    roomApplication:'Floor',price:'',stock:'',imageUrl:'',isActive:true
  });

  useEffect(() => {
    if (tab === 'dashboard') adminAPI.dashboard().then(({data}) => setStats(data)).catch(()=>{});
    if (tab === 'products') adminAPI.getProducts(searchQ).then(({data}) => setProducts(data)).catch(()=>{});
    if (tab === 'inventory') adminAPI.getInventory(invFilter).then(({data}) => setInventory(data)).catch(()=>{});
    if (tab === 'orders') adminAPI.getOrders({search:orderSearch,status:orderStatusFilter}).then(({data}) => setOrders(data)).catch(()=>{});
    if (tab === 'analytics') {
      adminAPI.monthlyRevenue().then(({data}) => setMonthly(data)).catch(()=>{});
      adminAPI.categoryRevenue().then(({data}) => setCategories(data)).catch(()=>{});
      adminAPI.bestsellers().then(({data}) => setBestsellers(data)).catch(()=>{});
    }
  }, [tab, searchQ, invFilter, orderSearch, orderStatusFilter]);

  if (!isAdmin) return <div className="page container"><div className="empty-state"><h2>Access Denied</h2><p>Admin privileges required.</p></div></div>;

  const handleSaveProduct = async () => {
    try {
      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, form);
        addToast('Product updated');
      } else {
        await adminAPI.addProduct(form);
        addToast('Product added');
      }
      setShowModal(false); setEditProduct(null);
      adminAPI.getProducts('').then(({data}) => setProducts(data));
    } catch(err) { addToast(err.response?.data?.error || 'Error','error'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(p => ({ ...p, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await adminAPI.deleteProduct(id); addToast('Product deleted'); setProducts(p => p.filter(x => x.id !== id)); }
    catch { addToast('Error deleting','error'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await adminAPI.updateOrderStatus(orderId, status);
      addToast(`Status updated to ${status}. ${data.emailSent ? 'Email sent!' : ''}`);
      setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
    } catch { addToast('Error updating status','error'); }
  };

  const handleStockUpdate = async (productId, qty) => {
    try { await adminAPI.updateStock(productId, qty); addToast('Stock updated');
      adminAPI.getInventory(invFilter).then(({data}) => setInventory(data));
    } catch { addToast('Error','error'); }
  };

  const handleCSVExport = async () => {
    try {
      const { data } = await adminAPI.exportCSV();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url; a.download = 'tilematch_orders.csv'; a.click();
      URL.revokeObjectURL(url);
      addToast('CSV exported');
    } catch { addToast('Export error','error'); }
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setForm({ name:p.name, description:p.description, category:p.category, material:p.material,
      color:p.color, size:p.size, roomApplication:p.room_application, price:p.price,
      stock:p.stock_qty||0, imageUrl:p.image_url, isActive:p.is_active });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditProduct(null);
    setForm({name:'',description:'',category:'Ceramic',material:'',color:'',size:'30x30',roomApplication:'Floor',price:'',stock:'',imageUrl:'',isActive:true});
    setShowModal(true);
  };

  const toggleOrderExpand = async (orderId) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    setExpandedOrder(orderId);
    try { const {data} = await adminAPI.getOrderDetail(orderId); setOrderDetail(data); }
    catch { setOrderDetail(null); }
  };

  return (
    <div className="admin-page page">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && stats && (
          <div>
            <div className="stats-grid">
              <div className="stat-card card card-body"><span className="stat-label">Total Revenue</span><span className="stat-value">{formatPHP(stats.stats.totalRevenue)}</span></div>
              <div className="stat-card card card-body"><span className="stat-label">Total Orders</span><span className="stat-value">{stats.stats.totalOrders}</span></div>
              <div className="stat-card card card-body"><span className="stat-label">Customers</span><span className="stat-value">{stats.stats.totalCustomers}</span></div>
              <div className="stat-card card card-body"><span className="stat-label">Low Stock Items</span><span className="stat-value warning">{stats.stats.lowStockItems}</span></div>
            </div>
            <div className="card card-body" style={{marginTop:24}}>
              <h3>Recent Orders</h3>
              <div className="table-wrapper"><table><thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
                {(stats.recentOrders||[]).map(o => (
                  <tr key={o.order_number}><td><strong>{o.order_number}</strong></td><td>{o.customer_name}</td><td>{formatPHP(o.total)}</td>
                  <td><span className={`badge badge-${o.status==='Delivered'?'success':o.status==='Shipped'?'info':o.status==='Processing'?'warning':'primary'}`}>{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td></tr>
                ))}
              </tbody></table></div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search"><Search size={16} /><input placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={openAddModal}><Plus size={16} /> Add Product</button>
            </div>
            <div className="table-wrapper"><table><thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {products.map(p => (
                <tr key={p.id}><td><img src={p.image_url} style={{width:40,height:40,objectFit:'cover',borderRadius:4}} /></td>
                <td><strong>{p.name}</strong></td><td>{p.category}</td><td>{formatPHP(p.price)}</td>
                <td>{p.stock_qty ?? '—'}</td><td><span className={`badge ${p.is_active?'badge-success':'badge-error'}`}>{p.is_active?'Active':'Inactive'}</span></td>
                <td><div className="flex gap-sm"><button className="btn btn-ghost btn-sm" onClick={()=>openEditModal(p)}><Edit size={14}/></button><button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(p.id)}><Trash2 size={14}/></button></div></td></tr>
              ))}
            </tbody></table></div>
          </div>
        )}

        {/* INVENTORY */}
        {tab === 'inventory' && (
          <div>
            {inventory.lowStockAlertCount > 0 && (
              <div className="low-stock-banner"><AlertTriangle size={18} /> {inventory.lowStockAlertCount} products have low stock!</div>
            )}
            <div className="admin-toolbar">
              <div className="flex gap-sm">
                <button className={`btn btn-sm ${invFilter===''?'btn-primary':'btn-secondary'}`} onClick={()=>setInvFilter('')}>All</button>
                <button className={`btn btn-sm ${invFilter==='low'?'btn-primary':'btn-secondary'}`} onClick={()=>setInvFilter('low')}>Low Stock</button>
                <button className={`btn btn-sm ${invFilter==='out'?'btn-primary':'btn-secondary'}`} onClick={()=>setInvFilter('out')}>Out of Stock</button>
              </div>
            </div>
            <div className="table-wrapper"><table><thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {(inventory.items||[]).map(p => {
                const badge = p.stock_qty===0?'badge-error':p.stock_qty<p.low_stock_threshold?'badge-warning':'badge-success';
                return (
                  <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category}</td>
                  <td><input type="number" className="input" style={{width:80}} defaultValue={p.stock_qty}
                    onBlur={e => { const v = parseInt(e.target.value); if(!isNaN(v) && v !== p.stock_qty) handleStockUpdate(p.id, v); }} /></td>
                  <td><span className={`badge ${badge}`}>{p.stock_status}</span></td>
                  <td>{new Date(p.last_updated).toLocaleDateString()}</td></tr>
                );
              })}
            </tbody></table></div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search"><Search size={16} /><input placeholder="Search order # or customer..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} /></div>
              <select className="input" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={{width:160}}>
                <option value="">All Statuses</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="table-wrapper"><table><thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment Ref</th><th>Status</th><th></th></tr></thead><tbody>
              {orders.map(o => (
                <>
                  <tr key={o.id} className="clickable" onClick={()=>toggleOrderExpand(o.id)}>
                    <td><strong>{o.order_number}</strong></td><td>{o.customer_name}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td><td>{formatPHP(o.total)}</td>
                    <td><code>{o.payment_ref}</code></td>
                    <td><select className="input" value={o.status} onClick={e=>e.stopPropagation()} onChange={e => handleStatusChange(o.id, e.target.value)} style={{width:130}}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></td>
                    <td><ChevronDown size={16} style={{transform:expandedOrder===o.id?'rotate(180deg)':'none',transition:'0.2s'}} /></td>
                  </tr>
                  {expandedOrder === o.id && orderDetail && (
                    <tr key={`${o.id}-detail`}><td colSpan={7} className="order-expand">
                      <div className="order-expand-inner">
                        <div><h4>Items</h4>{(orderDetail.items||[]).map((item,i) => (
                          <div key={i} className="checkout-item"><span>{item.product_name} × {item.quantity}</span><span>{formatPHP(item.line_total)}</span></div>
                        ))}</div>
                        <div><h4>Shipping</h4><p>{orderDetail.ship_street}, {orderDetail.ship_barangay}<br/>{orderDetail.ship_city}, {orderDetail.ship_municipality} {orderDetail.ship_postal_code}</p></div>
                      </div>
                    </td></tr>
                  )}
                </>
              ))}
            </tbody></table></div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div>
            <div className="admin-toolbar" style={{justifyContent:'flex-end'}}>
              <button className="btn btn-primary" onClick={handleCSVExport}><Download size={16} /> Export CSV</button>
            </div>
            <div className="analytics-grid">
              <div className="card card-body">
                <h3>Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly}><XAxis dataKey="monthName" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} />
                    <Tooltip formatter={v => formatPHP(v)} /><Bar dataKey="revenue" fill="#2D5016" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card card-body">
                <h3>Sales by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                    {categories.map((_,i)=> <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip formatter={v=>formatPHP(v)} /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card card-body" style={{marginTop:24}}>
              <h3>Top 10 Best-Selling Products</h3>
              <div className="table-wrapper"><table><thead><tr><th>#</th><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr></thead><tbody>
                {bestsellers.map((p,i) => (
                  <tr key={p.id}><td>{i+1}</td><td><strong>{p.name}</strong></td><td>{p.category}</td><td>{p.sold_count}</td><td>{formatPHP(p.totalRevenue)}</td></tr>
                ))}
              </tbody></table></div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="input-group"><label>Name *</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
                <div className="input-group"><label>Category *</label><select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {['Ceramic','Porcelain','Glass','Natural Stone','Decorative'].map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="input-group"><label>Material *</label><input className="input" value={form.material} onChange={e=>setForm(p=>({...p,material:e.target.value}))} /></div>
                <div className="input-group"><label>Color *</label><input className="input" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} /></div>
                <div className="input-group"><label>Size *</label><select className="input" value={form.size} onChange={e=>setForm(p=>({...p,size:e.target.value}))}>
                  {['20x20','30x30','40x40','60x60','30x60'].map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="input-group"><label>Room</label><select className="input" value={form.roomApplication} onChange={e=>setForm(p=>({...p,roomApplication:e.target.value}))}>
                  {['Floor','Wall','Outdoor','Bathroom','Kitchen'].map(r=><option key={r}>{r}</option>)}</select></div>
                <div className="input-group"><label>Price (PHP) *</label><input className="input" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} /></div>
                <div className="input-group"><label>Stock *</label><input className="input" type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} /></div>
              </div>
              <div className="input-group" style={{marginTop:12}}><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
              <div className="input-group" style={{marginTop:12}}>
                <label>Product Image</label>
                <input className="input" type="file" accept="image/*" onChange={handleImageChange} />
                {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{marginTop:8, maxHeight:100, borderRadius:4, objectFit:'cover'}} />}
              </div>
              <label className="filter-checkbox" style={{marginTop:12}}><input type="checkbox" checked={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} /><span>Active</span></label>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProduct}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
