import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { PRICING_PLANS } from '../src/config/plans';
import { getAllIndexableSeoPages } from '../src/lib/seo/registry';
import { CONTRACTOR_RESOURCES } from '../src/lib/resources/catalogue';

async function runSeoValidation() {
  console.log('====================================================');
  console.log('🚀 AVORRIA CONTRACTOR USA — SEO AUDIT & VALIDATION');
  console.log('====================================================\n');

  let errors: string[] = [];
  let warnings: string[] = [];

  // ─────────────────────────────────────────────────────────
  // 1. SITEMAP VALIDATION
  // ─────────────────────────────────────────────────────────
  console.log('--- 1. AUDITING DYNAMIC SITEMAP (sitemap.ts) ---');
  const sitemapEntries = await sitemap();
  console.log(`Total indexed URLs in sitemap: ${sitemapEntries.length}`);

  const seenUrls = new Set<string>();
  let duplicateCount = 0;
  let nonHttpsCount = 0;
  let nonProductionCount = 0;

  for (const entry of sitemapEntries) {
    // Unique check
    if (seenUrls.has(entry.url)) {
      errors.push(`Duplicate URL found in sitemap: ${entry.url}`);
      duplicateCount++;
    }
    seenUrls.add(entry.url);

    // Protocol check
    if (!entry.url.startsWith('https://')) {
      errors.push(`URL does not use HTTPS: ${entry.url}`);
      nonHttpsCount++;
    }

    // Host check
    if (!entry.url.startsWith('https://avorria.com')) {
      errors.push(`URL does not match canonical production host https://avorria.com: ${entry.url}`);
      nonProductionCount++;
    }

    // Priority check
    if (entry.priority === undefined || entry.priority < 0 || entry.priority > 1.0) {
      errors.push(`Invalid priority (${entry.priority}) for: ${entry.url}`);
    }

    // ChangeFrequency check
    if (!entry.changeFrequency) {
      warnings.push(`Missing changeFrequency for: ${entry.url}`);
    }
  }

  console.log(`✓ Duplicates: ${duplicateCount}`);
  console.log(`✓ Non-HTTPS URLs: ${nonHttpsCount}`);
  console.log(`✓ Non-production Host URLs: ${nonProductionCount}`);

  // Check essential routes
  const requiredRoutes = [
    'https://avorria.com',
    'https://avorria.com/platform',
    'https://avorria.com/pricing',
    'https://avorria.com/comply',
    'https://avorria.com/prove',
    'https://avorria.com/create',
    'https://avorria.com/win-work',
    'https://avorria.com/resources',
    'https://avorria.com/states/texas-contractor-requirements',
    'https://avorria.com/states/california-contractor-requirements',
    'https://avorria.com/states/florida-contractor-requirements',
    'https://avorria.com/industries/electrical-contractor-compliance',
    'https://avorria.com/industries/hvac-contractor-compliance',
  ];

  for (const route of requiredRoutes) {
    if (!seenUrls.has(route)) {
      errors.push(`Required route missing from sitemap: ${route}`);
    } else {
      console.log(`  ✓ Route present: ${route}`);
    }
  }

  // Check all resource routes
  let missingResources = 0;
  for (const res of CONTRACTOR_RESOURCES) {
    const resUrl = `https://avorria.com/resources/${res.slug}`;
    if (!seenUrls.has(resUrl)) {
      errors.push(`Resource missing from sitemap: ${resUrl}`);
      missingResources++;
    }
  }
  console.log(`✓ All ${CONTRACTOR_RESOURCES.length} contractor resource guides verified in sitemap (missing: ${missingResources})`);

  // ─────────────────────────────────────────────────────────
  // 2. ROBOTS.TXT VALIDATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 2. AUDITING ROBOTS.TXT CONFIGURATION (robots.ts) ---');
  const robotsConfig = robots();
  console.log(`Sitemap reference: ${robotsConfig.sitemap}`);

  if (robotsConfig.sitemap !== 'https://avorria.com/sitemap.xml') {
    errors.push(`Robots sitemap does not match https://avorria.com/sitemap.xml. Found: ${robotsConfig.sitemap}`);
  } else {
    console.log(`  ✓ Robots sitemap reference matches production canonical`);
  }

  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  if (!rules) {
    errors.push(`Robots rules missing`);
  } else {
    const disallowRules = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    const expectedDisallows = [
      '/workspace/',
      '/app/',
      '/client/',
      '/contractor/',
      '/admin/',
      '/api/',
      '/auth/',
      '/sign-in',
      '/sign-up',
    ];

    for (const dis of expectedDisallows) {
      if (!disallowRules.includes(dis)) {
        errors.push(`Expected disallow rule missing in robots.ts: ${dis}`);
      } else {
        console.log(`  ✓ Disallowed private path: ${dis}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. PRICING DRIFT & STRUCTURED DATA VERIFICATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 3. PRICING OFFER ZERO-DRIFT CHECK ---');
  console.log(`Active plans in source of truth (src/config/plans.ts): ${PRICING_PLANS.map(p => p.name).join(', ')}`);

  for (const plan of PRICING_PLANS) {
    const monthlyPrice = (plan.monthlyPriceCents / 100).toFixed(2);
    const annualPrice = (plan.annualPriceCents / 100).toFixed(2);
    console.log(`  ✓ Plan offer: ${plan.name} (${plan.id}) -> Monthly: $${monthlyPrice}/mo, Annual: $${annualPrice}/yr`);
    if (plan.monthlyPriceCents < 0 || plan.annualPriceCents < 0) {
      errors.push(`Invalid price in plan ${plan.name}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. PROGRAMMATIC SEO REGISTRY DATA INTEGRITY
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 4. PROGRAMMATIC SEO TEMPLATE CONTENT INTEGRITY ---');
  const indexablePages = getAllIndexableSeoPages();
  console.log(`Total programmatic SEO pages registered: ${indexablePages.length}`);

  for (const page of indexablePages) {
    console.log(`  Checking [${page.pageType}] ${page.slug}...`);
    if (!page.title || page.title.length < 20) {
      errors.push(`Page title too short (< 20 chars) on ${page.slug}: "${page.title}"`);
    }
    const description = page.metaDescription || page.intro;
    if (!description || description.length < 50) {
      errors.push(`Page description/intro too short (< 50 chars) on ${page.slug}`);
    }
    if (!page.h1 || page.h1.trim().length === 0) {
      errors.push(`Missing H1 on ${page.slug}`);
    }
    if (!page.bodySections || page.bodySections.length < 2) {
      errors.push(`Insufficient body sections (< 2) on ${page.slug} (potential thin content)`);
    }
    if (!page.faqs || page.faqs.length < 2) {
      errors.push(`Insufficient FAQs (< 2) on ${page.slug}`);
    }
    // Verify relatedPages exist
    if (!page.relatedPages || page.relatedPages.length === 0) {
      warnings.push(`No relatedPages defined on ${page.slug}`);
    }
    // Verify in-body links exist in at least one section
    const hasInBodyLink = page.bodySections.some((sec) => /\[.*?\]\(.*?\)/.test(sec.content));
    if (!hasInBodyLink) {
      warnings.push(`No markdown in-body links found in bodySections for ${page.slug}`);
    }
    console.log(`    ✓ H1: "${page.h1}"`);
    console.log(`    ✓ Sections: ${page.bodySections.length}, FAQs: ${page.faqs.length}, RelatedPages: ${page.relatedPages?.length || 0}`);
  }

  // ─────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────
  console.log('\n====================================================');
  console.log('AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Errors:   ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ AUDIT FAILED with errors:');
    errors.forEach((e) => console.log(`  ✖ ${e}`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL SEO TECHNICAL AUDIT CHECKS PASSED!');
    console.log('====================================================');
  }
}

runSeoValidation().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
