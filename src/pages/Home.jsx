import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LanguageContext'
import './Home.css'

const content = {
  en: {
    navLinks: ['Features', 'Pricing', 'About'],
    login: 'Log in',
    getStarted: 'Get Started',
    headlineLine1: 'Track every dollar.',
    headlineLine2: 'Simplify your future.',
    sub: 'Connect your accounts and see exactly where your money goes — budgets, goals, and reports, all in one place.',
    primaryCta: 'Go to Dashboard',
    secondaryCta: 'See how it works',
    welcome: 'Welcome back, Arsany',
    navItems: ['Dashboard', 'Transactions', 'Budget', 'Goals', 'Recurring'],
    totalIncome: 'TOTAL INCOME',
    totalSavings: 'TOTAL SAVINGS',
    mostSpending: 'MOST SPENDING',
    expenseActivity: 'Expense Activity',
    recentExpenses: 'Recent Expenses',
    peekLabel: 'MONTHLY SAVINGS',
    peekSub: '+12% this month',
    proofStats: [
      { value: '14,200+', label: 'people tracking finances' },
      { value: '$2.4M', label: 'tracked every month' },
      { value: '4.9/5', label: 'average rating' },
    ],
    featuresTitle: 'Everything you need, nothing you don\u2019t',
    features: [
      { title: 'Smart Tracking', text: 'Every transaction organized automatically, so you always know where your money goes.' },
      { title: 'Budget Alerts', text: 'Get notified before you overspend in a category — not after.' },
      { title: 'Goals', text: 'Set savings targets and watch your progress grow in real time.' },
      { title: 'Reports', text: 'Monthly reports that turn raw numbers into clear, actionable insight.' },
    ],
    finalCtaHeading: 'Start seeing your money clearly',
    finalCtaSub: 'No credit card required. Set up your first budget in under two minutes.',
    footer: 'FinTrack © 2026',
  },
  ar: {
    navLinks: ['المميزات', 'الأسعار', 'عن التطبيق'],
    login: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
    headlineLine1: 'تابع كل جنيه.',
    headlineLine2: 'بسّط مستقبلك المالي.',
    sub: 'اربط حساباتك وشوف فلوسك رايحة فين بالظبط — ميزانيات، أهداف، وتقارير، كل ده في مكان واحد.',
    primaryCta: 'اذهب إلى لوحة التحكم',
    secondaryCta: 'شوف إزاي بيشتغل',
    welcome: 'أهلاً بيك تاني، Arsany',
    navItems: ['لوحة التحكم', 'المعاملات', 'الميزانية', 'الأهداف', 'المتكررة'],
    totalIncome: 'إجمالي الدخل',
    totalSavings: 'إجمالي المدخرات',
    mostSpending: 'أعلى مصروف',
    expenseActivity: 'نشاط المصروفات',
    recentExpenses: 'أحدث المصروفات',
    peekLabel: 'مدخرات الشهر',
    peekSub: '+12% عن الشهر الماضي',
    proofStats: [
      { value: '14,200+', label: 'شخص بيتابعوا فلوسهم' },
      { value: '$2.4M', label: 'بيتتابعوا كل شهر' },
      { value: '4.9/5', label: 'متوسط التقييم' },
    ],
    featuresTitle: 'كل اللي محتاجه، من غير أي حاجة زيادة',
    features: [
      { title: 'تتبع ذكي', text: 'كل عملية بتتصنف تلقائيًا، عشان دايمًا تعرف فلوسك رايحة فين.' },
      { title: 'تنبيهات الميزانية', text: 'هتوصلك تنبيهات قبل ما تتجاوز ميزانية أي قسم، مش بعدها.' },
      { title: 'الأهداف', text: 'حدد أهداف ادخارك وشوف تقدمك بيزيد لحظة بلحظة.' },
      { title: 'التقارير', text: 'تقارير شهرية بتحول الأرقام لرؤية واضحة تقدر تتصرف بيها.' },
    ],
    finalCtaHeading: 'ابدأ تشوف فلوسك بوضوح',
    finalCtaSub: 'من غير أي بطاقة ائتمان. اعمل أول ميزانية في أقل من دقيقتين.',
    footer: 'FinTrack © 2026',
  },
}

