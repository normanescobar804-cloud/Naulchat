import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Sparkles, Building2, Star, ShieldCheck, 
  Cloud, Bot, Megaphone, ArrowRight, Store, ShoppingBag, 
  Clock, MapPin, Plus, Trash2, Edit3, MessageCircle, 
  Smartphone, Send, RefreshCw, AlertCircle, Award, CreditCard,
  HardDrive, Layers, Zap, Copy, CheckCircle2, Gift, Trophy, ArrowUpRight,
  Camera, Upload, Eye, RotateCw, FileText, Image as ImageIcon,
  Filter, Calendar, ExternalLink, Download, XCircle, AlertTriangle, Info
} from 'lucide-react';
import { User, UserPlanType, BusinessProfile, BusinessProduct, StorageBreakdown, SponsoredAd, DepositTransaction } from '../types';
import { MONETIZATION_PLANS, DEFAULT_BUSINESS_CATALOG, DEFAULT_STORAGE_QUOTA, INITIAL_SPONSORED_ADS } from '../data/monetizationData';
import { 
  apiGetStorageMetrics, 
  apiRunStorageCleanup, 
  StorageMetricsResponse,
  apiDepositPayment,
  apiGetMyDepositTransactions,
  apiAddPoints,
  apiRedeemPoints
} from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onOpenDirectChat?: (userId: string) => void;
  initialTab?: 'plans' | 'deposit' | 'points' | 'business' | 'ai' | 'ads' | 'verification' | 'storage';
  onOpenBackupRestore?: (tab?: 'export' | 'restore' | 'drive') => void;
}

