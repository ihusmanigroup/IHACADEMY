/**
 * IH Academy — Course 1: Git & GitHub for Beginners
 *
 * Usage:
 *   node scripts/insert-course-1-git-github.js
 */

const { Pool } = require('pg')

// Explicit connection parameters
const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false }
}

// ============================================================
// COURSE 1: Git & GitHub for Beginners
// ============================================================

const courseData = {
  title: "Git & GitHub for Beginners",
  description: "Master version control from fundamental CLI commands to collaborative branching, pull requests, and GitHub workflows.",
  category: "Fundamentals",
  level: "Beginner",
  pricing_type: "Free",
  xp_reward: 50,
  thumbnail_url: null,
  lessons: [
    {
      title: "Version Control Fundamentals & Core Git CLI",
      content: `# Version Control Fundamentals & Core Git CLI

## Topic 1: Introduction to Distributed Version Control Systems (DVCS)

### Why Git is Essential for Modern Software Engineering

Version control is the backbone of professional software development. Git enables teams to collaborate seamlessly, track every change, and maintain a complete history of project evolution. Without version control, collaboration becomes chaotic—files get overwritten, changes are lost, and debugging becomes nearly impossible.

Git's distributed architecture revolutionized how developers work. Unlike centralized systems where a single server holds the "truth," Git gives every developer a complete copy of the entire project history. This means you can commit, branch, and merge offline, with full confidence that your work is safe.

### Centralized vs Distributed Architectures

**Centralized Version Control (CVCS) - e.g., SVN:**
```
                    +-------------+
                    |   Server    |
                    |  (Single    |
                    |   Source)   |
                    +------+------+
                           |
           +---------------+---------------+
           |               |               |
    +------+------+ +------+------+ +------+------+
    |  Client A   | |  Client B   | |  Client C   |
    +-------------+ +-------------+ +-------------+
```