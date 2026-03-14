import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type FacilitySeed = {
  name: string
  location: string
  description: string
}

type EquipmentSeed = {
  name: string
  type: string
  health_score: number
  status: 'healthy' | 'warning' | 'critical'
  location_zone: string
  facilityName: string
}

type SensorSeed = {
  equipment_id: string
  type: 'vibration' | 'temperature' | 'pressure' | 'rpm'
  unit: string
  min_threshold: number
  max_threshold: number
  is_active: boolean
}

type AlertSeed = {
  equipmentName: string
  type: string
  severity: 'critical' | 'major' | 'minor' | 'info'
  title: string
  message: string
  status: 'new' | 'acknowledged' | 'resolved'
  created_at: string
  acknowledged_at?: string | null
}

type WorkOrderSeed = {
  equipmentName: string
  predictionEquipmentName?: string
  predictionFailureType?: string
  alertTitle?: string
  title: string
  description: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to_name: string | null
  due_date: string | null
  completed_at: string | null
  estimated_cost: number
  actual_cost: number | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

type MaintenanceSeed = {
  equipmentName: string
  workOrderTitle?: string
  type: 'preventive' | 'corrective' | 'predictive'
  description: string
  performed_by_name: string
  cost: number
  downtime_hours: number
  performed_at: string
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function randomDateBetween(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

async function safeDelete(table: string) {
  const { error } = await supabase.from(table).delete().not('id', 'is', null)
  if (error) {
    console.error(`[delete:${table}]`, error.message)
    return false
  }
  console.log(`[delete:${table}] ok`)
  return true
}

async function safeInsert<T extends Record<string, unknown>>(table: string, rows: T[]) {
  if (rows.length === 0) return [] as T[]
  const { data, error } = await supabase.from(table).insert(rows).select()
  if (error) {
    console.error(`[insert:${table}]`, error.message)
    return [] as T[]
  }
  return (data ?? []) as T[]
}

async function safeInsertBatched<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  batchSize = 500
) {
  const out: T[] = []
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize)
    const inserted = await safeInsert(table, chunk)
    out.push(...inserted)
  }
  return out
}

function buildSensorBlueprint(equipmentType: string) {
  const vibrationMax = equipmentType === 'Compressor' ? 7 : 10
  const base: Omit<SensorSeed, 'equipment_id'>[] = [
    {
      type: 'vibration',
      unit: 'mm/s',
      min_threshold: 0,
      max_threshold: vibrationMax,
      is_active: true,
    },
    {
      type: 'temperature',
      unit: '°C',
      min_threshold: 20,
      max_threshold: 85,
      is_active: true,
    },
  ]

  if (equipmentType === 'Motor' || equipmentType === 'Generator') {
    base.push({
      type: 'rpm',
      unit: 'RPM',
      min_threshold: 500,
      max_threshold: 3600,
      is_active: true,
    })
  } else {
    base.push({
      type: 'pressure',
      unit: 'PSI',
      min_threshold: 30,
      max_threshold: 150,
      is_active: true,
    })
  }

  return base
}

function generateReadingValue(
  sensor: { type: string; min_threshold: number | null; max_threshold: number | null },
  equipmentStatus: 'healthy' | 'warning' | 'critical',
  index: number,
  total: number
) {
  const max = sensor.max_threshold ?? (sensor.type === 'rpm' ? 3600 : 100)
  const min = sensor.min_threshold ?? 0
  const progress = index / Math.max(total - 1, 1)
  const recent14 = progress >= 16 / 30
  const recent7 = progress >= 23 / 30

  if (equipmentStatus === 'healthy') {
    const center = min + (max - min) * 0.45
    const noise = (max - min) * 0.08
    return clamp(center + rand(-noise, noise), min * 0.9, max * 0.72)
  }

  if (equipmentStatus === 'warning') {
    if (sensor.type === 'vibration' && recent14) {
      const start = 4
      const end = Math.min(7, max * 0.9)
      const local = (progress - 16 / 30) / (14 / 30)
      return clamp(start + (end - start) * local + rand(-0.25, 0.3), min, max * 0.92)
    }
    const baseline = min + (max - min) * 0.52
    const trend = recent14 ? (max - min) * 0.18 * ((progress - 16 / 30) / (14 / 30)) : 0
    return clamp(baseline + trend + rand(-(max - min) * 0.05, (max - min) * 0.05), min, max * 0.9)
  }

  const baseline = min + (max - min) * 0.58
  if (!recent7) {
    return clamp(
      baseline + rand(-(max - min) * 0.07, (max - min) * 0.1),
      min,
      max * 0.88
    )
  }

  const local = (progress - 23 / 30) / (7 / 30)
  const spike = (max - min) * (0.25 + 0.35 * local)
  return clamp(
    baseline + spike + rand((max - min) * 0.05, (max - min) * 0.22),
    min,
    max * 1.25
  )
}