export const BusinessAndPlansModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenDirectChat,
  onOpenBackupRestore,
  initialTab = 'plans'
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'deposit' | 'points' | 'business' | 'ai' | 'ads' | 'verification' | 'storage'>(initialTab);

  // Real-time Deposit & Points state
  const [depositMethod, setDepositMethod] = useState<'banpro_billetera' | 'lafise_cuenta'>('banpro_billetera');
  const [depositPlanId, setDepositPlanId] = useState<'premium_basic' | 'premium_pro' | 'business_starter'>('premium_basic');
  const [depositReference, setDepositReference] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [depositSuccessMessage, setDepositSuccessMessage] = useState<string | null>(null);
  const [depositErrorMessage, setDepositErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const [pointsSuccessMessage, setPointsSuccessMessage] = useState<string | null>(null);

  // Voucher Screenshot & Camera State for Bank Transfers
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [voucherNotes, setVoucherNotes] = useState<string>('');
  const [isVoucherCameraActive, setIsVoucherCameraActive] = useState<boolean>(false);
  const [voucherCameraFacing, setVoucherCameraFacing] = useState<'user' | 'environment'>('environment');
  const [voucherCameraError, setVoucherCameraError] = useState<string | null>(null);
  const [selectedVoucherForPreview, setSelectedVoucherForPreview] = useState<string | null>(null);

  const voucherVideoRef = useRef<HTMLVideoElement>(null);
  const voucherStreamRef = useRef<MediaStream | null>(null);
  const voucherFileInputRef = useRef<HTMLInputElement>(null);

  // Transfer History filter & refresh state
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [isRefreshingHistory, setIsRefreshingHistory] = useState<boolean>(false);
  const [historyRefreshFeedback, setHistoryRefreshFeedback] = useState<string | null>(null);

  // Business state
  const currentPlan = currentUser.plan || 'free';
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    if (currentUser.businessProfile) return currentUser.businessProfile;
    return {
      isBusiness: currentPlan === 'business',
      businessName: currentUser.name || 'Mi Negocio Nica',
      category: 'Comidería & Gastronomía',
      hours: 'Lunes a Sábado: 8:00 AM – 6:00 PM',
      department: 'Managua',
      address: 'De la rotonda El Güegüense 2c abajo, Managua',
      whatsapp: currentUser.phone || '+505 8888 9999',
      website: 'https://naulchat.ni',
      catalog: DEFAULT_BUSINESS_CATALOG,
      aiBotEnabled: true,
      aiBotWelcomeMessage: '¡Hola! Bienvenido a nuestro negocio en Naul Chat. ¿En qué podemos servirle hoy? Pregunte por nuestro menú y entregas.',
      aiBotPrompt: 'Eres el asistente virtual amable de un comercio nicaragüense. Responde precios en Córdobas (C$), horarios y formas de pago (LAFISE, BAC, Efectivo).',
      aiBotFaq: [
        { question: '¿Cuál es el horario de atención?', answer: 'Atendemos de Lunes a Sábado de 8:00 AM a 6:00 PM.' },
        { question: '¿Hacen envíos a domicilio?', answer: 'Sí, hacemos entregas rápidas en la ciudad y por CargoTrans / EnviaYa a departamentos.' },
        { question: '¿Qué formas de pago aceptan?', answer: 'Aceptamos transferencias LAFISE Bancentro, BAC Credomatic, Billetera Móvil Banpro y efectivo contra entrega.' }
      ]
    };
  });

  // Storage state
  const storageQuota: StorageBreakdown = currentUser.storageQuota || DEFAULT_STORAGE_QUOTA[currentPlan];
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [serverStorageMetrics, setServerStorageMetrics] = useState<StorageMetricsResponse | null>(null);

  useEffect(() => {
    if (activeTab === 'storage') {
      apiGetStorageMetrics().then(m => {
        if (m) setServerStorageMetrics(m);
      }).catch(() => {});
    }
  }, [activeTab]);

  const handleRunGarbageCollection = async () => {
    setIsCleaningStorage(true);
    setCleanupMessage(null);
    try {
      const res = await apiRunStorageCleanup(true);
      if (res && res.success) {
        setCleanupMessage(res.message || 'Limpieza inteligente de 8 GB completada exitosamente.');
        const updated = await apiGetStorageMetrics();
        if (updated) setServerStorageMetrics(updated);
      } else {
        setCleanupMessage('Limpieza completada. El almacenamiento se encuentra en estado óptimo.');
      }
    } catch {
      setCleanupMessage('Error al ejecutar la rutina de limpieza.');
    } finally {
      setIsCleaningStorage(false);
    }
  };

  // Plan activation feedback
  const [activatedSuccessMessage, setActivatedSuccessMessage] = useState<string | null>(null);

  // New product form in catalog
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(150);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Especial');

  // AI Interactive Simulator
  const [testUserMessage, setTestUserMessage] = useState('');
  const [simulatedChatHistory, setSimulatedChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: businessProfile.aiBotWelcomeMessage || '¡Hola! Bienvenido a nuestro perfil comercial. ¿En qué podemos atenderle hoy?',
      time: 'Ahora'
    }
  ]);

  // Verification request form state
  const [verificationType, setVerificationType] = useState<'cedula' | 'ruc' | 'business'>('cedula');
  const [verificationDocNumber, setVerificationDocNumber] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: 'free' | 'premium_basic' | 'premium_pro' | 'business_starter' | 'business_pro') => {
    let newPlan: UserPlanType = 'free';
    let newBadge: User['badgeType'] = undefined;
    let quota = DEFAULT_STORAGE_QUOTA.free;

    if (planId === 'premium_basic' || planId === 'premium_pro') {
      newPlan = 'premium';
      newBadge = 'star_premium';
      quota = DEFAULT_STORAGE_QUOTA.premium;
    } else if (planId === 'business_starter' || planId === 'business_pro') {
      newPlan = 'business';
      newBadge = 'business_verified';
      quota = DEFAULT_STORAGE_QUOTA.business;
    }

    const updatedUser: Partial<User> = {
      plan: newPlan,
      badgeType: newBadge,
      isVerified: newPlan !== 'free',
      storageQuota: quota,
      businessProfile: {
        ...businessProfile,
        isBusiness: newPlan === 'business'
      }
    };

    onUpdateUser(updatedUser);
    setActivatedSuccessMessage(`¡Plan actualizado con éxito a ${newPlan === 'free' ? 'Gratis' : newPlan === 'premium' ? 'Naul Premium ⭐' : 'Perfil Comercial 🏪'}!`);
    setTimeout(() => setActivatedSuccessMessage(null), 4000);
  };

  const handleSaveBusinessProfile = () => {
    const updatedUser: Partial<User> = {
      businessProfile: {
        ...businessProfile,
        isBusiness: true
      },
      plan: 'business',
      badgeType: 'business_verified',
      isVerified: true
    };
    onUpdateUser(updatedUser);
    setActivatedSuccessMessage('¡Perfil comercial guardado y sincronizado con éxito! 🏪✅');
    setTimeout(() => setActivatedSuccessMessage(null), 3500);
  };

  const handleAddProductToCatalog = () => {
    if (!newProductTitle.trim()) return;
    const newProd: BusinessProduct = {
      id: `prod-${Date.now()}`,
      title: newProductTitle.trim(),
      priceCordobas: Number(newProductPrice) || 100,
      description: newProductDesc.trim() || 'Producto disponible para compra y entrega inmediata.',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
      category: newProductCategory,
      inStock: true
    };
    const updatedCatalog = [newProd, ...businessProfile.catalog];
    const updatedProfile = { ...businessProfile, catalog: updatedCatalog };
    setBusinessProfile(updatedProfile);
    onUpdateUser({ businessProfile: updatedProfile });
    setNewProductTitle('');
    setNewProductDesc('');
    setShowAddProduct(false);
  };

  const handleRemoveProduct = (prodId: string) => {
    const updatedCatalog = businessProfile.catalog.filter(p => p.id !== prodId);
    const updatedProfile = { ...businessProfile, catalog: updatedCatalog };
    setBusinessProfile(updatedProfile);
    onUpdateUser({ businessProfile: updatedProfile });
  };

  const handleSimulateAiResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUserMessage.trim()) return;
    const userText = testUserMessage.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setSimulatedChatHistory(prev => [...prev, { sender: 'user', text: userText, time: now }]);
    setTestUserMessage('');

    // Generate intelligent business answer based on prompt and catalog
    setTimeout(() => {
      let botReply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('precio') || lower.includes('cuanto') || lower.includes('vale') || lower.includes('costo')) {
        const item = businessProfile.catalog[0];
        botReply = `¡Con gusto! Nuestro "${item?.title || 'producto'}" tiene un precio de C$${item?.priceCordobas || 180} Córdobas. ¿Desea que tomemos su orden para entrega?`;
      } else if (lower.includes('horario') || lower.includes('abierto') || lower.includes('hora')) {
        botReply = `Nuestro horario de atención es: ${businessProfile.hours}. ¡Estamos para servirle!`;
      } else if (lower.includes('donde') || lower.includes('ubicacion') || lower.includes('direccion')) {
        botReply = `Nos encontramos en: ${businessProfile.address}, departamento de ${businessProfile.department}, Nicaragua.`;
      } else if (lower.includes('envio') || lower.includes('delivery') || lower.includes('entrega')) {
        botReply = '¡Sí hacemos entregas a domicilio! En Managua y alrededores mediante mensajería directa, y a otros departamentos por CargoTrans o EnviaYa.';
      } else if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('transferencia')) {
        botReply = 'Aceptamos transferencias a cuentas LAFISE Bancentro, BAC Credomatic, Billetera Móvil Banpro y efectivo en Córdobas (C$) o Dólares.';
      } else {
        botReply = `¡Gracias por comunicarse con ${businessProfile.businessName}! Con gusto le atendemos de inmediato. ¿Desea consultar nuestro catálogo de productos o hacer un pedido?`;
      }

      setSimulatedChatHistory(prev => [
        ...prev, 
        { sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 600);
  };

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDocNumber.trim()) return;
    
    onUpdateUser({
      isVerified: true,
      verificationStatus: 'verified',
      badgeType: verificationType === 'business' || verificationType === 'ruc' ? 'business_verified' : 'citizen_verified'
    });
    setVerificationSuccess(true);
    setActivatedSuccessMessage('¡Solicitud aprobada! Insignia oficial asignada a tu perfil.');
    setTimeout(() => {
      setActivatedSuccessMessage(null);
    }, 4000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Voucher camera controls
  const startVoucherCamera = async () => {
    stopVoucherCamera();
    setVoucherCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: voucherCameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      voucherStreamRef.current = stream;
      setIsVoucherCameraActive(true);
      if (voucherVideoRef.current) {
        voucherVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Voucher camera access warning:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        voucherStreamRef.current = fallbackStream;
        setIsVoucherCameraActive(true);
        if (voucherVideoRef.current) {
          voucherVideoRef.current.srcObject = fallbackStream;
        }
      } catch (e: any) {
        setVoucherCameraError('No se pudo acceder a la cámara. Por favor verifica los permisos o sube la captura desde la galería.');
        setIsVoucherCameraActive(false);
      }
    }
  };

  const stopVoucherCamera = () => {
    if (voucherStreamRef.current) {
      voucherStreamRef.current.getTracks().forEach(track => track.stop());
      voucherStreamRef.current = null;
    }
    setIsVoucherCameraActive(false);
  };

  const flipVoucherCamera = () => {
    setVoucherCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  useEffect(() => {
    if (isVoucherCameraActive) {
      startVoucherCamera();
    }
    return () => {
      stopVoucherCamera();
    };
  }, [voucherCameraFacing]);

  useEffect(() => {
    if (!isOpen) {
      stopVoucherCamera();
    }
  }, [isOpen]);

  const takeVoucherSnapshot = () => {
    if (!voucherVideoRef.current) return;
    const video = voucherVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setVoucherImage(dataUrl);
    stopVoucherCamera();
  };

  const handleVoucherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setVoucherImage(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          setVoucherImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Auto-refresh transfer transactions when deposit tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'deposit') {
      apiGetMyDepositTransactions().then(res => {
        if (res && res.success && res.transactions) {
          onUpdateUser({ depositTransactions: res.transactions });
        }
      }).catch(err => {
        console.warn('Silent deposit history fetch warning:', err);
      });
    }
  }, [isOpen, activeTab]);

  const handleRefreshHistory = async () => {
    setIsRefreshingHistory(true);
    setHistoryRefreshFeedback(null);
    try {
      const res = await apiGetMyDepositTransactions();
      if (res && res.success && res.transactions) {
        onUpdateUser({ depositTransactions: res.transactions });
        setHistoryRefreshFeedback('¡Historial actualizado en tiempo real!');
        setTimeout(() => setHistoryRefreshFeedback(null), 3000);
      }
    } catch (e: any) {
      console.warn('Error refreshing transfer history:', e);
    } finally {
      setIsRefreshingHistory(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositReference.trim()) {
      setDepositErrorMessage('Ingresa el número de comprobante o referencia de tu depósito.');
      return;
    }
    setIsSubmittingDeposit(true);
    setDepositErrorMessage(null);
    setDepositSuccessMessage(null);
    try {
      const amount = depositPlanId === 'premium_basic' ? 50 : depositPlanId === 'premium_pro' ? 100 : 150;
      const res = await apiDepositPayment({
        method: depositMethod,
        referenceNumber: depositReference.trim(),
        amountCordobas: amount,
        planId: depositPlanId,
        voucherImage: voucherImage || undefined,
        voucherNotes: voucherNotes.trim() || undefined
      });
      if (res && res.success && res.user) {
        onUpdateUser(res.user);
        setDepositSuccessMessage(res.message || '¡Depósito registrado con éxito! Comprobante enviado para verificación.');
        setDepositReference('');
        setVoucherImage(null);
        setVoucherNotes('');
      } else {
        setDepositErrorMessage(res?.message || 'No se pudo procesar el depósito. Verifica los datos.');
      }
    } catch (err: any) {
      setDepositErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleRedeem300Points = async () => {
    if ((currentUser.points || 0) < 300) return;
    setIsRedeemingPoints(true);
    setPointsSuccessMessage(null);
    try {
      const res = await apiRedeemPoints();
      if (res && res.success && res.user) {
        onUpdateUser(res.user);
        setPointsSuccessMessage(res.message || '🎉 ¡Canje exitoso! Paquete Premium activado gratis por 15 días.');
      } else {
        setPointsSuccessMessage(res?.message || 'Se requieren 300 puntos para activar los 15 días gratis.');
      }
    } catch {
      setPointsSuccessMessage('Error al canjear los puntos.');
    } finally {
      setIsRedeemingPoints(false);
    }
  };

  const handleClaimActivityPoints = async (points: number, reason: string) => {
    try {
      const res = await apiAddPoints(points, reason);
      if (res && res.user) {
        onUpdateUser(res.user);
        setPointsSuccessMessage(res.message);
        setTimeout(() => setPointsSuccessMessage(null), 4000);
      }
    } catch {}
  };

  // Storage percentage calculation
  const storagePercent = Math.min(100, Math.round((storageQuota.usedMb / storageQuota.totalMb) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#091322] border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#070e1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  Naul Chat Nicaragua: Planes, Negocios & Monetización
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  En Córdobas (C$)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cómo funcionaría el ecosistema: usuarios gratis, comercios locales, IA 24/7 y funciones VIP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Notification */}
        {activatedSuccessMessage && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{activatedSuccessMessage}</span>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="bg-[#050b14] border-b border-slate-800/80 px-4 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'deposit' 
                ? 'border-emerald-400 text-emerald-400 font-bold bg-emerald-500/10' 
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">💳 Depósito Banpro / LAFISE</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold">
              En Vivo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('points')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'points' 
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/10' 
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>⭐ Puntos ({currentUser.points || 0}/300 pts)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
              15d Gratis
            </span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'plans' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Planes & Precios (C$)</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'business' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>🏪 Perfil Comercial & Catálogo</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ai' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-sky-400" />
            <span>🤖 IA para Negocios (24/7)</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ads' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4 text-rose-400" />
            <span>📢 Anuncios en Estados</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'verification' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>✅ Verificación Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'storage' 
                ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>☁️ Almacenamiento Nube</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070e1a]/50 space-y-6">

          {/* TAB: DEPÓSITO BANPRO & LAFISE EN TIEMPO REAL */}
          {activeTab === 'deposit' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Pasarela Oficial de Pagos • Nicaragua 🇳🇮
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Depósitos Bancarios en Tiempo Real
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Transfiere a cualquiera de nuestras dos cuentas oficiales para activar tu suscripción Premium o Perfil Comercial de forma inmediata en la base de datos.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shrink-0 text-center sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tu Estado Actual</span>
                  <div className="text-sm font-bold text-emerald-300 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                    {currentPlan === 'free' && <span>🆓 Gratis (1 GB)</span>}
                    {currentPlan === 'premium' && <span>⭐ Premium Activo (50 GB)</span>}
                    {currentPlan === 'business' && <span>🏪 Comercio Verificado</span>}
                  </div>
                </div>
              </div>

              {/* Feedback Toasts */}
              {depositSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-emerald-300">¡Pago procesado con éxito!</div>
                    <div>{depositSuccessMessage}</div>
                  </div>
                </div>
              )}

              {depositErrorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div className="flex-1">{depositErrorMessage}</div>
                </div>
              )}

              {/* Grid of Bank Accounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. BILLETERA MÓVIL BANPRO */}
                <div className="bg-gradient-to-b from-[#0e1d2c] to-[#0a1420] border-2 border-sky-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                        Billetera Móvil Banpro
                      </span>
                      <span className="text-[10px] text-sky-400 font-semibold uppercase">Depósito 24/7</span>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-medium">Número de Celular para Depósito:</div>
                      <div className="text-2xl font-extrabold text-white tracking-wider flex items-center gap-2 mt-0.5">
                        <span>+505 58898311</span>
                      </div>
                      <div className="text-xs text-sky-300 font-medium mt-1">
                        Titular: <span className="font-bold text-white">Norman Escobar</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                      Abre tu aplicación <strong>Billetera Móvil Banpro</strong> en tu celular, selecciona <em>"Envío de Dinero"</em> y digita el número <strong className="text-white">+505 58898311</strong>.
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy('+50558898311', 'banpro')}
                      className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20"
                    >
                      {copiedKey === 'banpro' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>¡Número Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Número (+505 58898311)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDepositMethod('banpro_billetera');
                        const el = document.getElementById('deposit-form-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold cursor-pointer border border-slate-700"
                      title="Usar este método"
                    >
                      Pagar Aquí
                    </button>
                  </div>
                </div>

                {/* 2. CUENTA BANCARIA LAFISE BANCENTRO */}
                <div className="bg-gradient-to-b from-[#0b221a] to-[#081813] border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        Banco LAFISE Bancentro
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">Cuenta Bancaria</span>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-medium">Número de Cuenta LAFISE:</div>
                      <div className="text-2xl font-extrabold text-white tracking-wider flex items-center gap-2 mt-0.5">
                        <span>134085049</span>
                      </div>
                      <div className="text-xs text-emerald-300 font-medium mt-1">
                        Titular: <span className="font-bold text-white">Norman Escobar</span> • Córdobas (C$)
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                      Desde tu banca en línea LAFISE Bancentro o cajero automático, transfiere a la cuenta en Córdobas <strong className="text-white">134085049</strong>.
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy('134085049', 'lafise')}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      {copiedKey === 'lafise' ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>¡Cuenta Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Cuenta (134085049)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDepositMethod('lafise_cuenta');
                        const el = document.getElementById('deposit-form-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold cursor-pointer border border-slate-700"
                      title="Usar este método"
                    >
                      Pagar Aquí
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulario de Depósito en Tiempo Real */}
              <div id="deposit-form-section" className="bg-[#0b1424] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Desbloquear Paquete Premium en Tiempo Real
                    </h4>
                    <p className="text-xs text-slate-400">
                      Una vez hecho tu depósito por Banpro (+505 58898311) o LAFISE (134085049), ingresa el comprobante aquí abajo para desbloquearlo al instante.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Método Usado */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        1. Cuenta donde realizaste el depósito:
                      </label>
                      <select
                        value={depositMethod}
                        onChange={(e) => setDepositMethod(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="banpro_billetera">Billetera Móvil Banpro (+505 58898311)</option>
                        <option value="lafise_cuenta">Cuenta Bancaria LAFISE Bancentro (134085049)</option>
                      </select>
                    </div>

                    {/* Paquete a Activar */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        2. Paquete a Desbloquear:
                      </label>
                      <select
                        value={depositPlanId}
                        onChange={(e) => setDepositPlanId(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="premium_basic">⭐ Naul Premium Básico — C$50 / mes (50 GB Nube)</option>
                        <option value="premium_pro">⭐ Naul Premium VIP Pro — C$100 / mes (50 GB + Prioridad)</option>
                        <option value="business_starter">🏪 Perfil Comercial Negocio — C$150 / mes (100 GB + Bot IA 24/7)</option>
                      </select>
                    </div>
                  </div>

                  {/* Número de Referencia */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>3. Número de Referencia o Comprobante:</span>
                      <span className="text-[11px] text-slate-400">Ej. 984123, REF-881, o número de transacción</span>
                    </label>
                    <input
                      type="text"
                      value={depositReference}
                      onChange={(e) => setDepositReference(e.target.value)}
                      placeholder="Digita el número de comprobante o referencia del depósito..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* 4. Comprobante de Transferencia Bancaria (Cámara o Galería) */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {/* Hidden file input */}
                    <input
                      ref={voucherFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVoucherFileUpload}
                    />

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <span>4. Captura o Foto del Comprobante (Cámara o Galería):</span>
                      </label>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Verificación Administrativa 🇳🇮
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Toma una foto con tu cámara al recibo físico/pantalla de la transferencia, o sube una captura de pantalla de tu app bancaria Banpro o LAFISE.
                    </p>

                    {/* Camera view active */}
                    {isVoucherCameraActive && (
                      <div className="p-3 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-3 animate-fadeIn shadow-2xl">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <Camera className="w-4 h-4 animate-pulse text-emerald-400" />
                            <span>Cámara en Vivo — Apunta al Comprobante</span>
                          </span>
                          <button
                            type="button"
                            onClick={flipVoucherCamera}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Girar cámara frontal / trasera"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Girar</span>
                          </button>
                        </div>

                        {voucherCameraError ? (
                          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{voucherCameraError}</span>
                          </div>
                        ) : (
                          <div className="relative aspect-[4/3] max-h-72 w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                            <video
                              ref={voucherVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-contain"
                            />
                            {/* Framing guide overlay */}
                            <div className="absolute inset-4 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                              <span className="text-[10px] bg-black/70 text-emerald-300 px-2 py-0.5 rounded self-start font-mono">
                                Encuadra el Comprobante Bancario
                              </span>
                              <span className="text-[10px] bg-black/70 text-slate-300 px-2 py-0.5 rounded self-end font-mono">
                                Banpro / LAFISE
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={stopVoucherCamera}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={takeVoucherSnapshot}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-slate-950" />
                            <span>Tomar Foto del Comprobante</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview of captured voucher or upload buttons */}
                    {!isVoucherCameraActive && (
                      <div>
                        {voucherImage ? (
                          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div 
                                onClick={() => setSelectedVoucherForPreview(voucherImage)}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-400 bg-black shrink-0 cursor-pointer group"
                                title="Clic para ampliar comprobante"
                              >
                                <img
                                  src={voucherImage}
                                  alt="Comprobante Bancario"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="w-5 h-5 text-white" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>Comprobante Adjuntado</span>
                                </div>
                                <p className="text-[11px] text-slate-300 truncate">
                                  Listo para verificación administrativa en el servidor
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setSelectedVoucherForPreview(voucherImage)}
                                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver en pantalla completa</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                onClick={() => startVoucherCamera()}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Repetir Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setVoucherImage(null)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-rose-500/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => startVoucherCamera()}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow group"
                            >
                              <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                              <span>📸 Tomar Foto con la Cámara</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => voucherFileInputRef.current?.click()}
                              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow group"
                            >
                              <Upload className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                              <span>📁 Subir Captura de Pantalla</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional Notes for Admin */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-medium text-slate-400 block">
                        Nota adicional para el equipo administrativo (opcional):
                      </label>
                      <input
                        type="text"
                        value={voucherNotes}
                        onChange={(e) => setVoucherNotes(e.target.value)}
                        placeholder="Ej. Transferido desde la cuenta de Juan Pérez a las 10:15 AM..."
                        className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Validación administrativa segura y registro en base de datos Node.js</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDeposit}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                    >
                      {isSubmittingDeposit ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Enviando comprobante al servidor...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>
                            {voucherImage
                              ? 'Enviar Comprobante a Verificación Administrativa'
                              : 'Verificar Depósito y Desbloquear Premium'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* ========================================================================= */}
              {/* SECCIÓN DEDICADA: HISTORIAL DE TRANSFERENCIAS & ESTADOS                    */}
              {/* ========================================================================= */}
              {(() => {
                const transactions: DepositTransaction[] = currentUser.depositTransactions || [];
                const totalCount = transactions.length;
                const pendingCount = transactions.filter(t => t.status === 'pending' || t.status === 'pending_verification').length;
                const verifiedCount = transactions.filter(t => t.status === 'approved').length;
                const rejectedCount = transactions.filter(t => t.status === 'rejected').length;

                const filtered = transactions.filter(t => {
                  if (historyFilter === 'pending') return t.status === 'pending' || t.status === 'pending_verification';
                  if (historyFilter === 'verified') return t.status === 'approved';
                  if (historyFilter === 'rejected') return t.status === 'rejected';
                  return true;
                });

                return (
                  <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              Historial de Transferencias
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                              {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Estados de verificación en tiempo real de tus depósitos y comprobantes bancarios
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {historyRefreshFeedback && (
                          <span className="text-[11px] text-emerald-400 font-semibold animate-fadeIn flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{historyRefreshFeedback}</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleRefreshHistory}
                          disabled={isRefreshingHistory}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          title="Actualizar estados desde el servidor"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHistory ? 'animate-spin text-emerald-400' : ''}`} />
                          <span>{isRefreshingHistory ? 'Actualizando...' : 'Actualizar Estados'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Resumen rápido de estados */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Total Enviadas</span>
                        <span className="text-base font-extrabold text-white">{totalCount}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                        <span className="text-[10px] text-amber-300 block font-medium uppercase tracking-wider">⏳ Pendientes</span>
                        <span className="text-base font-extrabold text-amber-400">{pendingCount}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                        <span className="text-[10px] text-emerald-300 block font-medium uppercase tracking-wider">✓ Verificados</span>
                        <span className="text-base font-extrabold text-emerald-400">{verifiedCount}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
                        <span className="text-[10px] text-rose-300 block font-medium uppercase tracking-wider">✕ Rechazados</span>
                        <span className="text-base font-extrabold text-rose-400">{rejectedCount}</span>
                      </div>
                    </div>

                    {/* Filtros de estado */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setHistoryFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          historyFilter === 'all'
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <span>Todos</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">
                          {totalCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHistoryFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          historyFilter === 'pending'
                            ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                            : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span>⏳ Pendientes ({pendingCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHistoryFilter('verified')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          historyFilter === 'verified'
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                            : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span>✓ Verificados ({verifiedCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHistoryFilter('rejected')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          historyFilter === 'rejected'
                            ? 'bg-rose-500 text-white shadow-md font-bold'
                            : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span>✕ Rechazados ({rejectedCount})</span>
                      </button>
                    </div>

                    {/* Lista de transferencias */}
                    {filtered.length === 0 ? (
                      <div className="py-8 px-4 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-300">
                          {totalCount === 0
                            ? 'Aún no has registrado transferencias ni comprobantes'
                            : 'No hay transferencias en este filtro'}
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          {totalCount === 0
                            ? 'Realiza un depósito por Billetera Móvil Banpro (+505 58898311) o Cuenta LAFISE (134085049) arriba y sube tu comprobante para seguir su aprobación administrativa aquí.'
                            : 'Selecciona otra pestaña de filtro para ver el resto de tus comprobantes.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filtered.map((tx: DepositTransaction) => {
                          const isPending = tx.status === 'pending' || tx.status === 'pending_verification';
                          const isApproved = tx.status === 'approved';
                          const isRejected = tx.status === 'rejected';

                          const formattedDate = new Date(tx.timestamp).toLocaleDateString('es-NI', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                          const formattedTime = new Date(tx.timestamp).toLocaleTimeString('es-NI', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });

                          return (
                            <div
                              key={tx.id}
                              className={`p-3.5 sm:p-4 rounded-xl border transition space-y-3 shadow-md ${
                                isApproved
                                  ? 'bg-emerald-950/20 border-emerald-500/40'
                                  : isPending
                                  ? 'bg-amber-950/20 border-amber-500/40'
                                  : 'bg-rose-950/20 border-rose-500/40'
                              }`}
                            >
                              {/* Top Bar of Transfer Item */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-[11px] flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                                    <span>
                                      {tx.method === 'banpro_billetera'
                                        ? 'Billetera Móvil Banpro (+505 58898311)'
                                        : 'Cuenta Bancaria LAFISE (134085049)'}
                                    </span>
                                  </span>

                                  <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                                    <span className="text-slate-400">Ref:</span>
                                    <span className="font-mono font-bold text-white">{tx.referenceNumber}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(tx.referenceNumber, `ref_${tx.id}`)}
                                      className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                                      title="Copiar número de referencia"
                                    >
                                      {copiedKey === `ref_${tx.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formattedDate}, {formattedTime}</span>
                                  </span>

                                  {/* Badge de Estado Destacado */}
                                  {isPending && (
                                    <span className="px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-300 text-[11px] font-extrabold border border-amber-500/50 flex items-center gap-1.5 shadow-sm">
                                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                      <span>⏳ Pendiente de Verificación</span>
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>✓ Verificado y Aprobado</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-300 text-[11px] font-extrabold border border-rose-500/50 flex items-center gap-1.5 shadow-sm">
                                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                      <span>✕ Rechazado</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Mensaje descriptivo del estado actual */}
                              <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
                                isApproved
                                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
                                  : isPending
                                  ? 'bg-amber-950/40 border border-amber-500/30 text-amber-200'
                                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
                              }`}>
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                  {isPending && (
                                    <p>
                                      <strong className="font-semibold text-amber-300">En revisión administrativa:</strong> Tu comprobante bancario fue enviado al servidor y está en cola de verificación. El plan Premium se mantendrá activo en modo preliminar mientras el equipo verifica la acreditación.
                                    </p>
                                  )}
                                  {isApproved && (
                                    <p>
                                      <strong className="font-semibold text-emerald-300">Acreditación confirmada:</strong> Comprobante validado correctamente
                                      {tx.verifiedAt ? ` el ${new Date(tx.verifiedAt).toLocaleDateString()} a las ${new Date(tx.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}. Tu suscripción y beneficios Premium están activos y respaldados.
                                    </p>
                                  )}
                                  {isRejected && (
                                    <p>
                                      <strong className="font-semibold text-rose-300">No se pudo verificar la transferencia:</strong> {tx.notes || tx.voucherNotes || 'El número de referencia o la captura de pantalla no coinciden con los movimientos bancarios registrados. Por favor revisa los datos o sube un comprobante legible.'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Contenido principal: Miniatura de comprobante y detalles */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  {tx.voucherImage ? (
                                    <div
                                      onClick={() => setSelectedVoucherForPreview(tx.voucherImage!)}
                                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-black shrink-0 cursor-pointer group shadow"
                                      title="Clic para ampliar y descargar comprobante"
                                    >
                                      <img
                                        src={tx.voucherImage}
                                        alt={`Comprobante ${tx.referenceNumber}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-white">
                                        <Eye className="w-5 h-5" />
                                        <span className="text-[9px] font-semibold mt-0.5">Ampliar</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-400 shrink-0 text-center p-1">
                                      <FileText className="w-5 h-5 text-slate-500 mb-0.5" />
                                      <span className="text-[9px] leading-tight">Referencia sin foto</span>
                                    </div>
                                  )}

                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400">Plan solicitado:</span>
                                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                                        {tx.planId === 'premium_pro'
                                          ? 'Plan Premium Pro'
                                          : tx.planId === 'business' || tx.planId === 'business_annual'
                                          ? 'Plan Negocio Verificado'
                                          : 'Plan Básico'}
                                      </span>
                                    </div>

                                    {tx.voucherImage && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedVoucherForPreview(tx.voucherImage!)}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>Ver comprobante en pantalla completa</span>
                                      </button>
                                    )}

                                    {tx.voucherNotes && (
                                      <div className="text-[11px] text-slate-400 truncate max-w-sm">
                                        <span className="text-slate-500 font-medium">Nota enviada:</span> "{tx.voucherNotes}"
                                      </div>
                                    )}

                                    {tx.notes && (
                                      <div className="text-[11px] text-cyan-300 font-medium truncate max-w-sm">
                                        <span>Nota administrativa:</span> {tx.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right self-end sm:self-center shrink-0">
                                  <div className="text-[10px] text-slate-400 uppercase font-medium">Monto acreditado</div>
                                  <div className="text-lg font-black text-emerald-400">
                                    C${tx.amountCordobas} <span className="text-xs font-normal text-slate-400">NIO</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: SISTEMA DE PUNTOS (300 PUNTOS = 15 DÍAS GRATIS) */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              {/* Points Hero Banner */}
              <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/70 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Programa de Recompensas Naul Chat Nicaragua
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    ¡Gana Puntos y Disfruta 15 Días Premium Gratis!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Al llegar a los <strong className="text-amber-300 font-extrabold">300 puntos</strong> por chatear, llamar, invitar contactos y publicar estados, se activa automáticamente el paquete <strong className="text-white">Premium durante 15 días gratis</strong>.
                  </p>
                </div>

                {/* Score Counter Widget */}
                <div className="bg-[#121929] border-2 border-amber-500/40 rounded-2xl p-4 text-center shrink-0 min-w-[180px] shadow-lg shadow-amber-500/10">
                  <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Tus Puntos Actuales</span>
                  <div className="text-3xl font-extrabold text-amber-300 flex items-center justify-center gap-1 my-0.5">
                    <span>{currentUser.points || 0}</span>
                    <span className="text-sm text-slate-400 font-normal">/ 300</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mt-1.5 border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(((currentUser.points || 0) / 300) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {Math.max(0, 300 - (currentUser.points || 0))} puntos faltantes para Premium
                  </span>
                </div>
              </div>

              {/* Feedback Toast */}
              {pointsSuccessMessage && (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex-1">{pointsSuccessMessage}</div>
                </div>
              )}

              {/* Status de los 15 días de prueba */}
              {currentUser.pointsTrialActive && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                      ⭐
                    </div>
                    <div>
                      <div className="font-bold text-amber-300">¡Tienes activo tu paquete Premium por 15 días gratis!</div>
                      <div className="text-slate-300 text-[11px]">
                        Disfrutando 50 GB de almacenamiento, fotos en alta calidad e insignia dorada.
                      </div>
                    </div>
                  </div>
                  {currentUser.premiumExpiresAt && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      Vence: {new Date(currentUser.premiumExpiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Canje si tiene 300 puntos */}
              {(currentUser.points || 0) >= 300 && (
                <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-0.5 rounded-2xl shadow-xl shadow-amber-500/20 animate-pulse">
                  <div className="bg-slate-950 rounded-[15px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
                        <Gift className="w-5 h-5 text-amber-400" />
                        ¡Has alcanzado la meta de 300 Puntos!
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Canjea tus 300 puntos ahora mismo para activar tus 15 días gratis de Naul Premium.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRedeem300Points}
                      disabled={isRedeemingPoints}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shrink-0 shadow-lg shadow-amber-500/30"
                    >
                      {isRedeemingPoints ? 'Activando Premium...' : '🎉 Activar 15 Días Gratis Ahora'}
                    </button>
                  </div>
                </div>
              )}

              {/* Cómo ganar puntos en Naul Chat */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Actividades para Ganar Puntos Rápidamente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="text-base">💬</span>
                        <span>Enviar 10 Mensajes Cifrados</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Chatea con amigos o familiares en Nicaragua.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">+15 pts</span>
                      <button
                        onClick={() => handleClaimActivityPoints(15, 'enviar 10 mensajes')}
                        className="mt-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                      >
                        Reclamar
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="text-base">📸</span>
                        <span>Publicar un Estado / Historia</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Comparte una foto o video con música típica.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">+20 pts</span>
                      <button
                        onClick={() => handleClaimActivityPoints(20, 'publicar estado en historias')}
                        className="mt-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                      >
                        Reclamar
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="text-base">👥</span>
                        <span>Invitar a un Nuevo Contacto</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Añade un número telefónico nuevo a la libreta.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">+50 pts</span>
                      <button
                        onClick={() => handleClaimActivityPoints(50, 'invitar y guardar contacto')}
                        className="mt-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                      >
                        Reclamar
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="text-base">📞</span>
                        <span>Llamada de Voz o Video</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Realiza una llamada nítida dentro de la app.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">+25 pts</span>
                      <button
                        onClick={() => handleClaimActivityPoints(25, 'llamada de voz o video')}
                        className="mt-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                      >
                        Reclamar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PLANES & PRECIOS (CÓMO FUNCIONARÍA) */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    Ecosistema y Monetización Sostenible
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    ¿Cómo funcionaría Naul Chat Nicaragua?
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Un modelo diseñado para la economía nicaragüense: gratis para que toda la población hable y comparta sin costo, y con planes accesibles en Córdobas (C$) para emprendedores, negocios locales y usuarios que deseen funciones prémium y almacenamiento ilimitado.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shrink-0 text-center sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tu Estado Actual</span>
                  <div className="text-sm font-bold text-sky-300 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                    {currentPlan === 'free' && <span>🆓 Usuario Gratis</span>}
                    {currentPlan === 'premium' && <span>⭐ Usuario Premium</span>}
                    {currentPlan === 'business' && <span>🏪 Comercio Verificado</span>}
                  </div>
                </div>
              </div>

              {/* Grid of Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. USUARIOS GRATIS */}
                <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        🆓 Usuarios
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">100% Gratis</span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">C$0</span>
                        <span className="text-xs text-slate-400">/ mes</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Chat, llamadas de voz y video, fotos y estados gratis sin suscripción.
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Chat cifrado E2EE ilimitado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Llamadas y videollamadas gratis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Envío de fotos y notas de voz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Publicación de Estados 24h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>1 GB de almacenamiento en nube</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      onClick={() => handleSelectPlan('free')}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        currentPlan === 'free'
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {currentPlan === 'free' ? '✓ Plan Activo' : 'Elegir Plan Gratis'}
                    </button>
                  </div>
                </div>

                {/* 2. PREMIUM USUARIOS */}
                <div className="bg-gradient-to-b from-[#141b2c] to-[#0c1424] border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-amber-500/5 relative">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                    ⭐ Premium
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        ⭐ Premium
                      </span>
                      <span className="text-[11px] text-amber-400 font-semibold">C$50 – C$100 / mes</span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-amber-300">C$50</span>
                        <span className="text-xs text-slate-400">– C$100 / mes</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Funciones adicionales, estrella dorada, fotos Ultra-HD y 50 GB de almacenamiento.
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Insignia dorada de Verificación ⭐</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>50 GB de almacenamiento en nube ☁️</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Subida de fotos y videos Ultra-HD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Colores de globos y temas VIP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Transcripción de audios a texto</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 space-y-2">
                    <button
                      onClick={() => {
                        setDepositPlanId('premium_basic');
                        setActiveTab('deposit');
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20"
                    >
                      <CreditCard className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>💳 Pagar con Banpro (+505 58898311) o LAFISE</span>
                    </button>
                    <button
                      onClick={() => handleSelectPlan('premium_basic')}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        currentPlan === 'premium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {currentPlan === 'premium' ? '✓ Premium Activo' : 'Activar Prueba Directa (C$50/mes)'}
                    </button>
                    <button
                      onClick={() => {
                        setDepositPlanId('premium_pro');
                        setActiveTab('deposit');
                      }}
                      className="w-full py-1 text-[11px] text-amber-400 hover:text-amber-300 underline font-medium text-center"
                    >
                      O plan VIP Pro con 50 GB (C$100/mes)
                    </button>
                  </div>
                </div>

                {/* 3. NEGOCIOS & COMERCIOS */}
                <div className="bg-gradient-to-b from-[#0c1e28] to-[#0a1622] border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-emerald-500/5 relative">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                    🏪 Negocios
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        🏪 Comercial
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">C$100 – C$300 / mes</span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-emerald-300">C$100</span>
                        <span className="text-xs text-slate-400">– C$300 / mes</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Perfil comercial, catálogo, 🤖 IA para atención 24/7 y anuncios en Estados.
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Perfil comercial con Catálogo digital</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>🤖 Asistente IA para atención y pedidos 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Insignia oficial de Negocio Verificado ✅</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>📢 Anuncios en sección Estados/Descubrir</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>15 a 100 GB de almacenamiento en nube ☁️</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 space-y-2">
                    <button
                      onClick={() => {
                        handleSelectPlan('business_pro');
                        setActiveTab('business');
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        currentPlan === 'business'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {currentPlan === 'business' ? '✓ Negocio Activo' : 'Activar Negocio (C$100-300)'}
                    </button>
                    <button
                      onClick={() => setActiveTab('business')}
                      className="w-full py-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium text-center"
                    >
                      Configurar Catálogo & Horarios
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Methods in Nicaragua */}
              <div className="bg-[#0b1322] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>Métodos de Pago Nicaragüenses compatibles:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">LAFISE Bancentro</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">BAC Credomatic</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Billetera Banpro</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Tigo Money</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Efectivo contra entrega</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERFIL COMERCIAL & CATÁLOGO */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1424] border border-slate-800 rounded-2xl p-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-400" />
                    Perfil Comercial para Negocios (C$100–300/mes)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite a tus clientes consultar tus productos con precio en Córdobas (C$) y hacer pedidos directos por chat.
                  </p>
                </div>
                <button
                  onClick={handleSaveBusinessProfile}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  Guardar Perfil Comercial
                </button>
              </div>

              {/* Business Info Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nombre del Negocio / Empresa</label>
                  <input
                    type="text"
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                    placeholder="Ej. Comidería Doña Tania"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Categoría</label>
                  <select
                    value={businessProfile.category}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Comidería & Gastronomía">Comidería & Gastronomía Nica</option>
                    <option value="Moda, Ropa & Calzado">Moda, Ropa & Calzado</option>
                    <option value="Tecnología & Celulares">Tecnología & Celulares</option>
                    <option value="Pulpería & Abarrotes">Pulpería & Abarrotes</option>
                    <option value="Artesanías & Cultura">Artesanías de Masaya / Souvenirs</option>
                    <option value="Servicios Profesionales">Servicios Profesionales</option>
                    <option value="Farmacia & Salud">Farmacia & Salud</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Departamento / Ciudad</label>
                  <select
                    value={businessProfile.department}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Managua">Managua</option>
                    <option value="Masaya">Masaya</option>
                    <option value="Granada">Granada</option>
                    <option value="León">León</option>
                    <option value="Chinandega">Chinandega</option>
                    <option value="Matagalpa">Matagalpa</option>
                    <option value="Estelí">Estelí</option>
                    <option value="Jinotega">Jinotega</option>
                    <option value="Rivas">Rivas / San Juan del Sur</option>
                    <option value="Carazo">Carazo</option>
                    <option value="Chontales">Chontales (Juigalpa)</option>
                    <option value="Caribe Norte">Caribe Norte (Bilwi)</option>
                    <option value="Caribe Sur">Caribe Sur (Bluefields)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Horario de Atención</label>
                  <input
                    type="text"
                    value={businessProfile.hours}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, hours: e.target.value })}
                    placeholder="Ej. Lunes a Sábado: 8am - 6pm"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dirección Exacta</label>
                  <input
                    type="text"
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                    placeholder="Ej. De la rotonda El Güegüense 2c abajo, Managua"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Product Catalog Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-sky-400" />
                    Catálogo de Productos y Servicios ({businessProfile.catalog.length})
                  </h4>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Producto</span>
                  </button>
                </div>

                {/* Add product modal/inline form */}
                {showAddProduct && (
                  <div className="p-4 bg-slate-900 border border-sky-500/40 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300">Nuevo Producto / Servicio para el Catálogo</span>
                      <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] text-slate-400">Título del producto</label>
                        <input
                          type="text"
                          value={newProductTitle}
                          onChange={(e) => setNewProductTitle(e.target.value)}
                          placeholder="Ej. Nacatamal Especial o Combo Familiar"
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Precio en Córdobas (C$)</label>
                        <input
                          type="number"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(Number(e.target.value))}
                          placeholder="180"
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] text-slate-400">Descripción breve</label>
                        <input
                          type="text"
                          value={newProductDesc}
                          onChange={(e) => setNewProductDesc(e.target.value)}
                          placeholder="Ingredientes, garantía o detalles de entrega..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowAddProduct(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddProductToCatalog}
                        className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs"
                      >
                        Guardar Producto
                      </button>
                    </div>
                  </div>
                )}

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {businessProfile.catalog.map(item => (
                    <div key={item.id} className="bg-[#0b1424] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
                      <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          C${item.priceCordobas}
                        </span>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            En Existencia
                          </span>
                          <button
                            onClick={() => handleRemoveProduct(item.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IA PARA NEGOCIOS (24/7) */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-sky-400" />
                    <h3 className="text-base font-bold text-white">
                      🤖 Asistente IA para Negocios (Respuestas Automáticas 24/7)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Atiende a tus clientes aunque estés durmiendo o fuera de línea. La IA responde precios de tu catálogo, horarios de atención, formas de pago (LAFISE, BAC) y toma pedidos automáticamente.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">
                    {businessProfile.aiBotEnabled ? 'IA Activa 24/7' : 'IA Pausada'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = { ...businessProfile, aiBotEnabled: !businessProfile.aiBotEnabled };
                      setBusinessProfile(updated);
                      onUpdateUser({ businessProfile: updated });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      businessProfile.aiBotEnabled ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                        businessProfile.aiBotEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Bot Configuration & Live Simulator Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bot Settings */}
                <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Configuración de Respuestas Automáticas
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Mensaje de Bienvenida Automático</label>
                    <textarea
                      rows={2}
                      value={businessProfile.aiBotWelcomeMessage}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, aiBotWelcomeMessage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Instrucciones del Bot / Sabor Nica</label>
                    <textarea
                      rows={2}
                      value={businessProfile.aiBotPrompt}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, aiBotPrompt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Preguntas Frecuentes Configuradas</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {businessProfile.aiBotFaq?.map((faq, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <p className="font-semibold text-sky-300">Q: {faq.question}</p>
                          <p className="text-slate-400 mt-0.5 text-[11px]">R: {faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBusinessProfile}
                    className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Guardar Parámetros de IA
                  </button>
                </div>

                {/* Live Simulator */}
                <div className="bg-[#0b1424] border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-[380px]">
                  <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Simulador en Vivo de tu Asistente IA</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Pruébalo como un cliente</span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-[#070e1a]/80">
                    {simulatedChatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-sky-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSimulateAiResponse} className="p-2 border-t border-slate-800 bg-slate-900/90 flex gap-2">
                    <input
                      type="text"
                      value={testUserMessage}
                      onChange={(e) => setTestUserMessage(e.target.value)}
                      placeholder="Pregunta: ¿cuánto vale? ¿hacen envíos?"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition cursor-pointer"
                      title="Enviar mensaje de prueba"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANUNCIOS EN ESTADOS / DESCUBRIR */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-rose-400" />
                    <h3 className="text-base font-bold text-white">
                      📢 Publicidad y Anuncios Locales en Nicaragua
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Los negocios pueden patrocinar historias o promociones en la sección de Estados y Canales para llegar a miles de usuarios activos en toda Nicaragua.
                  </p>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-center shrink-0">
                  <span className="text-[10px] text-rose-300 uppercase font-semibold">Campaña Local</span>
                  <p className="text-sm font-bold text-white">Desde C$50 / 7 días</p>
                </div>
              </div>

              {/* Showcase Active Ads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Anuncios Activos en Sección de Estados / Descubrir
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INITIAL_SPONSORED_ADS.map(ad => (
                    <div key={ad.id} className="bg-[#0b1424] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition">
                      <div className="relative h-44 w-full">
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80">
                          <img src={ad.businessAvatar} alt={ad.businessName} className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-[11px] font-semibold text-white">{ad.businessName}</span>
                        </div>

                        {ad.discountBadge && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow">
                            {ad.discountBadge}
                          </span>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide">
                            {ad.businessCategory} • {ad.department}
                          </span>
                          <h5 className="text-sm font-bold text-white leading-tight mt-0.5">
                            {ad.title}
                          </h5>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ad.description}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {ad.department}, Nicaragua
                          </span>

                          <button
                            onClick={() => {
                              onClose();
                              if (onOpenDirectChat) {
                                onOpenDirectChat('user-maria');
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{ad.ctaText}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VERIFICACIÓN OFICIAL */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    <h3 className="text-base font-bold text-white">
                      ✅ Insignia de Verificación Oficial en Naul Chat
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Protege tu identidad o negocio. Las insignias verificadas garantizan autenticidad ante la comunidad nicaragüense y evitan la suplantación.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.isVerified ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Cuenta Verificada 🇳🇮
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      Sin Verificar
                    </span>
                  )}
                </div>
              </div>

              {/* Verification Request Form */}
              <form onSubmit={handleRequestVerification} className="bg-[#0b1424] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Solicitud de Insignia Verificada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tipo de Verificación</label>
                    <select
                      value={verificationType}
                      onChange={(e) => setVerificationType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="cedula">Cédula de Identidad de Nicaragua (Persona)</option>
                      <option value="ruc">Número RUC (Empresa o Negocio Registrado)</option>
                      <option value="business">Matrícula de Alcaldía / Negocio Local</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {verificationType === 'cedula' ? 'Número de Cédula (001-XXXXXX-XXXX)' : 'Número de RUC o Matrícula'}
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationDocNumber}
                      onChange={(e) => setVerificationDocNumber(e.target.value)}
                      placeholder={verificationType === 'cedula' ? '001-120590-0012X' : 'J0310000123456'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    La validación toma segundos en este entorno demostrativo y es permanente.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-sky-500/20"
                  >
                    Obtener Insignia Verificada
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: ALMACENAMIENTO EN LA NUBE */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">
                      ☁️ Almacenamiento en la Nube de Naul Chat
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Guarda tus fotos familiares, documentos importantes, audios y catálogos de negocio sin temor a perderlos.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-300">{storageQuota.usedMb} MB</span>
                  <span className="text-xs text-slate-400"> de {(storageQuota.totalMb / 1024).toFixed(0)} GB ({storagePercent}%)</span>
                </div>
              </div>

              {/* Storage Visual Bar */}
              <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Capacidad en uso:</span>
                  <span className="text-cyan-400">{storagePercent}% utilizado</span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${(storageQuota.photosMb / storageQuota.totalMb) * 100}%` }} className="h-full bg-sky-500" title="Fotos" />
                  <div style={{ width: `${(storageQuota.videosMb / storageQuota.totalMb) * 100}%` }} className="h-full bg-indigo-500" title="Videos" />
                  <div style={{ width: `${(storageQuota.audiosMb / storageQuota.totalMb) * 100}%` }} className="h-full bg-amber-500" title="Audios" />
                  <div style={{ width: `${(storageQuota.documentsMb / storageQuota.totalMb) * 100}%` }} className="h-full bg-emerald-500" title="Documentos" />
                </div>

                {/* Storage breakdown details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <div>
                      <p className="text-[11px] text-slate-400">Fotos</p>
                      <p className="font-bold text-white">{storageQuota.photosMb} MB</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-[11px] text-slate-400">Videos</p>
                      <p className="font-bold text-white">{storageQuota.videosMb} MB</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-[11px] text-slate-400">Notas de Voz</p>
                      <p className="font-bold text-white">{storageQuota.audiosMb} MB</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-[11px] text-slate-400">Documentos</p>
                      <p className="font-bold text-white">{storageQuota.documentsMb} MB</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    ¿Necesitas más espacio? Con el plan Premium obtienes 50 GB y con el plan Negocio hasta 100 GB.
                  </p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20"
                  >
                    Ampliar Almacenamiento
                  </button>
                </div>
              </div>

              {/* Cloud Backup & Google Drive Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-cyan-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Copia de Seguridad en Google Drive
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        E2EE Cifrado
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exporta tus chats cifrados a JSON o sincronízalos con Google Drive para no perder tus conversaciones.
                    </p>
                  </div>
                </div>
                {onOpenBackupRestore && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBackupRestore('drive');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0 shadow-lg"
                  >
                    Gestionar Respaldo
                  </button>
                )}
              </div>

              {/* Automatic Garbage Collection & Cache Pruning Routine (8 GB Limit) */}
              <div className="p-4 rounded-2xl bg-[#091120] border border-cyan-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Rutina de Limpieza Inteligente (Garbage Collection)
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          Límite: 8 GB
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        El sistema monitorea periódicamente el almacenamiento y elimina caché temporal, historias expiradas y datos obsoletos para mantener la app rápida y fluida.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunGarbageCollection}
                    disabled={isCleaningStorage}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
                  >
                    {isCleaningStorage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Limpiando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>Liberar Espacio Ahora</span>
                      </>
                    )}
                  </button>
                </div>

                {cleanupMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cleanupMessage}</span>
                  </div>
                )}

                {serverStorageMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-[11px] text-slate-300 border-t border-slate-800/80">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block">Límite oficial:</span>
                      <span className="font-bold text-cyan-300">8 GB (8,192 MB)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block">Uso en disco:</span>
                      <span className="font-bold text-white">{serverStorageMetrics.totalDiskUsageMb} MB</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block">Archivos subidos:</span>
                      <span className="font-bold text-white">{serverStorageMetrics.uploadsCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block">Estado del GC:</span>
                      <span className="font-bold text-emerald-400">Activo (Cada 4h)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070e1a] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>🇳🇮 Naul Chat Nicaragua</span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">Precios en Córdobas (C$)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>

      {/* Modal de Vista Previa Ampliada de Comprobante (Lightbox) */}
      {selectedVoucherForPreview && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#0b1322] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Comprobante de Transferencia Bancaria</span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Naul Chat Nicaragua</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedVoucherForPreview}
                  download="comprobante-transferencia-naul.jpg"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
                  title="Descargar comprobante"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedVoucherForPreview(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition"
                  title="Cerrar vista"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Display */}
            <div className="flex-1 p-4 sm:p-6 overflow-auto flex items-center justify-center bg-black/70">
              <img
                src={selectedVoucherForPreview}
                alt="Comprobante en alta resolución"
                className="max-h-[72vh] max-w-full object-contain rounded-xl border border-slate-800 shadow-2xl"
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>🇳🇮 Comprobante de depósito verificado en Naul Chat</span>
              <button
                type="button"
                onClick={() => setSelectedVoucherForPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
