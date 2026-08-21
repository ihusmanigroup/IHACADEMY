require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dolfyahvhqsszjzsjgsi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) { console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY in .env or env'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function run() {
  try {
    const dataPath = path.join(__dirname, 'course-2-data.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const payload = JSON.parse(raw);

    const tables = ['lesson_completions','enrollments','quizzes','lessons','courses'];
    for (const t of tables) {
      try { const { error } = await supabase.from(t).delete().not('id','is','null'); if (error) console.warn(`Could not delete rows from ${t}:`, error.message || error); else console.log(`Requested delete from ${t}`); } catch (e) { console.warn(e); }
    }

    for (const t of tables) {
      try { const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' }); if (error) console.warn(`Count failed for ${t}:`, error.message || error); else console.log(`${t} count after delete:`, count ?? (data ? data.length : 0)); } catch (e) { console.warn(e); }
    }

    const courseData = payload.course;
    const { data: courseInsert, error: courseError } = await supabase.from('courses').insert([courseData]).select('id').single();
    if (courseError) { console.error('Failed to insert course:', courseError); process.exit(1); }
    const courseId = courseInsert.id; console.log('Inserted course id:', courseId);

    const lessonsToInsert = payload.lessons.map(l => ({ course_id: courseId, title: l.title, content: JSON.stringify({ topics: l.topics }), duration_mins: l.duration_mins, lesson_order: l.lesson_order }));

    const { data: lessonsInserted, error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert).select('id');
    if (lessonsError) { console.error('Failed to insert lessons:', lessonsError); process.exit(1); }
    const lessonIds = (lessonsInserted || []).map(r => r.id); console.log('Inserted lessons ids:', lessonIds);

    for (const t of tables) {
      try { const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' }); if (error) console.warn(`Count for ${t} failed:`, error.message || error); else console.log(`FINAL ${t} count:`, count ?? (data ? data.length : 0)); } catch (e) { console.warn(e); }
    }

    console.log('\n=== SUMMARY HTML & CSS COURSE ===');
    console.log('Course inserted:', courseId);
    console.log('Lessons inserted:', lessonIds.length);

  } catch (err) {
    console.error('Error during Supabase seed:', err.stack || err);
    process.exitCode = 1;
  }
}

run().catch(e => { console.error(e); process.exit(1); });