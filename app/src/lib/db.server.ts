// Postgres (Neon) data layer exposing a D1-compatible surface —
// prepare(sql).bind(...).first()/all()/run() — so the query code written
// against SQLite/D1 runs unchanged. Differences bridged here:
//   * ?N placeholders -> $N
//   * datetime('now') -> utc_now_text() (a tiny SQL helper created below)
// Schema + seed run lazily once per process (memoized promise).
import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;

export type DbStatement = {
  bind: (...args: unknown[]) => BoundStatement;
  first: <T = Row>() => Promise<T | null>;
  all: <T = Row>() => Promise<{ results: T[] }>;
  run: () => Promise<void>;
};

type BoundStatement = Omit<DbStatement, "bind">;

export type Db = { prepare: (sql: string) => DbStatement };

function translate(sql: string): string {
  return sql.replace(/\?(\d+)/g, "$$$1").replace(/datetime\('now'\)/g, "utc_now_text()");
}

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let initPromise: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  if (!initPromise) initPromise = init();
  return initPromise;
}

async function init(): Promise<void> {
  const sql = client();
  await sql.query(`
    CREATE OR REPLACE FUNCTION utc_now_text() RETURNS text AS
    $fn$ SELECT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS') $fn$
    LANGUAGE SQL STABLE;
  `);
  const ddl = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      phone TEXT,
      address_street TEXT,
      address_city TEXT,
      address_state TEXT,
      address_zip TEXT,
      pref_email INTEGER NOT NULL DEFAULT 1,
      pref_sms INTEGER NOT NULL DEFAULT 0,
      pref_mail INTEGER NOT NULL DEFAULT 1,
      pref_paperless INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT utc_now_text()
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT utc_now_text(),
      expires_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS reset_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      purpose TEXT NOT NULL DEFAULT 'password_reset',
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT utc_now_text(),
      expires_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS plans (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      plan_type TEXT NOT NULL,
      tier TEXT NOT NULL,
      name TEXT NOT NULL,
      carrier TEXT NOT NULL,
      monthly_premium REAL NOT NULL,
      deductible REAL NOT NULL,
      oop_max REAL NOT NULL,
      network TEXT NOT NULL,
      hsa_eligible INTEGER NOT NULL DEFAULT 0,
      features TEXT NOT NULL,
      description TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      status TEXT NOT NULL DEFAULT 'pending_payment',
      effective_date TEXT NOT NULL,
      monthly_premium REAL NOT NULL,
      members INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT utc_now_text(),
      activated_at TEXT,
      cancelled_at TEXT,
      cancel_reason TEXT,
      reinstated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      kind TEXT NOT NULL DEFAULT 'binder',
      card_brand TEXT NOT NULL,
      card_last4 TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'succeeded',
      paid_at TEXT NOT NULL DEFAULT utc_now_text()
    )`,
    `CREATE TABLE IF NOT EXISTS brokers (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      agency TEXT NOT NULL,
      license_no TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      languages TEXT NOT NULL,
      specialties TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payments(enrollment_id)`,
    `CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(plan_type)`,
  ];
  for (const statement of ddl) await sql.query(statement);

  const planCount = await sql.query(`SELECT COUNT(*)::int AS n FROM plans`);
  if ((planCount as Row[])[0]?.n === 0) {
    await sql.query(`INSERT INTO plans (plan_type, tier, name, carrier, monthly_premium, deductible, oop_max, network, hsa_eligible, features, description) VALUES
('health','Bronze','Evergreen Essential Bronze','Evergreen Health',289.00,7500,9200,'HMO',1,'["Free preventive care","Telehealth $0 visits","HSA-eligible","Generic drugs from $3"]','A lower-premium plan for members who mainly want protection from big medical bills and are comfortable with a higher deductible.'),
('health','Bronze','Blue Summit Bronze 7000','Blue Summit',312.00,7000,9100,'PPO',0,'["Out-of-network coverage","Free preventive care","24/7 nurse line","National network"]','A PPO bronze plan with out-of-network flexibility and a broad national network.'),
('health','Silver','Evergreen Balance Silver','Evergreen Health',398.00,4200,8700,'HMO',0,'["$30 primary care visits","Free preventive care","Telehealth $0 visits","Eligible for cost-sharing reductions"]','Our most popular tier: moderate premiums and moderate costs when you need care. Silver plans can qualify for cost-sharing reductions.'),
('health','Silver','Blue Summit Silver 4500','Blue Summit',421.00,4500,8500,'PPO',0,'["Out-of-network coverage","$35 primary care visits","Specialist without referral","National network"]','A flexible silver PPO for members who want to see specialists without referrals.'),
('health','Silver','Harbor Choice Silver','Harbor Mutual',385.00,4000,8600,'EPO',0,'["$25 primary care visits","Free generic drugs","Maternity and newborn care","Local network focus"]','A community-focused EPO silver plan with low copays and free generic prescriptions.'),
('health','Gold','Evergreen Complete Gold','Evergreen Health',512.00,1500,7000,'HMO',0,'["$15 primary care visits","Low $1,500 deductible","Free preventive and telehealth","Low-cost specialist visits"]','Higher premium, much lower out-of-pocket costs: a fit for members who see doctors regularly.'),
('health','Gold','Blue Summit Gold 1200','Blue Summit',548.00,1200,6800,'PPO',0,'["Out-of-network coverage","$20 primary care visits","Low $1,200 deductible","National network"]','A rich gold PPO with one of the lowest deductibles on the marketplace.'),
('health','Gold','Harbor Complete Gold','Harbor Mutual',495.00,1750,7200,'EPO',0,'["$10 primary care visits","Free mental health visits","Free generic drugs","Local network focus"]','Gold coverage with standout mental health benefits and $10 primary care.'),
('health','Platinum','Evergreen Premier Platinum','Evergreen Health',689.00,0,3500,'HMO',0,'["$0 deductible","$5 primary care visits","Lowest out-of-pocket maximum","Free preventive, telehealth, generics"]','Our richest plan: no deductible and the lowest possible out-of-pocket exposure.'),
('health','Platinum','Blue Summit Platinum 0','Blue Summit',725.00,0,3200,'PPO',0,'["$0 deductible","Out-of-network coverage","$10 primary care visits","National network"]','Platinum PPO protection for members who want maximum coverage and flexibility.'),
('dental','Low','BrightSmile Basic','BrightSmile Dental',19.50,75,0,'PPO',0,'["100% preventive cleanings","2 exams per year","Basic fillings covered 60%","No waiting period for preventive"]','Affordable preventive-first dental coverage: cleanings, exams, and x-rays covered in full.'),
('dental','High','BrightSmile Complete','BrightSmile Dental',34.00,50,0,'PPO',0,'["100% preventive cleanings","Fillings covered 80%","Crowns and root canals 50%","Orthodontia discounts"]','Comprehensive dental including major services like crowns and root canals.'),
('dental','Low','Pearl Preventive','Pearl Dental',16.75,100,0,'HMO',0,'["100% preventive cleanings","Low fixed copays","No annual maximum on preventive","Large local network"]','A budget-friendly dental HMO focused on keeping checkups free.'),
('dental','High','Pearl Complete Family','Pearl Dental',29.90,60,0,'HMO',0,'["100% preventive cleanings","Fillings covered 80%","Child orthodontia 50%","Family-size pricing"]','Family dental coverage with pediatric orthodontia benefits.'),
('dental','High','Cascade Dental Plus','Cascade Dental',31.25,50,0,'PPO',0,'["100% preventive cleanings","Fillings covered 80%","Major services 50%","See any licensed dentist"]','Open-network dental PPO: keep your dentist and get major-services coverage.')`);
  }

  const brokerCount = await sql.query(`SELECT COUNT(*)::int AS n FROM brokers`);
  if ((brokerCount as Row[])[0]?.n === 0) {
    await sql.query(`INSERT INTO brokers (name, agency, license_no, city, state, zip, phone, email, languages, specialties) VALUES
('Maria Alvarez','Summit Benefits Group','LIC-204815','Riverton','CA','94012','(555) 204-8151','maria@summitbenefits.example','English, Spanish','health,dental'),
('David Chen','Golden Gate Insurance Partners','LIC-118992','San Mateo','CA','94401','(555) 118-9292','dchen@ggpartners.example','English, Mandarin','health'),
('Aisha Thompson','Harborview Advisors','LIC-330271','Oakland','CA','94607','(555) 330-2711','aisha@harborview.example','English','health,dental'),
('James O''Neill','O''Neill Family Insurance','LIC-552904','Sacramento','CA','95814','(555) 552-9041','jim@oneillfamily.example','English','health'),
('Lucia Fernandez','Valley Coverage Co.','LIC-671133','Fresno','CA','93701','(555) 671-1332','lucia@valleycoverage.example','English, Spanish','health,dental'),
('Kenji Watanabe','Pacific Bridge Brokerage','LIC-789456','San Jose','CA','95112','(555) 789-4561','kenji@pacificbridge.example','English, Japanese','dental'),
('Sarah Goldberg','Bright Path Benefits','LIC-845620','Los Angeles','CA','90012','(555) 845-6202','sarah@brightpath.example','English','health,dental'),
('Omar Haddad','Crescent Insurance Services','LIC-902238','San Diego','CA','92101','(555) 902-2381','omar@crescentins.example','English, Arabic','health'),
('Emily Tran','Lotus Benefits Agency','LIC-114477','Garden Grove','CA','92840','(555) 114-4772','emily@lotusbenefits.example','English, Vietnamese','health,dental'),
('Robert Miller','Miller & Associates','LIC-236901','Bakersfield','CA','93301','(555) 236-9013','rob@millerassoc.example','English','dental'),
('Priya Nair','Sunrise Coverage Group','LIC-347812','Irvine','CA','92602','(555) 347-8124','priya@sunrisecoverage.example','English, Hindi, Malayalam','health,dental'),
('Grace Kim','Beacon Hill Insurance','LIC-458923','Riverside','CA','92501','(555) 458-9235','grace@beaconhill.example','English, Korean','health')`);
  }
}

function makeBound(sqlText: string, args: unknown[]): BoundStatement {
  const text = translate(sqlText);
  const exec = async (): Promise<Row[]> => {
    await ensureSchema();
    const rows = await client().query(text, args);
    return rows as Row[];
  };
  return {
    first: async <T = Row>() => ((await exec())[0] as T | undefined) ?? null,
    all: async <T = Row>() => ({ results: (await exec()) as T[] }),
    run: async () => {
      await exec();
    },
  };
}

export const db: Db = {
  prepare(sqlText: string): DbStatement {
    const unbound = makeBound(sqlText, []);
    return {
      bind: (...args: unknown[]) => makeBound(sqlText, args),
      ...unbound,
    };
  },
};
