import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get Started →
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/opengrid/opengrid"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Blazing Fast',
    description:
      'Virtual scrolling renders only visible rows, handling 100,000+ rows at 60 fps without breaking a sweat.',
  },
  {
    title: 'Fully Typed',
    description:
      'First-class TypeScript support throughout. Generics on ColumnDef<TData> give you autocomplete on your data.',
  },
  {
    title: 'Headless Core',
    description:
      'The @opengrid/core package is framework-agnostic. Bring your own React, Vue, Svelte, or vanilla JS wrapper.',
  },
  {
    title: 'Feature Complete',
    description:
      'Sorting, filtering, grouping, aggregation, selection, column reordering/resizing/pinning, and CSV/Excel export.',
  },
  {
    title: 'Themeable',
    description:
      'Light and dark themes via CSS custom properties. Override any variable or write your own theme from scratch.',
  },
  {
    title: 'Open Source',
    description:
      'MIT licensed. No feature gates, no enterprise tier. Every feature is available to everyone.',
  },
];

export default function Home(): React.ReactElement {
  return (
    <Layout title="OpenGrid — Open-Source Enterprise Data Grid" description="A production-grade open-source alternative to AG Grid">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((f) => (
                <div key={f.title} className="col col--4" style={{ marginBottom: 32 }}>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
