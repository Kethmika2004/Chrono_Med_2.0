import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Building2, Bell, CreditCard, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { id: 'profile', label: 'Hospital Profile', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payment Config', icon: CreditCard },
];

export default function HospitalSettings() {
  const { profile, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hospitalData, setHospitalData] = useState<any>(null);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [hotline, setHotline] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Notification fields
  const [notifyNewAppt, setNotifyNewAppt] = useState(true);
  const [notifyCancel, setNotifyCancel] = useState(true);
  const [notifyDoctor, setNotifyDoctor] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Payment fields
  const [merchantId, setMerchantId] = useState('');
  const [merchantSecret, setMerchantSecret] = useState('');
  const [bookingFee, setBookingFee] = useState('300');
  const [currency, setCurrency] = useState('LKR');

  useEffect(() => {
    if (!profile?.id) return;
    const fetchHospital = async () => {
      const { data } = await supabase
        .from('hospitals')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (data) {
        setHospitalData(data);
        setName(data.name || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setHotline(data.hotline || '');
        setWebsite(data.website || '');
        setDescription(data.description || '');
        setMerchantId(data.payhere_merchant_id || '');
        setBookingFee(String(data.booking_fee_lkr || 300));
        setCurrency(data.currency || 'LKR');
      }

      setPhone(profile.phone || '');
    };
    fetchHospital();
  }, [profile?.id]);

  const handleSaveProfile = async () => {
    if (!profile?.id || !hospitalData?.id) return;
    setIsSaving(true);
    try {
      await supabase.from('hospitals').update({ name, address, city, hotline, website, description }).eq('id', hospitalData.id);
      await supabase.from('user_profiles').update({ phone, full_name: name }).eq('id', profile.id);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayments = async () => {
    if (!hospitalData?.id) return;
    setIsSaving(true);
    try {
      await supabase.from('hospitals').update({
        payhere_merchant_id: merchantId,
        booking_fee_lkr: parseInt(bookingFee),
        currency,
      }).eq('id', hospitalData.id);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save payments failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage hospital profile, notifications, and payment configuration</p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="font-medium">Settings saved successfully!</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-600" /> Hospital Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Hospital Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Hotline / Phone</label>
                <Input value={hotline} onChange={e => setHotline(e.target.value)} className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">City</label>
                <Input value={city} onChange={e => setCity(e.target.value)} className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Website</label>
                <Input value={website} onChange={e => setWebsite(e.target.value)} className="bg-slate-50" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <Input value={address} onChange={e => setAddress(e.target.value)} className="bg-slate-50" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700">About / Description</label>
                <textarea className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Bell className="w-5 h-5 text-teal-600" /> Notification Preferences</h2>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Event Triggers</h3>
              {[
                { label: 'New Appointment Booked', desc: 'Get notified when a patient books an appointment', value: notifyNewAppt, onChange: setNotifyNewAppt },
                { label: 'Appointment Cancelled', desc: 'Get notified when a patient cancels', value: notifyCancel, onChange: setNotifyCancel },
                { label: 'Doctor Status Change', desc: 'Get notified when a doctor\'s verification status changes', value: notifyDoctor, onChange: setNotifyDoctor },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={item.value} onChange={e => item.onChange(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-teal-400 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Channels</h3>
              {[
                { label: 'Email Notifications', value: emailNotif, onChange: setEmailNotif },
                { label: 'SMS Notifications', value: smsNotif, onChange: setSmsNotif },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-medium text-slate-800">{item.label}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={item.value} onChange={e => item.onChange(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-teal-400 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button className="bg-teal-600 hover:bg-teal-700 gap-2"><Save className="w-4 h-4" />Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Config Tab */}
      {activeTab === 'payments' && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-teal-600" /> Payment Configuration</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              Configure your PayHere merchant credentials to enable online payments.
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Merchant ID</label>
                <Input value={merchantId} onChange={e => setMerchantId(e.target.value)} className="bg-slate-50 font-mono" placeholder="1234567" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Merchant Secret</label>
                <Input type="password" value={merchantSecret} onChange={e => setMerchantSecret(e.target.value)} className="bg-slate-50 font-mono" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Booking Fee (LKR)</label>
                <Input type="number" value={bookingFee} onChange={e => setBookingFee(e.target.value)} className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Currency</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="LKR">LKR – Sri Lankan Rupee</option>
                  <option value="USD">USD – US Dollar</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePayments} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
