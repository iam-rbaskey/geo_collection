"use client";
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface AuthModalProps {
  onSuccess: (data: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        if (!data.user) throw new Error('Login failed');
        if (!data.session) throw new Error('Please verify your email before logging in.');

        onSuccess({
          user: {
            email: data.user.email,
            score: data.user.user_metadata?.score || 0,
            level: data.user.user_metadata?.level || 1,
            levelXP: data.user.user_metadata?.levelXP || 0,
            energy: data.user.user_metadata?.energy || 100,
            selectedAvatarId: data.user.user_metadata?.selectedAvatarId,
            inventory: data.user.user_metadata?.inventory || [],
          }
        });
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              score: 0,
              level: 1,
              levelXP: 0,
              energy: 100,
            }
          }
        });

        if (authError) throw authError;
        if (!data.user) throw new Error('Signup failed');
        if (!data.session) throw new Error('Signup successful! Please check your email to verify your account, or disable "Confirm email" in your Supabase Dashboard.');

        onSuccess({
          user: {
            email: data.user.email,
            score: data.user.user_metadata?.score || 0,
            level: data.user.user_metadata?.level || 1,
            levelXP: data.user.user_metadata?.levelXP || 0,
            energy: data.user.user_metadata?.energy || 100,
          }
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(7,11,18,0.97)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '850px',
        height: '480px',
        background: 'url(/auth_bg.png) center center / cover no-repeat',
        backgroundColor: '#0f172a',
        border: '2px solid rgba(0,255,213,0.2)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,255,213,0.15), inset 0 0 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '30px 40px',
        overflow: 'hidden'
      }}>
        {/* Dark overlay gradient to make text readable at the bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,11,18,0.98) 0%, rgba(7,11,18,0.6) 40%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          {error && (
            <div style={{
              position: 'absolute',
              top: '-60px',
              left: '0',
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              backdropFilter: 'blur(4px)',
            }}>
              {error}
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 900,
            color: '#e2e8f0',
            margin: '0 0 16px 0',
            lineHeight: 1,
            letterSpacing: '-1px',
            textShadow: '0 0 20px rgba(0,255,213,0.5)',
          }}>
            {isLogin ? 'LOG IN' : 'SIGN UP'}
          </h1>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Explorer ID (Email)"
                required
                style={{
                  flex: '1 1 200px',
                  height: '52px',
                  padding: '0 20px',
                  background: 'rgba(30,41,59,0.7)',
                  border: '2px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#e2e8f0',
                  outline: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s',
                }}
              />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Code (Password)"
                required
                style={{
                  flex: '1 1 200px',
                  height: '52px',
                  padding: '0 20px',
                  background: 'rgba(30,41,59,0.7)',
                  border: '2px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#e2e8f0',
                  outline: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s',
                }}
              />
              <button 
                type="submit"
                disabled={loading}
                style={{
                  height: '52px',
                  padding: '0 40px',
                  background: 'linear-gradient(135deg, #00ffd5, #00b8a9)',
                  color: '#0b0f14',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  boxShadow: '0 8px 24px rgba(0,255,213,0.3)',
                  transition: 'transform 0.2s',
                }}
              >
                {loading ? '...' : (isLogin ? 'Access' : 'Register')}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                <span 
                  onClick={() => setIsLogin(!isLogin)}
                  style={{ color: '#00ffd5', cursor: 'pointer', textDecoration: 'none' }}
                >
                  {isLogin ? 'Need to register?' : 'Already registered?'}
                </span>
                <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
                <span style={{ color: '#64748b', cursor: 'pointer' }}>
                  Recover credentials
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