export default function Home() {
  const { lang } = useLang()
  const t = content[lang] || content.en
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="home" dir={dir}>
      <nav className="home-nav">
        <div className="home-logo">
          <span className="home-logo-icon">$</span>
          FinTrack
        </div>
        <Link to="/dashboard" className="home-nav-cta">{t.getStarted}</Link>
      </nav>

      <section className="home-hero">
        <h1 className="home-headline">
          {t.headlineLine1}
          <br />
          {t.headlineLine2}
        </h1>
        <p className="home-sub">{t.sub}</p>
        <div className="home-cta-row">
          <Link to="/dashboard" className="home-cta-primary">{t.primaryCta}</Link>
          <Link to="/dashboard" className="home-cta-secondary">{t.secondaryCta}</Link>
        </div>
      </section>

      <section className="home-preview-wrap">
        <div className="home-glow" />

        <div className="home-dashboard">
          <div className="home-dashboard-topbar">
            <span className="home-dot home-dot-red" />
            <span className="home-dot home-dot-yellow" />
            <span className="home-dot home-dot-green" />
          </div>
          <div className="home-dashboard-body">
            <div className="home-dashboard-sidebar">
              {t.navItems.map((item, i) => (
                <div key={item} className={`home-dashboard-navitem${i === 0 ? ' active' : ''}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="home-dashboard-main">
              <div className="home-dashboard-welcome">{t.welcome}</div>

              <div className="home-stat-row">
                <div className="home-stat-card">
                  <span className="home-stat-label">{t.totalIncome}</span>
                  <span className="home-stat-value">$2,200</span>
                </div>
                <div className="home-stat-card">
                  <span className="home-stat-label">{t.totalSavings}</span>
                  <span className="home-stat-value accent">$2,000</span>
                </div>
                <div className="home-stat-card">
                  <span className="home-stat-label">{t.mostSpending}</span>
                  <span className="home-stat-value accent">Food</span>
                </div>
              </div>

              <div className="home-chart-row">
                <div className="home-chart-card">
                  <div className="home-chart-title">{t.expenseActivity}</div>
                  <svg className="home-chart-svg" viewBox="0 0 700 220" preserveAspectRatio="none">
                    <polyline
                      points="10,180 110,140 210,160 310,80 410,110 510,30 610,10 690,0"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="home-side-card">
                  <div className="home-chart-title">{t.recentExpenses}</div>
                  <div className="home-side-row"><span>Freelance</span><span>+$500</span></div>
                  <div className="home-side-row"><span>Freelance</span><span>+$500</span></div>
                  <div className="home-side-row"><span>Gift</span><span>+$200</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="home-peek-card">
          <span className="home-peek-label">{t.peekLabel}</span>
          <span className="home-peek-value">$1,340</span>
          <span className="home-peek-sub">{t.peekSub}</span>
        </div>
      </section>

      <section className="home-proof">
        {t.proofStats.map((s, i) => (
          <div className={`home-proof-chip home-proof-chip-${i}`} key={s.label}>
            <span className="home-proof-value">{s.value}</span>
            <span className="home-proof-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="home-features">
        <h2 className="home-features-title">{t.featuresTitle}</h2>
        <div className="home-features-grid">
          <div className="home-feature-tile tile-tracking">
            <div className="home-mini-list">
              {[
                { label: 'Groceries', amt: '-$64.20' },
                { label: 'Freelance', amt: '+$500.00' },
                { label: 'Netflix', amt: '-$15.99' },
              ].map((row) => (
                <div className="home-mini-row" key={row.label}>
                  <span className="home-mini-dot" />
                  <span className="home-mini-row-label">{row.label}</span>
                  <span className={`home-mini-row-amt${row.amt.startsWith('+') ? ' pos' : ''}`}>{row.amt}</span>
                </div>
              ))}
            </div>
            <h3>{t.features[0].title}</h3>
            <p>{t.features[0].text}</p>
          </div>

          <div className="home-feature-tile tile-budget">
            <div className="home-mini-budget">
              <div className="home-mini-budget-top">
                <span>Food</span>
                <span>82%</span>
              </div>
              <div className="home-mini-budget-bar">
                <div className="home-mini-budget-fill" />
              </div>
            </div>
            <h3>{t.features[1].title}</h3>
            <p>{t.features[1].text}</p>
          </div>

          <div className="home-feature-tile tile-goals">
            <div className="home-mini-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" className="ring-track" />
                <circle cx="40" cy="40" r="34" className="ring-fill" />
              </svg>
              <span className="home-mini-ring-value">64%</span>
            </div>
            <h3>{t.features[2].title}</h3>
            <p>{t.features[2].text}</p>
          </div>

          <div className="home-feature-tile tile-reports">
            <div className="home-mini-bars">
              {[40, 65, 30, 80, 55, 90].map((h, i) => (
                <span key={i} className="home-mini-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
            <h3>{t.features[3].title}</h3>
            <p>{t.features[3].text}</p>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="home-final-cta-text">
          <h2>{t.finalCtaHeading}</h2>
          <p>{t.finalCtaSub}</p>
          <Link to="/dashboard" className="home-cta-primary">{t.primaryCta}</Link>
        </div>
        <div className="home-final-cta-visual">
          <div className="home-final-glow" />
          <div className="home-mini-mockup">
            <span className="home-mini-mockup-label">New budget</span>
            <div className="home-mini-mockup-field">Groceries</div>
            <div className="home-mini-mockup-field">$400.00</div>
            <div className="home-mini-mockup-btn">{t.primaryCta}</div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <span>{t.footer}</span>
      </footer>
    </div>
  )
}