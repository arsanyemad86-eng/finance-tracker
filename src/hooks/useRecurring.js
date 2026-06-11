import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fintrack_recurring'
const FIRED_KEY = 'fintrack_recurring_fired'

function advanceDate(dateStr, frequency) {
  const d = new Date(dateStr)
  if (frequency === 'daily') d.setDate(d.getDate() + 1)
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

export function useRecurring(addTransaction) {
  const [rules, setRules] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [firedToday, setFiredToday] = useState(() => {
    try {
      const stored = localStorage.getItem(FIRED_KEY)
      if (!stored) return 0
      const data = JSON.parse(stored)
      const today = new Date().toISOString().slice(0, 10)
      return data.date === today ? data.count : 0
    } catch {
      return 0
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  }, [rules])

  // On mount: fire any rules whose nextDate has arrived
  useEffect(() => {
    if (typeof addTransaction !== 'function') return

    const today = new Date().toISOString().slice(0, 10)
    let firedCount = 0

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync of due rules against localStorage on mount
    setRules(prev => prev.map(rule => {
      if (!rule.active) return rule
      let nextDate = rule.nextDate
      while (nextDate <= today) {
        addTransaction({
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          date: nextDate,
          note: rule.note || '',
        })
        firedCount++
        nextDate = advanceDate(nextDate, rule.frequency)
      }
      return { ...rule, nextDate }
    }))

    if (firedCount > 0) {
      const today2 = new Date().toISOString().slice(0, 10)
      localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today2, count: firedCount }))
      setFiredToday(firedCount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addRule = (rule) => {
    const newRule = {
      id: Date.now(),
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      note: rule.note || '',
      frequency: rule.frequency,
      nextDate: rule.nextDate,
      active: true,
      createdAt: new Date().toISOString(),
    }
    setRules(prev => [newRule, ...prev])
  }

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  return { rules, addRule, deleteRule, toggleRule, firedToday }
}
