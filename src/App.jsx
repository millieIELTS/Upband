import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Writing from './pages/Writing'
import WritingTask from './pages/WritingTask'
import Speaking from './pages/Speaking'
import SpeakingPart1Select from './pages/SpeakingPart1Select'
import SpeakingPart1 from './pages/SpeakingPart1'
import SpeakingPart2 from './pages/SpeakingPart2'
import SpeakingPart3Select from './pages/SpeakingPart3Select'
import SpeakingPart3 from './pages/SpeakingPart3'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import WritingHomework from './pages/WritingHomework'
import WritingHomeworkSelect from './pages/WritingHomeworkSelect'
import MyPage from './pages/MyPage'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:taskType" element={<WritingTask />} />
          <Route path="/writing/homework" element={<WritingHomeworkSelect />} />
          <Route path="/writing/homework/:taskType" element={<WritingHomework />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/speaking/part1" element={<SpeakingPart1Select />} />
          <Route path="/speaking/part1/:topicId" element={<SpeakingPart1 />} />
          <Route path="/speaking/part2" element={<SpeakingPart2 />} />
          <Route path="/speaking/part3" element={<SpeakingPart3Select />} />
          <Route path="/speaking/part3/:topicId" element={<SpeakingPart3 />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
