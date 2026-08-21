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

    const l1 = [
      mkTopic('topic-1','Document Anatomy & HTML5 Standards','18 min', 'Deep read: Document anatomy, DOCTYPE, meta charset, viewport. Example: <!DOCTYPE html> and head structure.'),
      mkTopic('topic-2','Semantic Layout Containers','18 min', 'Deep read: header, nav, main, article, section, footer and ARIA landmarks. Template examples and use cases.'),
      mkTopic('topic-3','Typography & Structured Content','18 min', 'Deep read: headings, lists, code blocks, rem units, line-length and accessibility best practices.'),
      mkTopic('topic-4','Interactive Forms & Accessibility','20 min', 'Deep read: form anatomy, labels, aria-describedby, validation strategies, keyboard support.')
    ];

    const l2 = [
      mkTopic('topic-1','CSS Syntax, Selectors, & The Cascade','20 min', 'Deep read: selectors, specificity, cascade, best practices (BEM, utility classes).'),
      mkTopic('topic-2','The CSS Box Model Masterclass','20 min', 'Deep read: box model, box-sizing border-box, margin collapse, layout tips.'),
      mkTopic('topic-3','Deep Dive into Flexbox','22 min', 'Deep read: flex container/item properties, examples for responsive navbars and card rows.'),
      mkTopic('topic-4','Responsive Web Design & Media Queries','22 min', 'Deep read: mobile-first approach, breakpoints, fluid units, responsive images (srcset).')
    ];

    const lessonsToInsert = [
      { course_id: courseId, title: 'Semantic HTML5 & Modern Web Structure', content: JSON.stringify({ topics: l1 }), duration_mins: 40, lesson_order: 1 },
      { course_id: courseId, title: 'Modern CSS3 Styling, Flexbox, & Layouts', content: JSON.stringify({ topics: l2 }), duration_mins: 45, lesson_order: 2 }
    ];

    const { data: lessonsInserted, error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert).select('id');
    if (lessonsError) { console.error('Failed to insert lessons:', lessonsError); process.exit(1); }
    const lessonIds = (lessonsInserted || []).map(r => r.id); console.log('Inserted lessons ids:', lessonIds);

    for (const t of tables) {
      try { const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' }); if (error) console.warn(`Count for ${t} failed:`, error.message || error); else console.log(`FINAL ${t} count:`, count ?? (data ? data.length : 0)); } catch (e) { console.warn(e); }
    }

    console.log('\n=== SUMMARY HTML & CSS COURSE ===');
    console.log('Course inserted:', courseId);
    console.log('Lessons inserted:', lessonIds.length);

  } catch (err) { console.error('Error during Supabase seed:', err.stack || err); process.exitCode = 1; }
}

run().catch(e => { console.error(e); process.exit(1); });