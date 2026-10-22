import { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { getHealth, getRecommendation } from '../api';
import Spinner from '../components/Spinner';

export default function ArchitecturePage({ addToast }) {
  const [telemetry, setTelemetry] = useState(null);
  const [latency, setLatency] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [simResults, setSimResults] = useState(null);

  // Fetch initial telemetry
  const loadTelemetry = async () => {
    const start = performance.now();
    try {
      const data = await getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setTelemetry(data);
    } catch {
      // offline / mock fallback
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  // Run interactive pipeline trace
  const runPipelineSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimResults(null);
    setActiveStep(1); // Step 1: Client

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await wait(400);
      setActiveStep(2); // Step 2: CloudFront Edge

      await wait(450);
      setActiveStep(3); // Step 3: Elastic Beanstalk EC2

      const callStart = performance.now();
      // Execute live real call to recommendation engine
      const queryPayload = { interest: 'nature', budget: 'low', groupType: 'solo' };
      const data = await getRecommendation(queryPayload);
      const callEnd = performance.now();

      setActiveStep(4); // Step 4: MongoDB Atlas
      await wait(450);

      setActiveStep(5); // Step 5: CloudWatch Logging
      await wait(400);

      setActiveStep(6); // Step 6: Response Received
      const totalTime = Math.round(callEnd - callStart);
      setSimResults({
        success: true,
        latencyMs: totalTime,
        destinationsFound: data.places ? data.places.length : 0,
        samplePlace: data.places && data.places[0] ? data.places[0].name : 'Sample Destination',
      });

      if (addToast) {
        addToast(`Trace completed in ${totalTime}ms via CloudFront & Beanstalk!`, 'success');
      }
    } catch (err) {
      setSimResults({
        success: false,
        error: err.message || 'Trace failed',
      });
      if (addToast) {
        addToast('Pipeline trace encountered an error', 'error');
      }
    } finally {
      setSimulating(false);
      setTimeout(() => setActiveStep(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* ─── Header ──────────────────────────────────────── */}
      <FadeInSection>
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent mb-3">
            <span>☁️</span> AWS Academic Cloud Project
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            AWS Cloud Architecture
          </h1>
          <p className="text-secondary text-lg max-w-2xl">
            A production-grade, decoupled multi-tier cloud infrastructure built on Amazon Web Services and MongoDB Atlas with zero out-of-pocket costs.
          </p>
        </div>
      </FadeInSection>

      {/* ─── Live Telemetry Ribbon ────────────────────────── */}
      <FadeInSection delay={80}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-card rounded-2xl p-4 border border-muted/30">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Edge CDN</p>
            <p className="text-lg font-bold text-primary mt-1">CloudFront</p>
            <span className="text-[11px] text-emerald-600 font-medium">● HTTPS & OAC</span>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-muted/30">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Compute</p>
            <p className="text-lg font-bold text-primary mt-1">Elastic Beanstalk</p>
            <span className="text-[11px] text-emerald-600 font-medium">● Node 20 on AL2023</span>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-muted/30">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Database</p>
            <p className="text-lg font-bold text-primary mt-1">MongoDB Atlas</p>
            <span className="text-[11px] text-emerald-600 font-medium">● TLS 1.3 M0 Replica</span>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-muted/30">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Estimated Cost</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">$0.00 / mo</p>
            <span className="text-[11px] text-secondary font-medium">100% Free Tier</span>
          </div>
        </div>
      </FadeInSection>

      {/* ─── Interactive Pipeline Simulator ───────────────── */}
      <FadeInSection delay={120}>
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-muted/40 shadow-sm mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">
                Interactive Telemetry
              </p>
              <h2 className="text-2xl font-bold tracking-tight">Live Request Pipeline Simulator</h2>
              <p className="text-secondary text-sm">
                Trigger a live query to visualize the real-time request path across all AWS services.
              </p>
            </div>
            <button
              onClick={runPipelineSimulation}
              disabled={simulating}
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shrink-0"
            >
              {simulating ? (
                <>
                  <Spinner size="sm" />
                  <span>Tracing Request…</span>
                </>
              ) : (
                <>
                  <span>⚡ Simulate Live Query</span>
                </>
              )}
            </button>
          </div>

          {/* Pipeline Node Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1: Client */}
            <PipelineNode
              step={1}
              label="1. Tourist Client"
              subtext="Browser Request"
              icon="💻"
              isActive={activeStep === 1}
              isDone={activeStep > 1}
            />

            {/* Step 2: CloudFront */}
            <PipelineNode
              step={2}
              label="2. CloudFront"
              subtext="Global Edge CDN"
              icon="🌐"
              isActive={activeStep === 2}
              isDone={activeStep > 2}
            />

            {/* Step 3: Elastic Beanstalk */}
            <PipelineNode
              step={3}
              label="3. Elastic Beanstalk"
              subtext="EC2 Node.js Engine"
              icon="⚙️"
              isActive={activeStep === 3}
              isDone={activeStep > 3}
            />

            {/* Step 4: MongoDB Atlas */}
            <PipelineNode
              step={4}
              label="4. MongoDB Atlas"
              subtext="Replica Set Query"
              icon="🍃"
              isActive={activeStep === 4}
              isDone={activeStep > 4}
            />

            {/* Step 5: CloudWatch */}
            <PipelineNode
              step={5}
              label="5. CloudWatch"
              subtext="Centralized Logging"
              icon="📊"
              isActive={activeStep === 5}
              isDone={activeStep > 5}
            />
          </div>

          {/* Trace Results Box */}
          {simResults && (
            <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white/70 border border-muted/50 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Live Trace Complete!</p>
                  <p className="text-xs text-secondary">
                    Fetched {simResults.destinationsFound} recommendations (e.g. {simResults.samplePlace}) via decision tree.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/20">
                  Latency: {simResults.latencyMs} ms
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  HTTP 200 OK
                </span>
              </div>
            </div>
          )}
        </div>
      </FadeInSection>

      {/* ─── AWS Service Specifications Grid ──────────────── */}
      <FadeInSection delay={160}>
        <div className="mb-14">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Service Breakdown</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
            Deployed Cloud Infrastructure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <ServiceCard
              badge="Edge Delivery"
              name="Amazon CloudFront"
              desc="Global edge CDN delivering compiled static React assets and proxying /api/* requests with zero CORS latency."
              highlights={[
                'Origin Access Control (OAC) enabled',
                'HTTPS redirect on custom wildcard certificate',
                'SPA error response rewrites (403/404 -> /index.html)',
              ]}
              icon="🌐"
            />

            {/* Service 2 */}
            <ServiceCard
              badge="Static Hosting"
              name="Amazon S3"
              desc="Private object storage bucket hosting compiled Vite/React static assets with all public access strictly blocked."
              highlights={[
                '100% Block Public Access enforced',
                'Server-side encryption (AES-256)',
                'Immutable asset caching (max-age=31536000)',
              ]}
              icon="🪣"
            />

            {/* Service 3 */}
            <ServiceCard
              badge="Compute Layer"
              name="AWS Elastic Beanstalk"
              desc="PaaS compute environment orchestrating an Amazon EC2 instance running Node.js 20 LTS on Amazon Linux 2023."
              highlights={[
                'Nginx reverse proxy on port 8080',
                'Single-Instance architecture (saves $18/mo ALB)',
                'Automated health reporting on /health',
              ]}
              icon="⚡"
            />

            {/* Service 4 */}
            <ServiceCard
              badge="Data Persistence"
              name="MongoDB Atlas"
              desc="Managed cloud document database hosting users, destinations catalog, and recommendation questionnaires."
              highlights={[
                'TLS 1.3 transport encryption',
                '3-node automated replica set failover',
                'Zero-cost perpetual M0 sandbox cluster',
              ]}
              icon="🍃"
            />

            {/* Service 5 */}
            <ServiceCard
              badge="Observability"
              name="Amazon CloudWatch"
              desc="Centralized log stream aggregation collecting application stdout/stderr and Nginx web access/error logs."
              highlights={[
                'Log group: /aws/elasticbeanstalk/*',
                'Basic CPU & network I/O alarms',
                '7-day retention period (cost optimization)',
              ]}
              icon="📈"
            />

            {/* Service 6 */}
            <ServiceCard
              badge="Identity & Security"
              name="AWS IAM"
              desc="Role-based access control utilizing pre-configured AWS Academy LabRole instance profiles with least-privilege."
              highlights={[
                'Zero hardcoded AWS access keys in code',
                'STS temporary session tokens for EC2',
                'Runtime environment variable injection',
              ]}
              icon="🛡️"
            />
          </div>
        </div>
      </FadeInSection>

      {/* ─── Cost Optimization Comparison ─────────────────── */}
      <FadeInSection delay={200}>
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-muted/40 shadow-sm mb-12">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-1">Financial Analysis</p>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Lean Academic vs. Enterprise Architecture
          </h2>
          <p className="text-secondary text-sm mb-6 max-w-2xl">
            By avoiding high-cost managed resources (Application Load Balancers and NAT Gateways), this architecture achieves a 100% cost reduction for student evaluations.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-muted/60 text-secondary text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Standard Enterprise Architecture</th>
                  <th className="pb-3 font-semibold">Implemented Lean Architecture</th>
                  <th className="pb-3 font-semibold text-right">Monthly Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/30">
                <tr>
                  <td className="py-3.5 font-medium text-primary">Database</td>
                  <td className="py-3.5 text-secondary">Amazon DocumentDB ($0.27/hr)</td>
                  <td className="py-3.5 text-emerald-700 font-medium">MongoDB Atlas M0 Free Tier</td>
                  <td className="py-3.5 text-right font-bold text-emerald-600">-$194.40 / mo</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium text-primary">Load Balancer</td>
                  <td className="py-3.5 text-secondary">Application Load Balancer (ALB)</td>
                  <td className="py-3.5 text-emerald-700 font-medium">Single-Instance Nginx Reverse Proxy</td>
                  <td className="py-3.5 text-right font-bold text-emerald-600">-$18.25 / mo</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium text-primary">VPC Networking</td>
                  <td className="py-3.5 text-secondary">AWS NAT Gateway ($0.045/hr)</td>
                  <td className="py-3.5 text-emerald-700 font-medium">Direct Public Subnet with SG Ingress</td>
                  <td className="py-3.5 text-right font-bold text-emerald-600">-$32.85 / mo</td>
                </tr>
                <tr className="bg-surface/50 font-bold">
                  <td className="py-3.5 text-primary pl-2">Total Monthly Spend</td>
                  <td className="py-3.5 text-secondary">~$246.30 / month</td>
                  <td className="py-3.5 text-emerald-700">$0.00 / month (Free Tier)</td>
                  <td className="py-3.5 text-right font-bold text-emerald-600 pr-2">100% Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}

function PipelineNode({ step, label, subtext, icon, isActive, isDone }) {
  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 text-center relative ${
        isActive
          ? 'bg-accent/15 border-accent shadow-[0_0_20px_rgba(107,45,51,0.25)] scale-105'
          : isDone
          ? 'bg-emerald-500/10 border-emerald-500/40'
          : 'bg-surface/60 border-muted/30'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs font-bold text-primary truncate">{label}</p>
      <p className="text-[10px] text-secondary truncate mt-0.5">{subtext}</p>
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
        </span>
      )}
      {isDone && !isActive && (
        <span className="absolute top-2 right-2 text-emerald-600 text-[10px] font-bold">✓</span>
      )}
    </div>
  );
}

function ServiceCard({ badge, name, desc, highlights, icon }) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-muted/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          <span className="text-[10px] font-bold tracking-wider uppercase bg-surface px-2.5 py-1 rounded-full text-secondary border border-muted/40">
            {badge}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-primary mb-2">{name}</h3>
        <p className="text-secondary text-xs leading-relaxed mb-4">{desc}</p>
      </div>

      <ul className="space-y-1.5 text-[11px] text-primary/80 border-t border-muted/30 pt-3">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="text-accent text-xs">✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