const DEMO_USERS = [
  {
    email: 'manager@predictiq.demo',
    password: 'demo1234',
    full_name: 'David Chen',
    role: 'manager',
    facilityName: 'Riverside Manufacturing Plant',
  },
  {
    email: 'tech@predictiq.demo',
    password: 'demo1234',
    full_name: 'Mike Torres',
    role: 'technician',
    facilityName: 'Riverside Manufacturing Plant',
  },
  {
    email: 'admin@predictiq.demo',
    password: 'demo1234',
    full_name: 'Sarah Kim',
    role: 'admin',
    facilityName: null,
  },
] as const

async function cleanDemoUsers() {
  const { data } = await supabase.auth.admin.listUsers()
  if (!data?.users) return
  const demoUsers = data.users.filter((u) => u.email?.endsWith('@predictiq.demo'))
  for (const user of demoUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) {
      console.error(`[delete user ${user.email}]`, error.message)
    } else {
      console.log(`[delete user ${user.email}] ok`)
    }
  }
}

async function createDemoUsers(facilityIdByName: Map<string, string>) {
  const userIds: Record<string, string> = {}

  for (const u of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    })

    if (error) {
      console.error(`[create user ${u.email}]`, error.message)
      continue
    }

    const userId = data.user.id
    userIds[u.full_name] = userId
    console.log(`[create user ${u.email}] ok (${userId})`)

    // Create profile row (no trigger exists)
    const facilityId = u.facilityName ? facilityIdByName.get(u.facilityName) ?? null : null
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: u.full_name,
      role: u.role,
      facility_id: facilityId,
    })
    if (profileError) {
      console.error(`[profile ${u.email}]`, profileError.message)
    }
  }

  return userIds
}

