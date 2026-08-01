import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, LogOut, Mail, Phone, ShieldCheck } from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { supabase } from '../lib/supabase';
import { formatInrPaise } from '../lib/shopData';
import {
  sendPhoneOtp,
  signInEmail,
  signOut,
  signUpEmail,
  useAccount,
  verifyPhoneOtp,
} from '../lib/account';
import '../styles/account.css';

type Mode = 'sign-in' | 'sign-up';
type Method = 'phone' | 'email';

function AuthShell({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { account, loading, configured } = useAccount();
  const [method, setMethod] = useState<Method>('phone');

  // phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // email state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && account) navigate('/account', { replace: true });
  }, [loading, account, navigate]);

  const isSignUp = mode === 'sign-up';

  const handlePhoneStart = async () => {
    setBusy(true);
    setError(null);
    const result = await sendPhoneOtp(phone);
    setBusy(false);
    if (result.ok) {
      setOtpSent(true);
      setNotice('We sent a 6-digit code to your phone.');
    } else {
      setError(result.error);
    }
  };

  const handlePhoneVerify = async () => {
    setBusy(true);
    setError(null);
    const result = await verifyPhoneOtp(phone, otp);
    setBusy(false);
    if (result.ok) navigate('/account', { replace: true });
    else setError(result.error);
  };

  const handleEmail = async () => {
    setBusy(true);
    setError(null);
    const result = isSignUp
      ? await signUpEmail(email, password, fullName)
      : await signInEmail(email, password);
    setBusy(false);
    if (result.ok) {
      if (isSignUp) setNotice('Account created. Check your email to confirm, then sign in.');
      else navigate('/account', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <ElegantLayout>
      <SEOHead
        title={`${isSignUp ? 'Create your account' : 'Sign in'} | AlterCraft`}
        description="Sign in or create your AlterCraft account to track orders, save addresses and check out faster."
        canonical={`https://www.altercraft.in/account/${mode}`}
      />
      <main className="account account-auth">
        <div className="account-card">
          <p className="account-eyebrow"><ShieldCheck size={14} /> AlterCraft Account</p>
          <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="account-sub">
            {isSignUp
              ? 'Save addresses, track orders and check out faster.'
              : 'Sign in to see your orders, addresses and design bookings.'}
          </p>

          {!configured && (
            <p className="account-warn">
              Accounts aren’t connected yet. Add your Supabase keys to <code>.env.local</code> to switch this on.
            </p>
          )}

          <div className="account-tabs" role="tablist">
            <button type="button" className={method === 'phone' ? 'active' : ''} onClick={() => setMethod('phone')}>
              <Phone size={15} /> Phone
            </button>
            <button type="button" className={method === 'email' ? 'active' : ''} onClick={() => setMethod('email')}>
              <Mail size={15} /> Email
            </button>
          </div>

          {method === 'phone' ? (
            <div className="account-form">
              <label>
                Mobile number
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={otpSent}
                />
              </label>
              {otpSent && (
                <label>
                  Enter OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                  />
                </label>
              )}
              {!otpSent ? (
                <button type="button" className="account-btn-solid" onClick={handlePhoneStart} disabled={busy || phone.length < 10}>
                  {busy ? 'Sending…' : 'Send OTP'} <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="account-btn-solid" onClick={handlePhoneVerify} disabled={busy || otp.length < 4}>
                  {busy ? 'Verifying…' : isSignUp ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="account-form">
              {isSignUp && (
                <label>
                  Full name
                  <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" />
                </label>
              )}
              <label>
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </label>
              <button type="button" className="account-btn-solid" onClick={handleEmail} disabled={busy || !email || !password}>
                {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {error && <p className="account-error">{error}</p>}
          {notice && <p className="account-notice">{notice}</p>}

          <p className="account-switch">
            {isSignUp ? (
              <>Already have an account? <Link to="/account/sign-in">Sign in</Link></>
            ) : (
              <>New to AlterCraft? <Link to="/account/sign-up">Create an account</Link></>
            )}
          </p>
        </div>
      </main>
    </ElegantLayout>
  );
}

export function AccountSignIn() {
  return <AuthShell mode="sign-in" />;
}

export function AccountSignUp() {
  return <AuthShell mode="sign-up" />;
}

type OrderRow = {
  order_number: string;
  status: string;
  total_paise: number;
  created_at: string;
};

export function AccountDashboard() {
  const navigate = useNavigate();
  const { account, loading } = useAccount();
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!loading && !account) navigate('/account/sign-in', { replace: true });
  }, [loading, account, navigate]);

  useEffect(() => {
    let active = true;
    if (account && supabase) {
      supabase
        .from('orders')
        .select('order_number, status, total_paise, created_at')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (active && data) setOrders(data as OrderRow[]);
        });
    }
    return () => {
      active = false;
    };
  }, [account]);

  const greeting = useMemo(() => account?.fullName || account?.phone || account?.email || 'there', [account]);

  if (loading || !account) {
    return (
      <ElegantLayout>
        <main className="account">
          <p className="account-loading">Loading your account…</p>
        </main>
      </ElegantLayout>
    );
  }

  return (
    <ElegantLayout>
      <SEOHead title="Your Account | AlterCraft" description="Your AlterCraft orders, addresses and design bookings." canonical="https://www.altercraft.in/account" />
      <main className="account account-dashboard">
        <header className="account-dash-head">
          <div>
            <p className="account-eyebrow">Your account</p>
            <h1>Hello, {greeting}</h1>
          </div>
          <button type="button" className="account-signout" onClick={() => signOut().then(() => navigate('/'))}>
            <LogOut size={16} /> Sign out
          </button>
        </header>

        <section className="account-panel">
          <h2>Your orders</h2>
          {orders.length === 0 ? (
            <div className="account-empty">
              <p>No orders yet.</p>
              <Link to="/shop" className="account-btn-solid">Start shopping <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <ul className="account-orders">
              {orders.map((order) => (
                <li key={order.order_number}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <span className={`account-status status-${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
                  <strong>{formatInrPaise(order.total_paise)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="account-panel">
          <h2>Saved addresses</h2>
          <div className="account-empty">
            <p>Add an address at checkout and it’ll be saved here.</p>
          </div>
        </section>
      </main>
    </ElegantLayout>
  );
}
