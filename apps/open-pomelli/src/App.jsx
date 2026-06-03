import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Card, CardBody,
  CardHeader, Badge, Progress, useToast, IconButton, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  SimpleGrid, Divider, Avatar, Stat, StatLabel, StatNumber, StatHelpText
} from '@chakra-ui/react'
import { supabase, savePomodoroSession, getDailyStats } from './lib/supabase'
import { chatCompletion } from './lib/openai'

const POMODORO_STATES = {
  IDLE: 'idle',
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'long_break'
}

const PRESETS = [
  { name: 'Classic', work: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
  { name: 'Quick', work: 15, shortBreak: 3, longBreak: 10, sessions: 4 },
  { name: 'Extended', work: 50, shortBreak: 10, longBreak: 30, sessions: 4 },
  { name: 'Focus', work: 90, shortBreak: 15, longBreak: 45, sessions: 3 },
]

const TASKS = [
  { id: 1, text: 'Design new feature', completed: false, pomodoros: 0, estimated: 2 },
  { id: 2, text: 'Review PRs', completed: false, pomodoros: 1, estimated: 1 },
  { id: 3, text: 'Write documentation', completed: false, pomodoros: 0, estimated: 3 },
  { id: 4, text: 'Team meeting', completed: true, pomodoros: 1, estimated: 1 },
]

function PomodoroTimer({ preset, onComplete, onPause, isPaused }) {
  const [timeLeft, setTimeLeft] = useState(preset.work * 60)
  const [state, setState] = useState(POMODORO_STATES.IDLE)
  const [sessions, setSessions] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const toast = useToast()

  useEffect(() => {
    let interval = null
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isPaused, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      handleTimerComplete()
    }
  }, [timeLeft])

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    if (state === POMODORO_STATES.WORK) {
      const newSessions = sessions + 1
      setSessions(newSessions)
      onComplete()

      if (newSessions % preset.sessions === 0) {
        setState(POMODORO_STATES.LONG_BREAK)
        setTimeLeft(preset.longBreak * 60)
        toast({
          title: '🎉 Session Complete!',
          description: 'Time for a long break!',
          status: 'success',
          duration: 5000
        })
      } else {
        setState(POMODORO_STATES.BREAK)
        setTimeLeft(preset.shortBreak * 60)
        toast({
          title: '✅ Work Session Complete!',
          description: 'Take a short break',
          status: 'success',
          duration: 3000
        })
      }
    } else {
      setState(POMODORO_STATES.WORK)
      setTimeLeft(preset.work * 60)
      toast({
        title: 'Break Over!',
        description: 'Ready for another session?',
        status: 'info',
        duration: 3000
      })
    }
  }, [state, sessions, preset])

  const startTimer = () => {
    if (state === POMODORO_STATES.IDLE) {
      setState(POMODORO_STATES.WORK)
      setTimeLeft(preset.work * 60)
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
    onPause()
  }

  const resetTimer = () => {
    setIsRunning(false)
    setState(POMODORO_STATES.IDLE)
    setTimeLeft(preset.work * 60)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStateColor = () => {
    switch (state) {
      case POMODORO_STATES.WORK: return 'red'
      case POMODORO_STATES.BREAK: return 'green'
      case POMODORO_STATES.LONG_BREAK: return 'blue'
      default: return 'gray'
    }
  }

  const getStateLabel = () => {
    switch (state) {
      case POMODORO_STATES.WORK: return 'Focus Time'
      case POMODORO_STATES.BREAK: return 'Short Break'
      case POMODORO_STATES.LONG_BREAK: return 'Long Break'
      default: return 'Ready to Focus'
    }
  }

  const totalTime = state === POMODORO_STATES.WORK ? preset.work * 60 :
                    state === POMODORO_STATES.BREAK ? preset.shortBreak * 60 :
                    state === POMODORO_STATES.LONG_BREAK ? preset.longBreak * 60 : preset.work * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <VStack spacing={6}>
      <Badge colorScheme={getStateColor()} fontSize="lg" px={4} py={2}>
        {getStateLabel()}
      </Badge>

      <Box position="relative" w="300px" h="300px">
        <Progress
          value={progress}
          size="300px"
          w="300px"
          h="300px"
          colorScheme={getStateColor()}
          borderRadius="full"
          variant="solid"
          position="absolute"
        />
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          align="center"
          justify="center"
          direction="column"
        >
          <Text fontSize="6xl" fontWeight="bold" fontFamily="mono">
            {formatTime(timeLeft)}
          </Text>
          <Text color="gray.400">Session {sessions + 1}</Text>
        </Flex>
      </Box>

      <HStack spacing={4}>
        {!isRunning ? (
          <Button colorScheme="red" size="lg" onClick={startTimer}>
            {state === POMODORO_STATES.IDLE ? 'Start' : 'Resume'}
          </Button>
        ) : (
          <Button colorScheme="orange" size="lg" onClick={pauseTimer}>
            Pause
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={resetTimer}>
          Reset
        </Button>
      </HStack>

      <HStack spacing={2}>
        {[...Array(preset.sessions)].map((_, i) => (
          <Box
            key={i}
            w="12px"
            h="12px"
            borderRadius="full"
            bg={i < sessions ? 'green.400' : 'gray.600'}
          />
        ))}
      </HStack>
    </VStack>
  )
}

function TaskList({ tasks, onToggle, onUpdatePomodoros }) {
  return (
    <VStack spacing={2} align="stretch">
      {tasks.map(task => (
        <Flex
          key={task.id}
          p={3}
          bg="gray.700"
          borderRadius="md"
          align="center"
          gap={3}
          opacity={task.completed ? 0.5 : 1}
        >
          <Box
            w="20px"
            h="20px"
            borderRadius="md"
            border="2px solid"
            borderColor={task.completed ? 'green.400' : 'gray.500'}
            bg={task.completed ? 'green.400' : 'transparent'}
            cursor="pointer"
            onClick={() => onToggle(task.id)}
          />
          <Box flex={1}>
            <Text decoration={task.completed ? 'line-through' : 'none'}>{task.text}</Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="purple">{task.pomodoros}/{task.estimated} 🍅</Badge>
            </HStack>
          </Box>
        </Flex>
      ))}
    </VStack>
  )
}

function AIAssistant({ onSuggestion }) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleAsk = async () => {
    if (!prompt) return
    setIsLoading(true)
    try {
      const suggestion = await chatCompletion(
        `As a productivity assistant, suggest a task or activity for a pomodoro session focused on: ${prompt}`
      )
      onSuggestion(suggestion)
      toast({ title: 'Got suggestion!', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Text fontWeight="bold">🤖 AI Productivity Assistant</Text>
          <HStack>
            <Select placeholder="Quick prompts" size="sm" bg="gray.700">
              <option value="deepwork">Deep work session</option>
              <option value="creative">Creative work</option>
              <option value="admin">Administrative tasks</option>
              <option value="learning">Learning & study</option>
            </Select>
          </HStack>
          <HStack>
            <Button size="sm" colorScheme="blue" onClick={handleAsk} isLoading={isLoading}>
              Get Suggestion
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

function App() {
  const [preset, setPreset] = useState(PRESETS[0])
  const [tasks, setTasks] = useState(TASKS)
  const [selectedPreset, setSelectedPreset] = useState('Classic')
  const [dailySessions, setDailySessions] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [streak, setStreak] = useState(7)
  const toast = useToast()

  const handleSessionComplete = () => {
    setDailySessions(s => s + 1)
    setTotalMinutes(m => m + preset.work)
  }

  const handlePause = () => {
    toast({ title: 'Timer paused', status: 'info', duration: 2000 })
  }

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
  }

  const handleSuggestion = (suggestion) => {
    const newTask = {
      id: Date.now(),
      text: suggestion,
      completed: false,
      pomodoros: 0,
      estimated: 1
    }
    setTasks([newTask, ...tasks])
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🍅 Open Pomelli</Text>
            <Badge colorScheme="green">Supabase</Badge>
          </HStack>
          <HStack spacing={4}>
            <Badge colorScheme="purple">🔥 {streak} day streak</Badge>
            <Badge colorScheme="blue">Today: {dailySessions} sessions</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px" p={6} gap={6}>
        <Box flex={1}>
          <Card bg="gray.800" mb={6}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="bold">Pomodoro Timer</Text>
                <Select
                  value={selectedPreset}
                  onChange={e => {
                    setSelectedPreset(e.target.value)
                    setPreset(PRESETS.find(p => p.name === e.target.value))
                  }}
                  w="200px"
                  bg="gray.700"
                >
                  {PRESETS.map(p => (
                    <option key={p.name} value={p.name}>{p.name} ({p.work}/{p.shortBreak})</option>
                  ))}
                </Select>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex justify="center">
                <PomodoroTimer
                  preset={preset}
                  onComplete={handleSessionComplete}
                  onPause={handlePause}
                  isPaused={false}
                />
              </Flex>
            </CardBody>
          </Card>

          <AIAssistant onSuggestion={handleSuggestion} />
        </Box>

        <Box w="350px">
          <Card bg="gray.800" mb={4}>
            <CardHeader>
              <Text fontWeight="bold">Today's Stats</Text>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Sessions</StatLabel>
                  <StatNumber>{dailySessions}</StatNumber>
                  <StatHelpText>Croodoro sessions</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Focus Time</StatLabel>
                  <StatNumber>{totalMinutes}m</StatNumber>
                  <StatHelpText>Total focus</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Tasks Done</StatLabel>
                  <StatNumber>{tasks.filter(t => t.completed).length}</StatNumber>
                  <StatHelpText>Completed</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Streak</StatLabel>
                  <StatNumber>{streak}</StatNumber>
                  <StatHelpText>Days</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card bg="gray.800">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Tasks</Text>
                <Badge>{tasks.filter(t => !t.completed).length} active</Badge>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <TaskList tasks={tasks} onToggle={handleToggleTask} onUpdatePomodoros={() => {}} />
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  )
}

export default App