async function seed() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const counters: Record<string, number> = {
    users: 0,
    facilities: 0,
    equipment: 0,
    sensors: 0,
    sensor_readings: 0,
    predictions: 0,
    alerts: 0,
    work_orders: 0,
    maintenance_history: 0,
  }

  // ── Clean existing data ────────────────────────────────────
  // Optional FK safety in case profiles reference facilities.
  const { error: profileDetachError } = await supabase
    .from('profiles')
    .update({ facility_id: null })
    .not('id', 'is', null)
  if (profileDetachError) {
    console.warn('[profiles detach] skipped:', profileDetachError.message)
  }

  await safeDelete('maintenance_history')
  await safeDelete('work_orders')
  await safeDelete('alerts')
  await safeDelete('predictions')
  await safeDelete('sensor_readings')
  await safeDelete('sensors')
  await safeDelete('equipment')
  await safeDelete('facilities')
  await cleanDemoUsers()

  // ── Facilities ─────────────────────────────────────────────
  const facilities: FacilitySeed[] = [
    {
      name: 'Riverside Manufacturing Plant',
      location: 'Detroit, MI',
      description: 'Primary machining and heavy fabrication site.',
    },
    {
      name: 'Lakewood Assembly Center',
      location: 'Chicago, IL',
      description: 'High-volume assembly and packaging operation.',
    },
  ]

  const insertedFacilities = await safeInsert('facilities', facilities)
  counters.facilities = insertedFacilities.length
  const facilityIdByName = new Map(
    insertedFacilities.map((f: Record<string, unknown>) => [
      String(f.name),
      String(f.id),
    ])
  )

  // ── Demo Users ─────────────────────────────────────────────
  const userIds = await createDemoUsers(facilityIdByName)
  counters.users = Object.keys(userIds).length

  // ── Equipment ──────────────────────────────────────────────
  const equipmentSeed: EquipmentSeed[] = [
    { name: 'CNC Machine #1', type: 'CNC Machine', health_score: 92, status: 'healthy', location_zone: 'Zone A', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'CNC Machine #2', type: 'CNC Machine', health_score: 88, status: 'healthy', location_zone: 'Zone A', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'CNC Machine #3', type: 'CNC Machine', health_score: 54, status: 'warning', location_zone: 'Zone B', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'CNC Machine #4', type: 'CNC Machine', health_score: 31, status: 'critical', location_zone: 'Zone B', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Air Compressor #1', type: 'Compressor', health_score: 95, status: 'healthy', location_zone: 'Zone A', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Air Compressor #2', type: 'Compressor', health_score: 22, status: 'critical', location_zone: 'Zone C', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Hydraulic Press #1', type: 'Hydraulic Press', health_score: 67, status: 'warning', location_zone: 'Zone B', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Conveyor Belt #1', type: 'Conveyor', health_score: 90, status: 'healthy', location_zone: 'Zone A', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Conveyor Belt #2', type: 'Conveyor', health_score: 85, status: 'healthy', location_zone: 'Zone C', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Conveyor Belt #3', type: 'Conveyor', health_score: 58, status: 'warning', location_zone: 'Zone C', facilityName: 'Riverside Manufacturing Plant' },
    { name: 'Motor #1', type: 'Motor', health_score: 78, status: 'healthy', location_zone: 'Zone A', facilityName: 'Lakewood Assembly Center' },
    { name: 'Motor #2', type: 'Motor', health_score: 28, status: 'critical', location_zone: 'Zone B', facilityName: 'Lakewood Assembly Center' },
    { name: 'Generator #1', type: 'Generator', health_score: 94, status: 'healthy', location_zone: 'Zone A', facilityName: 'Lakewood Assembly Center' },
    { name: 'Generator #2', type: 'Generator', health_score: 91, status: 'healthy', location_zone: 'Zone A', facilityName: 'Lakewood Assembly Center' },
    { name: 'Industrial Pump #1', type: 'Pump', health_score: 72, status: 'healthy', location_zone: 'Zone B', facilityName: 'Lakewood Assembly Center' },
    { name: 'Industrial Pump #2', type: 'Pump', health_score: 48, status: 'warning', location_zone: 'Zone B', facilityName: 'Lakewood Assembly Center' },
    { name: 'Conveyor Belt #4', type: 'Conveyor', health_score: 82, status: 'healthy', location_zone: 'Zone A', facilityName: 'Lakewood Assembly Center' },
    { name: 'Hydraulic Press #2', type: 'Hydraulic Press', health_score: 61, status: 'warning', location_zone: 'Zone B', facilityName: 'Lakewood Assembly Center' },
  ]

  const installStart = new Date('2018-01-01T00:00:00.000Z')
  const installEnd = new Date('2023-12-31T23:59:59.000Z')
  const maintenanceStart = daysAgo(180)
  const maintenanceEnd = new Date()

  const equipmentRows = equipmentSeed
    .map((e) => {
      const facilityId = facilityIdByName.get(e.facilityName)
      if (!facilityId) return null
      return {
        facility_id: facilityId,
        name: e.name,
        type: e.type,
        model: `${e.type} Mk-${randInt(2, 9)}`,
        serial_number: `SN-${randInt(100000, 999999)}`,
        location_zone: e.location_zone,
        install_date: randomDateBetween(installStart, installEnd).toISOString().slice(0, 10),
        health_score: e.health_score,
        status: e.status,
        last_maintenance: randomDateBetween(maintenanceStart, maintenanceEnd).toISOString().slice(0, 10),
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

  const insertedEquipment = await safeInsert('equipment', equipmentRows)
  counters.equipment = insertedEquipment.length

  const equipmentIdByName = new Map(
    insertedEquipment.map((e: Record<string, unknown>) => [
      String(e.name),
      String(e.id),
    ])
  )
  const equipmentStatusById = new Map(
    insertedEquipment.map((e: Record<string, unknown>) => [
      String(e.id),
      String(e.status) as 'healthy' | 'warning' | 'critical',
    ])
  )
  const equipmentTypeById = new Map(
    insertedEquipment.map((e: Record<string, unknown>) => [String(e.id), String(e.type)])
  )

  const sensorRows: SensorSeed[] = []
  for (const equipment of insertedEquipment) {
    const equipmentId = String(equipment.id)
    const equipmentType = equipmentTypeById.get(equipmentId) ?? 'Unknown'
    const blueprint = buildSensorBlueprint(equipmentType)
    for (const b of blueprint) {
      sensorRows.push({
        equipment_id: equipmentId,
        type: b.type,
        unit: b.unit,
        min_threshold: b.min_threshold,
        max_threshold: b.max_threshold,
        is_active: b.is_active,
      })
    }
  }

  const insertedSensors = await safeInsert('sensors', sensorRows)
  counters.sensors = insertedSensors.length

  const readingRows: Record<string, unknown>[] = []
  const totalPerSensor = 50
  for (const sensor of insertedSensors) {
    const sensorId = String(sensor.id)
    const equipmentId = String(sensor.equipment_id)
    const sensorType = String(sensor.type)
    const minThreshold = Number(sensor.min_threshold ?? 0)
    const maxThreshold = Number(sensor.max_threshold ?? (sensorType === 'rpm' ? 3600 : 100))
    const equipmentStatus = equipmentStatusById.get(equipmentId) ?? 'healthy'

    for (let i = 0; i < totalPerSensor; i += 1) {
      const pct = i / Math.max(totalPerSensor - 1, 1)
      const recordedAt = new Date(daysAgo(30).getTime() + pct * 30 * 24 * 60 * 60 * 1000)
      const value = generateReadingValue(
        { type: sensorType, min_threshold: minThreshold, max_threshold: maxThreshold },
        equipmentStatus,
        i,
        totalPerSensor
      )
      const isAnomaly = value > maxThreshold * 0.8

      readingRows.push({
        sensor_id: sensorId,
        equipment_id: equipmentId,
        value: Number(value.toFixed(sensorType === 'rpm' ? 0 : 2)),
        is_anomaly: isAnomaly,
        recorded_at: recordedAt.toISOString(),
      })
    }
  }

  const insertedReadings = await safeInsertBatched('sensor_readings', readingRows, 400)
  counters.sensor_readings = insertedReadings.length

  const predictionSeed = [
    { equipment: 'CNC Machine #4', failure_type: 'Bearing Failure', confidence: 87, days_until_failure: 12, severity: 'high', status: 'active', factors: ['Vibration increase 340%', 'Temperature above baseline', 'Age: 6 years'], action: 'Replace main bearing assembly' },
    { equipment: 'Air Compressor #2', failure_type: 'Motor Overheating', confidence: 92, days_until_failure: 5, severity: 'critical', status: 'active', factors: ['Temperature spike detected', 'RPM fluctuation', 'Coolant flow reduced'], action: 'Emergency motor inspection required' },
    { equipment: 'Conveyor Belt #3', failure_type: 'Belt Wear', confidence: 65, days_until_failure: 30, severity: 'medium', status: 'active', factors: ['Vibration pattern change', 'Belt age exceeds recommendation'], action: 'Schedule belt replacement' },
    { equipment: 'Hydraulic Press #1', failure_type: 'Seal Degradation', confidence: 71, days_until_failure: 21, severity: 'medium', status: 'active', factors: ['Pressure drop pattern', 'Increased cycle time'], action: 'Inspect hydraulic seals' },
    { equipment: 'Motor #2', failure_type: 'Winding Failure', confidence: 89, days_until_failure: 8, severity: 'high', status: 'active', factors: ['Temperature increase 280%', 'Vibration harmonics change', 'Current draw spike'], action: 'Motor rewinding or replacement' },
    { equipment: 'Industrial Pump #2', failure_type: 'Impeller Damage', confidence: 58, days_until_failure: 45, severity: 'low', status: 'active', factors: ['Slight vibration increase', 'Flow rate variance'], action: 'Monitor closely, schedule inspection' },
    { equipment: 'Hydraulic Press #2', failure_type: 'Valve Malfunction', confidence: 73, days_until_failure: 18, severity: 'medium', status: 'active', factors: ['Pressure irregularity', 'Response time delay'], action: 'Replace control valve' },
    { equipment: 'CNC Machine #3', failure_type: 'Spindle Misalignment', confidence: 66, days_until_failure: 25, severity: 'medium', status: 'active', factors: ['Vibration pattern shift', 'Surface finish degradation'], action: 'Realign spindle assembly' },
  ]

  const predictionRows = predictionSeed
    .map((p) => {
      const equipmentId = equipmentIdByName.get(p.equipment)
      if (!equipmentId) return null
      return {
        equipment_id: equipmentId,
        failure_type: p.failure_type,
        confidence: p.confidence,
        predicted_failure_date: daysFromNow(p.days_until_failure).toISOString(),
        days_until_failure: p.days_until_failure,
        severity: p.severity,
        contributing_factors: p.factors,
        recommended_action: p.action,
        status: p.status,
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

  const insertedPredictions = await safeInsert('predictions', predictionRows)
  counters.predictions = insertedPredictions.length

  const predictionIdByKey = new Map(
    insertedPredictions.map((p: Record<string, unknown>) => [
      `${String(p.equipment_id)}::${String(p.failure_type)}`,
      String(p.id),
    ])
  )

  const now = Date.now()
  const alerts: AlertSeed[] = [
    { equipmentName: 'CNC Machine #4', type: 'anomaly', severity: 'critical', title: 'Vibration threshold exceeded', message: 'Severe vibration detected above safety threshold.', status: 'new', created_at: new Date(now - 5 * 60 * 1000).toISOString() },
    { equipmentName: 'Air Compressor #2', type: 'anomaly', severity: 'critical', title: 'Temperature spike detected', message: 'Temperature rapidly increased beyond operating range.', status: 'new', created_at: new Date(now - 12 * 60 * 1000).toISOString() },
    { equipmentName: 'Motor #2', type: 'anomaly', severity: 'critical', title: 'Winding temp critical', message: 'Motor winding temperature is at critical limit.', status: 'acknowledged', created_at: new Date(now - 60 * 60 * 1000).toISOString(), acknowledged_at: new Date(now - 45 * 60 * 1000).toISOString() },

    { equipmentName: 'Hydraulic Press #1', type: 'performance', severity: 'major', title: 'Pressure fluctuation', message: 'Hydraulic pressure instability detected during cycles.', status: 'new', created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Conveyor Belt #3', type: 'maintenance', severity: 'major', title: 'Belt wear detected', message: 'Wear pattern suggests replacement window approaching.', status: 'new', created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Industrial Pump #2', type: 'performance', severity: 'major', title: 'Flow variance', message: 'Flow rate variance beyond normal range.', status: 'acknowledged', created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(), acknowledged_at: new Date(now - 4.5 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'CNC Machine #3', type: 'anomaly', severity: 'major', title: 'Spindle vibration', message: 'Spindle vibration pattern shifted from baseline.', status: 'resolved', created_at: new Date(now - 6 * 60 * 60 * 1000).toISOString() },

    { equipmentName: 'Conveyor Belt #1', type: 'maintenance', severity: 'minor', title: 'Lubrication reminder', message: 'Scheduled lubrication due in next cycle.', status: 'new', created_at: new Date(now - 7 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Generator #2', type: 'maintenance', severity: 'minor', title: 'Calibration due', message: 'Sensor calibration due within 48 hours.', status: 'new', created_at: new Date(now - 9 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'CNC Machine #2', type: 'maintenance', severity: 'minor', title: 'Tooling check reminder', message: 'Routine tooling check recommended.', status: 'acknowledged', created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(), acknowledged_at: new Date(now - 11 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Generator #1', type: 'maintenance', severity: 'minor', title: 'Filter replacement due', message: 'Generator filter reaches service interval soon.', status: 'resolved', created_at: new Date(now - 18 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Industrial Pump #1', type: 'maintenance', severity: 'minor', title: 'Routine inspection reminder', message: 'Inspection checklist scheduled for today.', status: 'new', created_at: new Date(now - 22 * 60 * 60 * 1000).toISOString() },

    { equipmentName: 'Conveyor Belt #4', type: 'info', severity: 'info', title: 'Routine maintenance due', message: 'Weekly maintenance window starts tomorrow.', status: 'resolved', created_at: new Date(now - 28 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Hydraulic Press #2', type: 'info', severity: 'info', title: 'Inspection scheduled', message: 'Technician visit scheduled for next shift.', status: 'acknowledged', created_at: new Date(now - 36 * 60 * 60 * 1000).toISOString(), acknowledged_at: new Date(now - 30 * 60 * 60 * 1000).toISOString() },
    { equipmentName: 'Air Compressor #1', type: 'info', severity: 'info', title: 'Calibration complete', message: 'Temperature and vibration sensors calibrated.', status: 'new', created_at: new Date(now - 47 * 60 * 60 * 1000).toISOString() },
  ]

  const alertRows = alerts
    .map((a) => {
      const equipmentId = equipmentIdByName.get(a.equipmentName)
      if (!equipmentId) return null
      return {
        equipment_id: equipmentId,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        status: a.status,
        acknowledged_at: a.acknowledged_at ?? null,
        created_at: a.created_at,
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

  const insertedAlerts = await safeInsert('alerts', alertRows)
  counters.alerts = insertedAlerts.length

  const alertIdByTitle = new Map(
    insertedAlerts.map((a: Record<string, unknown>) => [String(a.title), String(a.id)])
  )

  const workOrders: WorkOrderSeed[] = [
    {
      equipmentName: 'CNC Machine #4',
      predictionEquipmentName: 'CNC Machine #4',
      predictionFailureType: 'Bearing Failure',
      title: 'Urgent: Replace CNC #4 main bearing',
      description: 'Failure model indicates imminent bearing failure. Replace assembly and realign spindle.',
      priority: 'urgent',
      status: 'open',
      assigned_to_name: null,
      due_date: daysFromNow(2).toISOString(),
      completed_at: null,
      estimated_cost: 4200,
      actual_cost: null,
      notes: 'Requires production line downtime coordination.',
    },
    {
      equipmentName: 'Air Compressor #2',
      predictionEquipmentName: 'Air Compressor #2',
      predictionFailureType: 'Motor Overheating',
      title: 'Emergency compressor motor inspection',
      description: 'Investigate overheating and coolant flow reduction. Prepare replacement motor if needed.',
      priority: 'urgent',
      status: 'open',
      assigned_to_name: null,
      due_date: daysFromNow(1).toISOString(),
      completed_at: null,
      estimated_cost: 5000,
      actual_cost: null,
    },
    {
      equipmentName: 'Motor #2',
      predictionEquipmentName: 'Motor #2',
      predictionFailureType: 'Winding Failure',
      title: 'Plan rewinding for Motor #2',
      description: 'Confirm winding integrity and schedule rewinding or motor replacement.',
      priority: 'urgent',
      status: 'open',
      assigned_to_name: null,
      due_date: daysFromNow(3).toISOString(),
      completed_at: null,
      estimated_cost: 3600,
      actual_cost: null,
    },
    {
      equipmentName: 'Hydraulic Press #1',
      alertTitle: 'Pressure fluctuation',
      title: 'Diagnose pressure fluctuation in Press #1',
      description: 'Inspect seals, pressure valves, and fluid condition under load.',
      priority: 'high',
      status: 'in_progress',
      assigned_to_name: 'Mike Torres',
      due_date: daysFromNow(4).toISOString(),
      completed_at: null,
      estimated_cost: 1850,
      actual_cost: null,
    },
    {
      equipmentName: 'Conveyor Belt #3',
      alertTitle: 'Belt wear detected',
      title: 'Replace worn belt section - Conveyor #3',
      description: 'Replace worn segment and recalibrate tracking alignment.',
      priority: 'high',
      status: 'in_progress',
      assigned_to_name: 'Sarah Chen',
      due_date: daysFromNow(6).toISOString(),
      completed_at: null,
      estimated_cost: 900,
      actual_cost: null,
    },
    {
      equipmentName: 'Industrial Pump #2',
      alertTitle: 'Flow variance',
      title: 'Investigate impeller flow variance',
      description: 'Check impeller wear and cavitation signatures.',
      priority: 'high',
      status: 'in_progress',
      assigned_to_name: 'Mike Torres',
      due_date: daysFromNow(7).toISOString(),
      completed_at: null,
      estimated_cost: 1400,
      actual_cost: null,
    },
    {
      equipmentName: 'Conveyor Belt #1',
      title: 'Routine preventive maintenance - Conveyor #1',
      description: 'Completed scheduled lubrication and tension calibration.',
      priority: 'medium',
      status: 'completed',
      assigned_to_name: 'Sarah Chen',
      due_date: daysAgo(10).toISOString(),
      completed_at: daysAgo(8).toISOString(),
      estimated_cost: 300,
      actual_cost: 260,
    },
    {
      equipmentName: 'Generator #1',
      title: 'Generator #1 monthly inspection',
      description: 'Completed monthly checks and filter replacement.',
      priority: 'medium',
      status: 'completed',
      assigned_to_name: 'Mike Torres',
      due_date: daysAgo(9).toISOString(),
      completed_at: daysAgo(7).toISOString(),
      estimated_cost: 650,
      actual_cost: 610,
    },
    {
      equipmentName: 'CNC Machine #2',
      title: 'Cancelled: spindle vibration follow-up',
      description: 'Alert identified as transient noise after recalibration.',
      priority: 'low',
      status: 'cancelled',
      assigned_to_name: 'Sarah Chen',
      due_date: daysAgo(2).toISOString(),
      completed_at: null,
      estimated_cost: 400,
      actual_cost: null,
      notes: 'False alarm from temporary sensor jitter.',
    },
    {
      equipmentName: 'Generator #2',
      title: 'Cancelled: coolant pressure recheck',
      description: 'Manual verification showed readings within tolerance.',
      priority: 'low',
      status: 'cancelled',
      assigned_to_name: 'Mike Torres',
      due_date: daysAgo(1).toISOString(),
      completed_at: null,
      estimated_cost: 250,
      actual_cost: null,
      notes: 'No mechanical issue detected.',
    },
  ]

  const workOrderRows = workOrders
    .map((w) => {
      const equipmentId = equipmentIdByName.get(w.equipmentName)
      if (!equipmentId) return null

      let predictionId: string | null = null
      if (w.predictionEquipmentName && w.predictionFailureType) {
        const pEquipId = equipmentIdByName.get(w.predictionEquipmentName)
        if (pEquipId) {
          predictionId = predictionIdByKey.get(`${pEquipId}::${w.predictionFailureType}`) ?? null
        }
      }

      const alertId = w.alertTitle ? alertIdByTitle.get(w.alertTitle) ?? null : null

      // Resolve user IDs for assigned_to and created_by
      const assignedTo = w.assigned_to_name ? userIds[w.assigned_to_name] ?? null : null
      const createdBy = userIds['David Chen'] ?? null

      return {
        equipment_id: equipmentId,
        prediction_id: predictionId,
        alert_id: alertId,
        title: w.title,
        description: w.description,
        priority: w.priority,
        status: w.status,
        assigned_to: assignedTo,
        assigned_to_name: w.assigned_to_name,
        created_by: createdBy,
        due_date: w.due_date,
        completed_at: w.completed_at,
        notes: w.notes ?? null,
        estimated_cost: w.estimated_cost,
        actual_cost: w.actual_cost,
        created_at: w.created_at ?? daysAgo(randInt(1, 20)).toISOString(),
        updated_at: w.updated_at ?? new Date().toISOString(),
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

  const insertedWorkOrders = await safeInsert('work_orders', workOrderRows)
  counters.work_orders = insertedWorkOrders.length

  const workOrderIdByTitle = new Map(
    insertedWorkOrders.map((w: Record<string, unknown>) => [String(w.title), String(w.id)])
  )

  const maintenanceSeed: MaintenanceSeed[] = [
    {
      equipmentName: 'CNC Machine #1',
      workOrderTitle: 'Routine preventive maintenance - Conveyor #1',
      type: 'preventive',
      description: 'Spindle lubrication and calibration completed.',
      performed_by_name: 'Mike Torres',
      cost: 580,
      downtime_hours: 2.1,
      performed_at: daysAgo(20).toISOString(),
    },
    {
      equipmentName: 'Air Compressor #1',
      type: 'preventive',
      description: 'Filter replacement and pressure valve inspection.',
      performed_by_name: 'Sarah Chen',
      cost: 430,
      downtime_hours: 1.3,
      performed_at: daysAgo(40).toISOString(),
    },
    {
      equipmentName: 'Hydraulic Press #1',
      type: 'corrective',
      description: 'Seal replacement after pressure instability warning.',
      performed_by_name: 'Mike Torres',
      cost: 1820,
      downtime_hours: 4.4,
      performed_at: daysAgo(55).toISOString(),
    },
    {
      equipmentName: 'Conveyor Belt #3',
      type: 'predictive',
      description: 'Replaced belt section based on vibration trend analytics.',
      performed_by_name: 'Sarah Chen',
      cost: 910,
      downtime_hours: 3.2,
      performed_at: daysAgo(70).toISOString(),
    },
    {
      equipmentName: 'Generator #1',
      workOrderTitle: 'Generator #1 monthly inspection',
      type: 'preventive',
      description: 'Monthly generator inspection and load test.',
      performed_by_name: 'Mike Torres',
      cost: 620,
      downtime_hours: 1.8,
      performed_at: daysAgo(85).toISOString(),
    },
    {
      equipmentName: 'Motor #1',
      type: 'corrective',
      description: 'Bearing replacement after noise escalation.',
      performed_by_name: 'Sarah Chen',
      cost: 2400,
      downtime_hours: 6.0,
      performed_at: daysAgo(110).toISOString(),
    },
    {
      equipmentName: 'Industrial Pump #2',
      type: 'predictive',
      description: 'Impeller alignment tuned after flow variance trend.',
      performed_by_name: 'Mike Torres',
      cost: 1350,
      downtime_hours: 2.7,
      performed_at: daysAgo(140).toISOString(),
    },
    {
      equipmentName: 'Hydraulic Press #2',
      type: 'preventive',
      description: 'Control valve preventive replacement and test.',
      performed_by_name: 'Sarah Chen',
      cost: 3200,
      downtime_hours: 7.2,
      performed_at: daysAgo(165).toISOString(),
    },
  ]

  const maintenanceRows = maintenanceSeed
    .map((m) => {
      const equipmentId = equipmentIdByName.get(m.equipmentName)
      if (!equipmentId) return null
      const workOrderId = m.workOrderTitle ? workOrderIdByTitle.get(m.workOrderTitle) ?? null : null
      return {
        equipment_id: equipmentId,
        work_order_id: workOrderId,
        type: m.type,
        description: m.description,
        performed_by_name: m.performed_by_name,
        cost: m.cost,
        downtime_hours: m.downtime_hours,
        performed_at: m.performed_at,
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

  const insertedMaintenance = await safeInsert('maintenance_history', maintenanceRows)
  counters.maintenance_history = insertedMaintenance.length

  console.log('\nSeed complete:')
  console.table(counters)
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed script failed:', error)
    process.exit(1)
  })
