---
# https://vitepress.dev/reference/default-theme-home-page
layout: page
sidebar: false
title: "UJL Framework"
description: "UJL is an AI-native framework that generates accessible, on-brand UI from structured content and design rules."
---

<CustomHero
  name="UJL Framework"
  text="No more off-brand websites."
  tagline="An AI-native framework that generates accessible, on-brand UI from structured content and design rules. Brand compliance and WCAG accessibility are built in, not bolted on."
  :image="{ src: '/assets/logo-icon.png', alt: 'UJL Framework' }"
  install-command="npm install @ujl-framework/crafter"
  install-title="Get Started in Seconds"
  :actions="[
    { theme: 'brand', text: 'Getting Started', link: '/guide/quickstart#install' },
    { theme: 'alt', text: 'Live Demo', link: '/guide/quickstart#demo' }
  ]"
/>

<FeatureGrid :columns="2">
  <FeatureCard
    icon="Palette"
    title="Brand Compliance by Design"
    description="Design changes apply globally and instantly. Editors compose content freely within guardrails they cannot override. No more design drift."
  />
  <FeatureCard
    icon="Accessibility"
    title="Accessibility Guaranteed"
    description="WCAG contrast ratios and semantic HTML are enforced architecturally. Accessibility is built into every output, not verified after the fact."
  />
  <FeatureCard
    icon="Sparkles"
    title="AI-Native"
    description="Structured JSON is optimized for language models. Schema validation ensures AI-generated content is always compliant. Small models, big results."
  />
  <FeatureCard
    icon="PackageOpen"
    title="Open Source and Integrable"
    description="MIT licensed and framework-agnostic. Embed the full editor anywhere, or use the lean Svelte adapter inside your own stack."
  />
</FeatureGrid>
