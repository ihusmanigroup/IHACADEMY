require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://dolfyahvhqsszjzsjgsi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) { console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY in .env or env'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function mkTopic(id, title, duration, content) { return { topic_id: id, title, duration, content }; }

async function run() {
  try {
    const tables = ['lesson_completions','enrollments','quizzes','lessons','courses'];
    for (const t of tables) {
      try { const { error } = await supabase.from(t).delete().not('id','is','null'); if (error) console.warn(`Could not delete rows from ${t}:`, error.message || error); else console.log(`Requested delete from ${t}`); } catch (e) { console.warn(e); }
    }

    for (const t of tables) {
      try { const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' }); if (error) console.warn(`Count failed for ${t}:`, error.message || error); else console.log(`${t} count after delete:`, count ?? (data ? data.length : 0)); } catch (e) { console.warn(e); }
    }

    const courseData = {
      title: 'HTML & CSS Basics',
      description: 'Learn semantic HTML5 structure and modern CSS3 layout techniques to build responsive web pages.',
      category: 'Frontend',
      level: 'Beginner',
      xp_reward: 40,
      total_lessons: 2
    };

    const { data: courseInsert, error: courseError } = await supabase.from('courses').insert([courseData]).select('id').single();
    if (courseError) { console.error('Failed to insert course:', courseError); process.exit(1); }
    const courseId = courseInsert.id; console.log('Inserted course id:', courseId);

    // Lesson 1 topics (Semantic HTML5) — extended, one-page Anthropic-style content
    const l1 = [
      mkTopic('topic-1','Document Anatomy & HTML5 Standards','18 min', `# Document Anatomy & HTML5 Standards\n\nThis topic delivers a thorough exploration of the HTML document skeleton and the rationale behind each head-level construct. Correct document anatomy ensures predictable rendering across browsers and is the foundation for accessibility and SEO.\n\nWhy <!DOCTYPE html> matters\nThe <!DOCTYPE html> declaration tells browsers to render in standards mode. Omitting or mis-declaring it can cause legacy quirks mode rendering, leading to inconsistent box-model behavior.\n\nEssential head elements- \n- \`<meta charset="utf-8">\`: sets character encoding and prevents garbled text.\n- \`<meta name="viewport" content="width=device-width,initial-scale=1">\`: enables responsive scaling on mobile.\n- \`<title>\`: critical for user context and SEO.\n- Links to resources: stylesheets and preloads.\n\nMinimal example:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>My App</title>\n  <link rel="stylesheet" href="/styles.css">\n</head>\n<body>\n  <main id="app">\n    <!-- app root -->\n  </main>\n</body>\n</html>\n\`\`\``),

      mkTopic('topic-2','Semantic Layout Containers','18 min', `# Semantic Layout Containers\n\nSemantic HTML5 elements communicate intent to browsers, assistive technology, and search engines. This topic covers layout semantics and pragmatic patterns for structuring modern pages.\n\nCore elements and their uses\n- \`<header>\`: introductory content or site-level header.\n- \`<nav>\`: site or section navigation.\n- \`<main>\`: the primary content landmark — only one per page.\n- \`<article>\`: a self-contained composition that can be syndicated.\n- \`<section>\`: thematic groups of content.\n- \`<footer>\`: closing auxiliary information.\n\nExample template:\n\n\`\`\`html\n<body>\n  <header>Site header</header>\n  <nav>Primary navigation</nav>\n  <main>\n    <article>\n      <h1>Article title</h1>\n      <p>Article body...</p>\n    </article>\n    <section aria-labelledby="related">\n      <h2 id="related">Related</h2>\n    </section>\n  </main>\n  <footer>Footer content</footer>\n</body>\n\`\`\``),

      mkTopic('topic-3','Typography & Structured Content','18 min', `# Typography & Structured Content\n\nContent hierarchy and typographic rhythm drive readability. This topic explains heading semantics, lists, code blocks, and strategies for accessible typography.\n\nHeadings and document structure\n- Use headings (h1-h6) to express logical structure — one h1 per page ideally.\n- Screen readers and SEO both utilize heading structure to build context.\n\nCode and preformatted text\n- Use \`<pre><code class="language-js">\` for code blocks with proper lang attributes so syntax highlighters can apply.\n\nExample:\n\n\`\`\`html\n<article>\n  <h1>Understanding CSS Grid</h1>\n  <pre><code class="language-css">\n.container {\n  display: grid;\n  grid-template-columns: 1fr 3fr;\n}\n  </code></pre>\n</article>\n\`\`\``),

      mkTopic('topic-4','Interactive Forms & Accessibility','20 min', `# Interactive Forms & Accessibility\n\nForms are often the primary interaction surface. This topic provides a developer-focused walkthrough of accessible forms, validation, and real-world patterns.\n\nForm anatomy and labels\n- Always pair inputs with labels: \`<label for="email">Email</label>\`. For complex controls, use aria-describedby for additional guidance.\n\nExample accessible form:\n\n\`\`\`html\n<form novalidate>\n  <label for="email">Email address</label>\n  <input id="email" name="email" type="email" required aria-describedby="emailHelp">\n  <div id="emailHelp">We will only use your email for account recovery.</div>\n  <button type="submit">Submit</button>\n</form>\n\`\`\``)
    ];

    // Lesson 2 topics (CSS) — extended, one-page Anthropic-style content
    const l2 = [
      mkTopic('topic-1','CSS Syntax, Selectors, & The Cascade','20 min', `# CSS Syntax, Selectors, & The Cascade\n\nDeep mastery of CSS starts with selectors and the cascade. This topic covers selector types, specificity calculation, and practical strategies to avoid specificity conflicts in large codebases.\n\nSelector categories and examples\n\n- Element selectors: \`div\`, \`p\` — low specificity\n- Class selectors: \`.btn\`, \`.card\` — medium specificity\n- ID selectors: \`#main-header\` — higher specificity\n- Attribute selectors and pseudo-classes: \`[type="submit"]\`, \`:hover\` — medium specificity\n\nSpecificity rules (summary)\n\n1. Count ID selectors\n2. Count class/attribute/pseudo-class selectors\n3. Count element/pseudo-element selectors\n4. Later rules override earlier rules when specificity ties\n\nPractical design patterns\n\n- Use utility classes (.text-center, .mt-4) for predictable overrides\n- Use BEM-style component classes for isolated styling\n- Avoid !important except for utility reliability or third-party overrides\n\nExample:\n\n\`\`\`css\n/* base */\n.btn { padding: 8px 12px; }\n/* component */\n.btn--primary { background: blue; color: white; }\n/* page-specific override (avoid if possible) */\n#hero .btn--primary { background: darkblue; }\n\`\`\`\n\nKey takeaways\n\n- Keep specificity low and predictable.\\n- Compose styles with clear layering (base → component → utilities).`),

      mkTopic('topic-2','The CSS Box Model Masterclass','20 min', `# The CSS Box Model Masterclass\n\nThe box model governs layout. This topic explains how content, padding, border, and margin are composed and how \`box-sizing\` influences measurements.\n\nTwo models\n\n- Content-box (default): width/height apply to content only.\n- Border-box: width/height include padding and border — recommended for consistent sizing.\n\nPractical rules\n\n- Set global box-sizing:\n\n\`\`\`css\n*, *::before, *::after { box-sizing: border-box; }\n\`\`\`\n\n- Understand margin collapsing between block elements.\\n\nExample code:\n\n\`\`\`css\n.card { box-sizing: border-box; width: 300px; padding: 16px; border: 1px solid #ddd; }\n\`\`\`\n\nKey takeaways\n\n- Use border-box for reliable component sizing.\\n- Watch for margin collapsing; use padding or border to separate boxes when needed.`),

      mkTopic('topic-3','Deep Dive into Flexbox','22 min', `# Deep Dive into Flexbox\n\nFlexbox is designed for one-dimensional layouts. Learn container and item properties with practical examples for navbars, card rows, and equal height columns.\n\nCore container properties\n\n- display: flex; flex-direction; justify-content; align-items; flex-wrap; gap;\n\nCore item properties\n\n- flex-grow, flex-shrink, flex-basis; order; align-self\n\nExample — responsive row with equal-width items:\n\n\`\`\`css\n.container { display: flex; gap: 12px; }\n.item { flex: 1 1 200px; }\n\`\`\`\n\nCommon pitfalls\n\n- When flex items wrap, control the cross-axis with align-content.\\n- Reserve \`flex-basis\` for preferred sizing and \`flex: 1\` for equal distribution.\n\nKey takeaways\n\n- Flexbox is ideal for small-scale layouts (navs, toolbars).\\n- Combine with gap and flex-basis for robust responsive patterns.`),

      mkTopic('topic-4','Responsive Web Design & Media Queries','22 min', `# Responsive Web Design & Media Queries\n\nResponsive design adapts UI to device capabilities. This topic walks through a mobile-first strategy and practical breakpoints, plus fluid units for resilient layouts.\n\nMobile-first approach\n\n- Start with base (mobile) styles and layer media queries for larger screens.\\n\nBreakpoints and examples\n\n\`\`\`css\n:root { --container-padding: 1rem; }\n@media (min-width: 640px) { :root { --container-padding: 1.25rem; } }\n@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }\n\`\`\`\n\nResponsive images\n\n- Use `srcset` and `sizes` to deliver appropriate image resolutions.\\n\nTesting and performance\n\n- Test across multiple viewports and emulate slow networks to ensure UX holds.\\n\nKey takeaways\n\n- Prefer fluid units and CSS layout primitives over pixel hacks.\\n- Test and iterate across real devices.`)
    ];

    const lessonsToInsert = [
      { course_id: courseId, title: 'Semantic HTML5 & Modern Web Structure', content: JSON.stringify({ topics: l1 }), duration_mins: 40, lesson_order: 1 },
      { course_id: courseId, title: 'Modern CSS3 Styling, Flexbox, & Layouts', content: JSON.stringify({ topics: l2 }), duration_mins: 45, lesson_order: 2 }
    ];

    const { data: lessonsInserted, error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert).select('id');
    if (lessonsError) { console.error('Failed to insert lessons:', lessonsError); process.exit(1); }
    const lessonIds = (lessonsInserted || []).map(r => r.id); console.log('Inserted lessons ids:', lessonIds);

    // Final counts
    for (const t of tables) {
      try { const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' }); if (error) console.warn(`Count for ${t} failed:`, error.message || error); else console.log(`FINAL ${t} count:`, count ?? (data ? data.length : 0)); } catch (e) { console.warn(e); }
    }

    console.log('\n=== SUMMARY HTML & CSS COURSE ===');
    console.log('Course inserted:', courseId);
    console.log('Lessons inserted:', lessonIds.length);

  } catch (err) { console.error('Error during Supabase seed:', err.stack || err); process.exitCode = 1; }
}

run().catch(e => { console.error(e); process.exit(1); });