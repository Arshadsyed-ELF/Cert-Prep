import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing-page">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <nav className="landing-nav" aria-label="Primary navigation">
        <Link to="/" className="landing-brand" onClick={closeMenu} aria-label="CertPrep home">
          <span className="landing-brand-mark">C</span>
          <span>cert<span>prep</span></span>
        </Link>
        <button className="landing-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className={`landing-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#benefits" onClick={closeMenu}>Why CertPrep</a>
          <Link to="/login" className="landing-login-link" onClick={closeMenu}>Log in</Link>
          <Link to="/login" className="landing-nav-cta" onClick={closeMenu}>Get started <span>→</span></Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><i /> YOUR SMARTER STUDY COMPANION</p>
          <h1>Get ready to<br /><em>pass with confidence.</em></h1>
          <p className="landing-description">Build the knowledge and calm you need for test day with focused practice that adapts to you.</p>
          <div className="landing-hero-actions">
            <Link to="/login" className="landing-primary-button">Start practising <span>→</span></Link>
            <a href="#how-it-works" className="landing-play-link"><b>▶</b> See how it works</a>
          </div>
          <div className="landing-trust"><div className="landing-avatars"><span>R</span><span>S</span><span>A</span><span>+</span></div><p>Join <strong>10,000+ learners</strong><br />preparing with CertPrep</p></div>
        </div>

        <div className="landing-visual" aria-label="Interactive practice question preview">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-card">
            <div className="landing-card-top"><div><span className="landing-card-label">TODAY&apos;S PRACTICE</span><div className="landing-progress"><i /></div></div><span className="landing-question-count">03 <b>/ 10</b></span></div>
            <div className="landing-card-body"><p className="landing-category">CONCEPT CHECK</p><h2>Which strategy helps you retain information most effectively?</h2>
              <div className="landing-options">
                {['Cramming the night before', 'Reviewing at spaced intervals', 'Reading notes once'].map((answer, index) => <button key={answer} onClick={() => setSelectedAnswer(index)} className={selectedAnswer === index ? 'selected' : ''}><span>{String.fromCharCode(65 + index)}</span>{answer}<b>{selectedAnswer === index ? '✓' : ''}</b></button>)}
              </div>
            </div>
            <div className="landing-card-footer"><span>⌁  Adaptive learning</span><button onClick={() => setSelectedAnswer(null)}>Next question <b>→</b></button></div>
          </div>
          <div className="landing-score-pill"><span>✦</span><div><small>STREAK</small><strong>7 days</strong></div></div>
          <div className="landing-ready-card"><span>↗</span><div><small>READINESS</small><strong>82% <i>↑ 12%</i></strong></div></div>
        </div>
      </section>

      <section className="landing-feature-strip" id="benefits">
        <div><span>◈</span><p><b>Targeted practice</b>Questions that mirror your exam</p></div>
        <div><span>⌁</span><p><b>Learn your way</b>Study on any device, anytime</p></div>
        <div><span>↗</span><p><b>See real progress</b>Insights that keep you moving</p></div>
      </section>

      <section className="landing-how" id="how-it-works">
        <p className="landing-eyebrow"><i /> SIMPLE BY DESIGN</p>
        <h2>A clearer path to exam day.</h2>
        <div className="landing-steps">
          <article><b>01</b><h3>Choose your focus</h3><p>Start with a subject or skill that matters most to your goal.</p></article>
          <article><b>02</b><h3>Practice with purpose</h3><p>Build momentum with bite-sized, relevant questions.</p></article>
          <article><b>03</b><h3>Walk in prepared</h3><p>Use your progress to know exactly where you stand.</p></article>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
