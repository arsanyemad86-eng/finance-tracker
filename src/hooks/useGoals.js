import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fintrack_goals'

export function useGoals() {
  const [goals, setGoals] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  const addGoal = (goal) => {
    const newGoal = {
      id: Date.now(),
      title: goal.title,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount || 0,
      deadline: goal.deadline || null,
      emoji: goal.emoji || '🎯',
      createdAt: new Date().toISOString(),
    }
    setGoals(prev => [newGoal, ...prev])
  }

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const addFunds = (id, amount) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g))
    )
  }

  const editGoal = (id, updatedData) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updatedData } : g))
    )
  }

  return { goals, addGoal, deleteGoal, addFunds, editGoal }
}
