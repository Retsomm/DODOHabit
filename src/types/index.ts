export type BitternessSource = 'self-initiated' | 'over-working' | 'both' | 'none'

export interface SplenicData {
  hadIntuition: boolean
  description: string
  trusted: boolean
  outcome: string
}

export interface InvestigationData {
  topic: string
  findings: string
}

export interface ExperimentData {
  whatFailed: string
  dataLearned: string
}

export interface DikwData {
  situation: string
  task: string
  action: string
  result: string
  controllable: string
  uncontrollable: string
  wisdomAction: string
}

export interface DailyEntry {
  id: string
  date: string
  successScore: number
  bitternessScore: number
  successMoment: string
  bitternessSource: BitternessSource
  emotionalState: string
  splenic: SplenicData
  investigation: InvestigationData
  experiment: ExperimentData
  dikw: DikwData
  createdAt: string
  updatedAt: string
}

export type ViewType = 'reflection' | 'dashboard' | 'history' | 'profile'
