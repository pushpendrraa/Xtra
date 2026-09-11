import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/Shell'
import { SectionHeader, GlassCard } from '../../components/ui'
import { ShieldCheck, UploadCloud } from 'lucide-react'

export default function PODCapture() {
  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600, margin: '0 auto' }}>
        <SectionHeader title="🔐 POD Capture & OTP" />
        
        <GlassCard variant="carrier" style={{ padding: 32, textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--emerald)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Verify Delivery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            Enter the 4-digit OTP provided by the recipient and upload a photo of the signed delivery challan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Receiver OTP</label>
              <input type="text" placeholder="e.g. 8492" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-deep)', color: 'var(--text-primary)' }} />
            </div>

            <div style={{ border: '2px dashed var(--indigo)', borderRadius: 12, padding: 32, cursor: 'pointer', background: 'rgba(79, 70, 229, 0.05)' }}>
              <UploadCloud size={32} color="var(--indigo)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, color: 'var(--indigo)' }}>Upload Signed POD Image</div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>
              Verify & Complete Trip
            </button>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  )
}
